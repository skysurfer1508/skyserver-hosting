import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find expired active servers — CRITICAL: only where expires_at IS NOT NULL
    const { data: expiredServers, error: fetchError } = await supabaseAdmin
      .from("server_requests")
      .select("id, server_name, user_id, expires_at")
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired servers:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch expired servers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!expiredServers || expiredServers.length === 0) {
      console.log("No expired servers found.");
      return new Response(
        JSON.stringify({ message: "No expired servers", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredServers.length} expired server(s). Setting to rejected.`);

    const expiredIds = expiredServers.map((s) => s.id);

    const { error: updateError } = await supabaseAdmin
      .from("server_requests")
      .update({
        status: "rejected",
        rejection_reason: "Server lease expired automatically.",
      })
      .in("id", expiredIds);

    if (updateError) {
      console.error("Error updating expired servers:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update expired servers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully expired ${expiredIds.length} server(s).`);

    // Send expiration emails (non-blocking)
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const resend = new Resend(resendKey);

        // Get user emails for expired servers
        const userIds = [...new Set(expiredServers.map((s) => s.user_id))];
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("id, email, full_name, username")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        for (const server of expiredServers) {
          const profile = profileMap.get(server.user_id);
          if (!profile?.email) continue;

          try {
            const userName = profile.full_name || profile.username || "there";
            await resend.emails.send({
              from: "SkyServer1508 <noreply@skyserver1508.org>",
              to: [profile.email],
              subject: "⚠️ Your Server has Expired",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #dc2626; text-align: center;">⚠️ Server Expired</h1>
                  <p>Hello ${userName},</p>
                  <p>Your server <strong>'${server.server_name}'</strong> has expired and has been suspended.</p>
                  <p>Please renew it immediately to avoid data loss.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.skyserver1508.org/dashboard"
                       style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Renew Now
                    </a>
                  </div>
                  <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out via Discord.</p>
                </div>
              `,
            });
            console.log(`Expiration email sent to ${profile.email} for server ${server.server_name}`);
          } catch (emailErr) {
            console.error(`Failed to send expiration email to ${profile.email}:`,
              emailErr instanceof Error ? emailErr.message : String(emailErr));
          }
        }
      } else {
        console.warn("RESEND_API_KEY not set, skipping expiration emails");
      }
    } catch (emailError) {
      console.error("Failed to process expiration emails (non-blocking):",
        emailError instanceof Error ? emailError.message : String(emailError));
    }

    return new Response(
      JSON.stringify({ message: "Expired servers processed", count: expiredIds.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Unhandled error in cleanup-expired-servers:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
