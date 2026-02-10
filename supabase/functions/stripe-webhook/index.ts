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

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response("STRIPE_SECRET_KEY not set", { status: 500 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return new Response("STRIPE_WEBHOOK_SECRET not set", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    logStep("Event received", { type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const serverId = session.metadata?.serverId;
      const subscriptionId = session.subscription as string;

      if (!serverId) {
        logStep("No serverId in metadata, skipping");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      logStep("Processing checkout completion", { serverId, subscriptionId });

      // Get subscription to read line items
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      let ramBoost = 0;
      let cpuBoost = 0;

      for (const item of subscription.items.data) {
        const priceId = item.price.id;
        const quantity = item.quantity || 0;
        if (priceId === PRICE_RAM) {
          ramBoost = quantity * 1024; // MB
        } else if (priceId === PRICE_CPU) {
          cpuBoost = quantity * 100; // percentage
        }
      }

      logStep("Calculated boosts", { ramBoost, cpuBoost });

      const { error } = await supabaseClient
        .from("server_requests")
        .update({
          ram_boost: ramBoost,
          cpu_boost: cpuBoost,
          stripe_subscription_id: subscriptionId,
        })
        .eq("id", serverId);

      if (error) {
        logStep("DB update error", { error: error.message });
        throw error;
      }

      logStep("Server request updated successfully");

      // Send confirmation email (non-blocking)
      try {
        const userId = session.metadata?.userId;
        if (userId) {
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("email")
            .eq("id", userId)
            .single();

          const { data: server } = await supabaseClient
            .from("server_requests")
            .select("server_name")
            .eq("id", serverId)
            .single();

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

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const serverId = subscription.metadata?.serverId;
      const subscriptionId = subscription.id;

      logStep("Subscription deleted", { serverId, subscriptionId });

      // Try by metadata first, then by subscription ID
      if (serverId) {
        await supabaseClient
          .from("server_requests")
          .update({ ram_boost: 0, cpu_boost: 0, stripe_subscription_id: null })
          .eq("id", serverId);
      } else {
        await supabaseClient
          .from("server_requests")
          .update({ ram_boost: 0, cpu_boost: 0, stripe_subscription_id: null })
          .eq("stripe_subscription_id", subscriptionId);
      }

      logStep("Boosts reset for cancelled subscription");
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
