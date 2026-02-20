import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const PTERODACTYL_API_KEY = Deno.env.get("PTERODACTYL_API_KEY");
    const PTERODACTYL_PANEL_URL = Deno.env.get("PTERODACTYL_PANEL_URL");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      log("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error", logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!PTERODACTYL_API_KEY || !PTERODACTYL_PANEL_URL) {
      log("ERROR: Missing PTERODACTYL_API_KEY or PTERODACTYL_PANEL_URL");
      return new Response(
        JSON.stringify({ error: "Pterodactyl configuration missing", logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!PTERODACTYL_PANEL_URL.startsWith("http://") && !PTERODACTYL_PANEL_URL.startsWith("https://")) {
      log(`ERROR: PTERODACTYL_PANEL_URL does not look like a URL. Got: "${PTERODACTYL_PANEL_URL.substring(0, 20)}..."`);
      return new Response(
        JSON.stringify({ error: "PTERODACTYL_PANEL_URL is not a valid URL. Check if your secrets are swapped.", logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const panelUrl = PTERODACTYL_PANEL_URL.replace(/\/+$/, "");
    log(`[Config] Panel URL: ${panelUrl}`);
    log(`[Config] API Key: ${PTERODACTYL_API_KEY.substring(0, 8)}...`);

    // Step 1: Authenticate the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      log("ERROR: No valid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", logs }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      log(`ERROR: Auth failed - ${userError?.message || "No user returned"}`);
      return new Response(
        JSON.stringify({ error: "Unauthorized", logs }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    log(`[Step 1] Authenticated user: ${userId}, email: ${userEmail}`);

    if (!userEmail) {
      log("ERROR: No email found for user");
      return new Response(
        JSON.stringify({ error: "No email found for user", logs }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Lookup Pterodactyl user by email WITH included servers
    const pteroHeaders = {
      Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
      Accept: "application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json",
    };

    const userLookupUrl = `${panelUrl}/api/application/users?filter[email]=${encodeURIComponent(userEmail)}&include=servers`;
    log(`[Step 2] Looking up Pterodactyl user at: ${userLookupUrl}`);

    let userRes: Response;
    try {
      userRes = await fetch(userLookupUrl, { headers: pteroHeaders });
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      log(`[Step 2] FETCH ERROR: Could not reach Pterodactyl panel: ${msg}`);
      return new Response(
        JSON.stringify({ error: `Cannot reach Pterodactyl panel: ${msg}`, logs }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log(`[Step 2] HTTP status: ${userRes.status} ${userRes.statusText}`);

    if (!userRes.ok) {
      const errText = await userRes.text();
      log(`[Step 2] Ptero Response Body: ${errText}`);
      return new Response(
        JSON.stringify({ error: `Pterodactyl API error: ${userRes.status} ${userRes.statusText}`, details: errText, logs }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pteroData = await userRes.json();
    const pteroUsers = pteroData?.data || [];
    log(`[Step 2] Pterodactyl users found: ${pteroUsers.length}`);

    if (pteroUsers.length === 0) {
      log(`[Step 2] No Pterodactyl user found for email: ${userEmail}`);
      return new Response(
        JSON.stringify({ message: "No Pterodactyl user found for your email", synced: 0, logs }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Extract servers from the included relationship (email-only, ignore username)
    const pteroUser = pteroUsers[0];
    const pteroUserId = pteroUser.attributes.id;
    log(`[Step 3] Using Pterodactyl user ID: ${pteroUserId} (email match only, username ignored)`);

    const includedServers = pteroUser.attributes?.relationships?.servers?.data || [];
    log(`[Step 3] Servers included in response: ${includedServers.length}`);

    if (includedServers.length === 0) {
      log(`[Step 3] No servers found for this Pterodactyl user`);
      return new Response(
        JSON.stringify({ message: "No Pterodactyl servers found", synced: 0, ptero_user_id: pteroUserId, logs }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build name -> id map from included servers
    const pteroServerMap = new Map<string, number>();
    for (const srv of includedServers) {
      const name = (srv.attributes.name as string).toLowerCase().trim();
      const id = srv.attributes.id as number;
      pteroServerMap.set(name, id);
      log(`[Step 3]   - Server: "${srv.attributes.name}" (id: ${id})`);
    }

    // Step 4: Match to database server_requests and update
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: requests, error: reqError } = await supabaseAdmin
      .from("server_requests")
      .select("id, server_name, pterodactyl_server_id, status")
      .eq("user_id", userId)
      .in("status", ["pending", "active", "suspended"]);

    if (reqError) {
      log(`[Step 4] ERROR: Failed to fetch server requests: ${reqError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to fetch server requests", details: reqError.message, logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log(`[Step 4] DB server requests: ${requests?.length || 0}`);
    for (const r of requests || []) {
      log(`[Step 4]   - "${r.server_name}" (status: ${r.status}, ptero_id: ${r.pterodactyl_server_id || "null"})`);
    }

    let syncedCount = 0;

    for (const req of requests || []) {
      const reqName = req.server_name.toLowerCase().trim();
      const pteroId = pteroServerMap.get(reqName);

      if (pteroId) {
        log(`[Step 4] Match: "${req.server_name}" -> pterodactyl_server_id ${pteroId}`);
        const { error: updateError } = await supabaseAdmin
          .from("server_requests")
          .update({ pterodactyl_server_id: pteroId })
          .eq("id", req.id);

        if (updateError) {
          log(`[Step 4] ERROR updating ${req.id}: ${updateError.message}`);
        } else {
          log(`[Step 4] SUCCESS: Updated "${req.server_name}" with ptero_id ${pteroId}`);
          syncedCount++;
        }
      } else {
        log(`[Step 4] No match for "${req.server_name}"`);
      }
    }

    // Fallback: 1 request + 1 server = force-match
    if (syncedCount === 0 && requests && requests.length === 1 && includedServers.length === 1) {
      const r = requests[0];
      if (!r.pterodactyl_server_id) {
        const pteroId = includedServers[0].attributes.id;
        log(`[Step 4] Force-match: "${r.server_name}" -> ptero_id ${pteroId}`);
        const { error: updateError } = await supabaseAdmin
          .from("server_requests")
          .update({ pterodactyl_server_id: pteroId })
          .eq("id", r.id);

        if (updateError) {
          log(`[Step 4] ERROR force-match: ${updateError.message}`);
        } else {
          log(`[Step 4] SUCCESS force-match`);
          syncedCount = 1;
        }
      }
    }

    log(`[DONE] Synced ${syncedCount} server(s)`);

    return new Response(
      JSON.stringify({
        message: `Synced ${syncedCount} server(s)`,
        synced: syncedCount,
        ptero_user_id: pteroUserId,
        ptero_servers: includedServers.length,
        db_requests: requests?.length || 0,
        logs,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    log(`UNHANDLED ERROR: ${message}`);
    return new Response(
      JSON.stringify({ error: message, logs }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
