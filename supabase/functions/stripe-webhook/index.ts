import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const PRICE_RAM = "price_1Sz653GTSSIIOUojGFw4LyEm";
const PRICE_CPU = "price_1Sz65FGTSSIIOUoje6QD4l9Q";
const PRICE_HEAVY_RAM = "price_1T46tGGTSSIIOUojXUjXTjjO";
const PRICE_HEAVY_CPU = "price_1T46tcGTSSIIOUojfL0vl3xf";

/** Calculate ram/cpu boosts from subscription line items */
function calculateBoosts(items: Stripe.SubscriptionItem[]): { ramBoost: number; cpuBoost: number } {
  let ramBoost = 0;
  let cpuBoost = 0;
  for (const item of items) {
    const priceId = item.price.id;
    const quantity = item.quantity || 0;
    if (priceId === PRICE_RAM) ramBoost = quantity * 1024;
    else if (priceId === PRICE_CPU) cpuBoost = quantity * 100;
    else if (priceId === PRICE_HEAVY_RAM) { ramBoost += 10 * 1024; cpuBoost += 100; }
    else if (priceId === PRICE_HEAVY_CPU) { cpuBoost += 800; ramBoost += 2 * 1024; }
  }
  return { ramBoost, cpuBoost };
}

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return new Response("STRIPE_SECRET_KEY not set", { status: 500 });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) return new Response("STRIPE_WEBHOOK_SECRET not set", { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // --- Signature verification (return 400 on failure) ---
  let event: Stripe.Event;
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Signature verification failed", { message: msg });
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  logStep("Event received", { type: event.type, id: event.id });

  // --- Event processing (always return 200 after this point) ---
  try {
    // ===== checkout.session.completed =====
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // --- Wallet top-up flow ---
      if (session.metadata?.type === "wallet_topup") {
        const userId = session.metadata.userId;
        const amountTotal = (session.amount_total || 0) / 100; // centimes → CHF
        const sessionId = session.id;
        logStep("Wallet top-up detected", { userId, amountTotal, sessionId });

        if (userId && amountTotal > 0) {
          // Check idempotency — skip if already credited
          const { data: existing } = await supabaseClient
            .from("wallet_transactions")
            .select("id")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();

          if (existing) {
            logStep("Wallet top-up already processed, skipping", { sessionId });
          } else {
            // Increment wallet balance
            const { data: profile } = await supabaseClient
              .from("profiles")
              .select("wallet_balance")
              .eq("id", userId)
              .single();

            const currentBalance = Number(profile?.wallet_balance) || 0;
            const newBalance = currentBalance + amountTotal;

            const { error: balanceErr } = await supabaseClient
              .from("profiles")
              .update({ wallet_balance: newBalance })
              .eq("id", userId);

            if (balanceErr) {
              logStep("Wallet balance update error", { error: balanceErr.message });
            } else {
              logStep("Wallet balance updated", { newBalance });
            }

            // Record transaction
            const { error: txErr } = await supabaseClient
              .from("wallet_transactions")
              .insert({
                user_id: userId,
                amount: amountTotal,
                type: "credit",
                description: `Top-up: ${amountTotal.toFixed(2)} CHF (Stripe)`,
                stripe_session_id: sessionId,
              });

            if (txErr) {
              logStep("Wallet transaction insert error", { error: txErr.message });
            } else {
              logStep("Wallet transaction recorded");
            }
          }
        }
      }
      // --- Server upgrade flow ---
      else {
        const serverId = session.metadata?.serverId;
        const subscriptionId = session.subscription as string;

        if (!serverId) {
          logStep("No serverId in metadata, skipping");
        } else {
        logStep("Processing checkout completion", { serverId, subscriptionId });

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { ramBoost, cpuBoost } = calculateBoosts(subscription.items.data);
        logStep("Calculated boosts", { ramBoost, cpuBoost });

        const { error } = await supabaseClient
          .from("server_requests")
          .update({ ram_boost: ramBoost, cpu_boost: cpuBoost, stripe_subscription_id: subscriptionId, boost_status: 'pending' })
          .eq("id", serverId);

        if (error) {
          logStep("DB update error", { error: error.message });
        } else {
          logStep("Server request updated successfully");
        }

        // Send confirmation email (non-blocking)
        try {
          const userId = session.metadata?.userId;
          if (userId) {
            const { data: profile } = await supabaseClient.from("profiles").select("email").eq("id", userId).single();
            const { data: server } = await supabaseClient.from("server_requests").select("server_name").eq("id", serverId).single();

            if (profile?.email) {
              const resendKey = Deno.env.get("RESEND_API_KEY");
              if (resendKey) {
                const resend = new Resend(resendKey);
                const ramText = ramBoost > 0 ? `+${(ramBoost / 1024).toFixed(0)} GB RAM` : "";
                const cpuText = cpuBoost > 0 ? `+${cpuBoost}% CPU` : "";
                const boostDetails = [ramText, cpuText].filter(Boolean).join(" and ");
                const serverName = server?.server_name || "your server";

                await resend.emails.send({
                  from: "SkyServer1508 <noreply@skyserver1508.org>",
                  to: [profile.email],
                  subject: "Your SkyServer1508 upgrade is confirmed!",
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <h1 style="color: #6366f1;">⚡ Upgrade Confirmed!</h1>
                      <p>Great news! Your resource upgrade for <strong>${serverName}</strong> has been confirmed.</p>
                      <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">${boostDetails}</p>
                      </div>
                      <p>Our team will apply the upgraded resources to your server. This may take up to <strong>24 hours</strong>.</p>
                      <p>You can manage your subscription anytime from your <a href="https://skyserver1508.org/dashboard" style="color: #6366f1;">dashboard</a>.</p>
                      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
                      <p style="color: #71717a; font-size: 12px;">SkyServer1508 — Game Server Hosting</p>
                    </div>
                  `,
                });
                logStep("Confirmation email sent", { email: profile.email });
              }
            }
          }
        } catch (emailError) {
          logStep("Email sending failed (non-blocking)", { error: String(emailError) });
        }
        }
      }
    }

    // ===== invoice.payment_succeeded =====
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as any;
      const serverId =
        invoice.subscription_details?.metadata?.serverId ||
        invoice.lines?.data?.[0]?.metadata?.serverId;

      if (!serverId) {
        logStep("invoice.payment_succeeded: no serverId found in metadata, skipping");
      } else {
        logStep("invoice.payment_succeeded: processing", { serverId });

        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const { ramBoost, cpuBoost } = calculateBoosts(subscription.items.data);
          logStep("invoice.payment_succeeded: calculated boosts", { ramBoost, cpuBoost });

          const { error } = await supabaseClient
            .from("server_requests")
            .update({ ram_boost: ramBoost, cpu_boost: cpuBoost, stripe_subscription_id: subscriptionId, boost_status: 'pending' })
            .eq("id", serverId);

          if (error) {
            logStep("invoice.payment_succeeded: DB update error", { error: error.message });
          } else {
            logStep("invoice.payment_succeeded: server boosts confirmed in DB");
          }
        } else {
          logStep("invoice.payment_succeeded: no subscriptionId on invoice, skipping");
        }
      }
    }

    // ===== customer.subscription.deleted =====
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const serverId = subscription.metadata?.serverId;
      const subscriptionId = subscription.id;

      logStep("Subscription deleted", { serverId, subscriptionId });

      // Query server info BEFORE clearing subscription ID
      let serverRow: any = null;
      if (serverId) {
        const { data } = await supabaseClient.from("server_requests").select("user_id, server_name").eq("id", serverId).single();
        serverRow = data;
      } else {
        const { data } = await supabaseClient.from("server_requests").select("user_id, server_name").eq("stripe_subscription_id", subscriptionId).single();
        serverRow = data;
      }

      // Reset boosts
      if (serverId) {
        await supabaseClient.from("server_requests").update({ ram_boost: 0, cpu_boost: 0, stripe_subscription_id: null }).eq("id", serverId);
      } else {
        await supabaseClient.from("server_requests").update({ ram_boost: 0, cpu_boost: 0, stripe_subscription_id: null }).eq("stripe_subscription_id", subscriptionId);
      }

      logStep("Boosts reset for cancelled subscription");

      // Send subscription ended email (non-blocking)
      try {
        if (serverRow?.user_id) {
          const { data: profile } = await supabaseClient.from("profiles").select("email").eq("id", serverRow.user_id).single();

          if (profile?.email) {
            const resendKey = Deno.env.get("RESEND_API_KEY");
            if (resendKey) {
              const resend = new Resend(resendKey);
              const serverName = serverRow.server_name || "your server";

              await resend.emails.send({
                from: "SkyServer1508 <noreply@skyserver1508.org>",
                to: [profile.email],
                subject: "Your SkyServer1508 subscription has ended",
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #6366f1;">Subscription Ended</h1>
                    <p>Your resource upgrade subscription for <strong>${serverName}</strong> has ended.</p>
                    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                      <p style="margin: 0;">Your server resources have been reverted to the free tier.</p>
                    </div>
                    <p>If you'd like to re-upgrade your server, visit your <a href="https://skyserver1508.org/dashboard" style="color: #6366f1;">dashboard</a>.</p>
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
                    <p style="color: #71717a; font-size: 12px;">SkyServer1508 — Game Server Hosting</p>
                  </div>
                `,
              });
              logStep("Subscription ended email sent", { email: profile.email });
            }
          }
        }
      } catch (emailError) {
        logStep("Subscription ended email failed (non-blocking)", { error: String(emailError) });
      }
    }
  } catch (processingError) {
    const msg = processingError instanceof Error ? processingError.message : String(processingError);
    logStep("Processing error (non-fatal)", { message: msg });
  }

  // ALWAYS return 200 for verified events
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
