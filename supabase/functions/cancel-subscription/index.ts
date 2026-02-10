import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");
    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    const { serverId } = await req.json();
    if (!serverId) throw new Error("serverId is required");

    // Look up server and verify ownership
    const { data: server, error: serverError } = await supabaseClient
      .from("server_requests")
      .select("stripe_subscription_id, user_id, server_name")
      .eq("id", serverId)
      .single();

    if (serverError || !server) throw new Error("Server not found");
    if (server.user_id !== userId) throw new Error("Unauthorized");
    if (!server.stripe_subscription_id) throw new Error("No active subscription for this server");

    logStep("Canceling subscription", { subscriptionId: server.stripe_subscription_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const subscription = await stripe.subscriptions.update(server.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    logStep("Subscription set to cancel at period end", {
      cancel_at: subscription.current_period_end,
    });

    // Send confirmation email (non-blocking)
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!resendKey) throw new Error("RESEND_API_KEY not set");

      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      if (profile?.email) {
        const cancelDate = new Date(subscription.current_period_end * 1000);
        const formattedDate = cancelDate.toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        });

        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "SkyServer1508 <noreply@skyserver1508.org>",
          to: [profile.email],
          subject: "Your SkyServer1508 upgrade cancellation is confirmed",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #7c3aed; text-align: center;">Upgrade Cancellation Confirmed</h1>
              <p>Your resource upgrade for <strong>${server.server_name}</strong> has been scheduled for cancellation.</p>
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Server:</strong> ${server.server_name}</p>
                <p style="margin: 8px 0 0;"><strong>Boosts active until:</strong> ${formattedDate}</p>
              </div>
              <p>Your resource boosts will remain fully active until <strong>${formattedDate}</strong>. After that date, they will be removed automatically.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.skyserver1508.org/dashboard"
                   style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Changed your mind? You can re-upgrade anytime from the Server Upgrade page in your dashboard.</p>
            </div>
          `,
        });
        logStep("Cancellation confirmation email sent", { email: profile.email });
      }
    } catch (emailError) {
      logStep("Failed to send cancellation email (non-blocking)", {
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        cancel_at: subscription.current_period_end,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
