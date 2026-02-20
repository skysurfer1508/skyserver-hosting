import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return new Response(
        JSON.stringify({ error: "Missing requestId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the server request
    const { data: serverRequest, error: fetchError } = await supabaseAdmin
      .from("server_requests")
      .select("id, pterodactyl_server_id, server_name, status")
      .eq("id", requestId)
      .single();

    if (fetchError || !serverRequest) {
      return new Response(
        JSON.stringify({ error: "Server request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the first numeric server ID from the text field (e.g. "12" or "Server#1: 12, Server#2: 15")
    const parseFirstServerId = (val: string | null): number | null => {
      if (!val) return null;
      const match = val.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    // Call Pterodactyl API to unsuspend if we have a server ID
    let panelUnsuspended = false;
    const numericServerId = parseFirstServerId(serverRequest.pterodactyl_server_id);
    if (numericServerId && PTERODACTYL_API_KEY && PTERODACTYL_PANEL_URL) {
      try {
        const panelUrl = PTERODACTYL_PANEL_URL.replace(/\/+$/, "");
        const response = await fetch(
          `${panelUrl}/api/application/servers/${numericServerId}/unsuspend`,
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
          panelUnsuspended = true;
          console.log(`Successfully unsuspended server ${numericServerId} on panel`);
        } else {
          const errorText = await response.text();
          console.error(`Pterodactyl unsuspend failed (${response.status}):`, errorText);
        }
      } catch (apiError) {
        console.error("Pterodactyl API call failed:", apiError instanceof Error ? apiError.message : String(apiError));
      }
    } else {
      if (!numericServerId) {
        console.warn(`No pterodactyl_server_id for request ${requestId}, skipping panel unsuspend`);
      }
      if (!PTERODACTYL_API_KEY || !PTERODACTYL_PANEL_URL) {
        console.warn("Missing PTERODACTYL_API_KEY or PTERODACTYL_PANEL_URL");
      }
    }

    // Update DB status back to active with fresh 7-day lease
    const { error: updateError } = await supabaseAdmin
      .from("server_requests")
      .update({
        status: "active",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        rejection_reason: null,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Error updating server request:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update server request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        panelUnsuspended,
        message: panelUnsuspended
          ? "Server reactivated and unsuspended on panel"
          : "Server reactivated in database (panel unsuspend skipped or failed)",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Unhandled error in unsuspend-server:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
