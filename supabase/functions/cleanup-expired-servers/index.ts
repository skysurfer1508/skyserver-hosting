import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
