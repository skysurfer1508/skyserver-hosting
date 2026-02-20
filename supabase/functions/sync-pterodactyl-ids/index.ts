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
      log(`PTERODACTYL_API_KEY set: ${!!PTERODACTYL_API_KEY}`);
      log(`PTERODACTYL_PANEL_URL set: ${!!PTERODACTYL_PANEL_URL}`);
      return new Response(
        JSON.stringify({ error: "Pterodactyl configuration missing", logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log(`PTERODACTYL_PANEL_URL: ${PTERODACTYL_PANEL_URL}`);

    // Authenticate the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      log("ERROR: No valid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", logs }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use getUser() for reliable auth
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

    const panelUrl = PTERODACTYL_PANEL_URL.replace(/\/+$/, "");
    const pteroHeaders = {
      Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
      Accept: "application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json",
    };

    // Step 2: Find Pterodactyl user by email
    const userLookupUrl = `${panelUrl}/api/application/users?filter[email]=${encodeURIComponent(userEmail)}`;
    log(`[Step 2] Looking up Pterodactyl user at: ${userLookupUrl}`);

    const userRes = await fetch(userLookupUrl, { headers: pteroHeaders });
    log(`[Step 2] Pterodactyl user lookup HTTP status: ${userRes.status}`);

    if (!userRes.ok) {
      const errText = await userRes.text();
      log(`[Step 2] ERROR: Pterodactyl user lookup failed: ${userRes.status} - ${errText}`);
      return new Response(
        JSON.stringify({ error: `Pterodactyl API error: ${userRes.status}`, details: errText, logs }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pteroUserData = await userRes.json();
    const pteroUsers = pteroUserData?.data || [];
    log(`[Step 2] Pterodactyl users found: ${pteroUsers.length}`);

    if (pteroUsers.length === 0) {
      log(`[Step 2] No Pterodactyl user found for email: ${userEmail}`);
      return new Response(
        JSON.stringify({ message: "No Pterodactyl user found for your email", synced: 0, logs }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pteroUserId = pteroUsers[0].attributes.id;
    log(`[Step 2] Found Pterodactyl user ID: ${pteroUserId} (username: ${pteroUsers[0].attributes.username})`);

    // Step 3: Fetch servers owned by this Pterodactyl user
    let allServers: any[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const serverUrl = `${panelUrl}/api/application/servers?filter[user]=${pteroUserId}&page=${page}`;
      log(`[Step 3] Fetching servers page ${page}: ${serverUrl}`);

      const serverRes = await fetch(serverUrl, { headers: pteroHeaders });
      log(`[Step 3] Server fetch HTTP status: ${serverRes.status}`);

      if (!serverRes.ok) {
        const errText = await serverRes.text();
        log(`[Step 3] ERROR: Server lookup failed: ${serverRes.status} - ${errText}`);
        break;
      }

      const serverData = await serverRes.json();
      const pageServers = serverData?.data || [];
      log(`[Step 3] Page ${page}: found ${pageServers.length} server(s)`);

      for (const srv of pageServers) {
        log(`[Step 3]   - Server: "${srv.attributes.name}" (id: ${srv.attributes.id}, user: ${srv.attributes.user})`);
      }

      allServers = allServers.concat(pageServers);
      lastPage = serverData?.meta?.pagination?.total_pages || 1;
      page++;
    } while (page <= lastPage);

    log(`[Step 3] Total Pterodactyl servers found: ${allServers.length}`);

    if (allServers.length === 0) {
      log(`[Step 3] No servers found for Pterodactyl user ${pteroUserId}`);
      return new Response(
        JSON.stringify({ message: "No Pterodactyl servers found", synced: 0, logs }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Match servers to server_requests and update pterodactyl_server_id
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

    log(`[Step 4] Found ${requests?.length || 0} server request(s) in database`);
    for (const req of requests || []) {
      log(`[Step 4]   - Request: "${req.server_name}" (id: ${req.id}, status: ${req.status}, ptero_id: ${req.pterodactyl_server_id || "null"})`);
    }

    let syncedCount = 0;

    // Build a map of pterodactyl server name -> pterodactyl server id
    const pteroServerMap = new Map<string, number>();
    for (const srv of allServers) {
      const name = (srv.attributes.name as string).toLowerCase().trim();
      pteroServerMap.set(name, srv.attributes.id);
    }

    log(`[Step 4] Pterodactyl server name map: ${JSON.stringify(Object.fromEntries(pteroServerMap))}`);

    for (const req of requests || []) {
      const reqName = req.server_name.toLowerCase().trim();
      const pteroId = pteroServerMap.get(reqName);

      if (pteroId) {
        log(`[Step 4] Match found: "${req.server_name}" -> pterodactyl_server_id ${pteroId}`);
        const { error: updateError } = await supabaseAdmin
          .from("server_requests")
          .update({ pterodactyl_server_id: pteroId })
          .eq("id", req.id);

        if (updateError) {
          log(`[Step 4] ERROR: DB update failed for request ${req.id}: ${updateError.message}`);
        } else {
          log(`[Step 4] SUCCESS: Updated request "${req.server_name}" with pterodactyl_server_id ${pteroId}`);
          syncedCount++;
        }
      } else {
        log(`[Step 4] No name match for "${req.server_name}" (searched as "${reqName}")`);
      }
    }

    // Fallback: If only one request and one server, force-match
    if (syncedCount === 0 && requests && requests.length === 1 && allServers.length === 1) {
      const req = requests[0];
      if (!req.pterodactyl_server_id) {
        const pteroId = allServers[0].attributes.id;
        log(`[Step 4] Attempting force-match: single request "${req.server_name}" -> single server id ${pteroId}`);
        const { error: updateError } = await supabaseAdmin
          .from("server_requests")
          .update({ pterodactyl_server_id: pteroId })
          .eq("id", req.id);

        if (updateError) {
          log(`[Step 4] ERROR: Force-match DB update failed: ${updateError.message}`);
        } else {
          log(`[Step 4] SUCCESS: Force-matched "${req.server_name}" -> pterodactyl_server_id ${pteroId}`);
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
        ptero_servers: allServers.length,
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
