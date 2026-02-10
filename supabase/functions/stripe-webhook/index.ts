import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
