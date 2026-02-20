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
    const PTERODACTYL_API_KEY = Deno.env.get("PTERODACTYL_API_KEY");
    const PTERODACTYL_PANEL_URL = Deno.env.get("PTERODACTYL_PANEL_URL");

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
      .select("id, server_name, user_id, expires_at, pterodactyl_server_id")
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

    console.log(`Found ${expiredServers.length} expired server(s). Processing suspension.`);

    // Suspend each server on Pterodactyl panel
    const panelUrl = PTERODACTYL_PANEL_URL?.replace(/\/+$/, "");
    for (const server of expiredServers) {
      if (server.pterodactyl_server_id && PTERODACTYL_API_KEY && panelUrl) {
        try {
          const response = await fetch(
            `${panelUrl}/api/application/servers/${server.pterodactyl_server_id}/suspend`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${PTERODACTYL_API_KEY}`,
                "Accept": "application/json",
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok || response.status === 204) {
            console.log(`Successfully suspended server ${server.pterodactyl_server_id} (${server.server_name}) on panel`);
          } else {
            const errorText = await response.text();
            console.error(`Failed to suspend server ${server.pterodactyl_server_id} on panel (${response.status}):`, errorText);
          }
        } catch (apiError) {
          console.error(`Pterodactyl API error for server ${server.pterodactyl_server_id}:`,
            apiError instanceof Error ? apiError.message : String(apiError));
        }
      } else {
        if (!server.pterodactyl_server_id) {
          console.warn(`No pterodactyl_server_id for server "${server.server_name}" (${server.id}), skipping panel suspend`);
        } else {
          console.warn(`Missing PTERODACTYL_API_KEY or PTERODACTYL_PANEL_URL, skipping panel suspend for server ${server.pterodactyl_server_id}`);
        }
      }
    }

    // Update all expired servers to suspended status
    const expiredIds = expiredServers.map((s) => s.id);

    const { error: updateError } = await supabaseAdmin
      .from("server_requests")
      .update({
        status: "suspended",
        rejection_reason: "Server lease expired -- automatically suspended.",
      })
      .in("id", expiredIds);

    if (updateError) {
      console.error("Error updating expired servers:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update expired servers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully suspended ${expiredIds.length} server(s).`);

    // Send expiration emails (non-blocking)
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const resend = new Resend(resendKey);

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
              subject: "⚠️ Your Server has been Suspended",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #dc2626; text-align: center;">⚠️ Server Suspended</h1>
                  <p>Hello ${userName},</p>
                  <p>Your server <strong>'${server.server_name}'</strong> has expired and has been <strong>suspended</strong>.</p>
                  <p>Your server data is still preserved, but you won't be able to start or access it until it's reactivated.</p>
                  <p>Please contact us via Discord to get your server reactivated.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.skyserver1508.org/dashboard"
                       style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      View Dashboard
                    </a>
                  </div>
                  <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reach out via Discord.</p>
                </div>
              `,
            });
            console.log(`Suspension email sent to ${profile.email} for server ${server.server_name}`);
          } catch (emailErr) {
            console.error(`Failed to send suspension email to ${profile.email}:`,
              emailErr instanceof Error ? emailErr.message : String(emailErr));
          }
        }
      } else {
        console.warn("RESEND_API_KEY not set, skipping suspension emails");
      }
    } catch (emailError) {
      console.error("Failed to process suspension emails (non-blocking):",
        emailError instanceof Error ? emailError.message : String(emailError));
    }

    return new Response(
      JSON.stringify({ message: "Expired servers suspended", count: expiredIds.length }),
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
