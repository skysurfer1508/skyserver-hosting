import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_RAM = "price_1Sz653GTSSIIOUojGFw4LyEm";
const PRICE_CPU = "price_1Sz65FGTSSIIOUoje6QD4l9Q";
const PRICE_HEAVY_RAM = "price_1T46tGGTSSIIOUojXUjXTjjO";
const PRICE_HEAVY_CPU = "price_1T46tcGTSSIIOUojfL0vl3xf";
const COUPON_BULK = "Njo6FIEr";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { ramQuantity, cpuQuantity, serverId, heavyDutyPackage, applyBulkDiscount } = await req.json();
    logStep("Request body", { ramQuantity, cpuQuantity, serverId, heavyDutyPackage, applyBulkDiscount });

    if (!serverId) throw new Error("serverId is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Look up or create Stripe customer
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: user.email });
        customerId = customer.id;
      }
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      logStep("Stripe customer created/linked", { customerId });
    }

    // Build line items based on package type
    const lineItems: any[] = [];
    let discounts: any[] = [];

    if (heavyDutyPackage === 'ram') {
      lineItems.push({ price: PRICE_HEAVY_RAM, quantity: 1 });
    } else if (heavyDutyPackage === 'cpu') {
      lineItems.push({ price: PRICE_HEAVY_CPU, quantity: 1 });
    } else {
      // Custom slider pricing
      if ((!ramQuantity || ramQuantity <= 0) && (!cpuQuantity || cpuQuantity <= 0)) {
        throw new Error("At least one of RAM or CPU quantity must be greater than 0");
      }
      if (ramQuantity && ramQuantity > 0) {
        lineItems.push({ price: PRICE_RAM, quantity: ramQuantity });
      }
      if (cpuQuantity && cpuQuantity > 0) {
        lineItems.push({ price: PRICE_CPU, quantity: cpuQuantity });
      }
      if (applyBulkDiscount) {
        discounts = [{ coupon: COUPON_BULK }];
      }
    }

    const origin = req.headers.get("origin") || "https://skyserver1508.org";

    const sessionParams: any = {
      customer: customerId,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${origin}/dashboard?upgrade=success`,
      cancel_url: `${origin}/dashboard?upgrade=cancelled`,
      metadata: { serverId, userId: user.id },
      subscription_data: {
        metadata: { serverId, userId: user.id },
      },
    };

    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
