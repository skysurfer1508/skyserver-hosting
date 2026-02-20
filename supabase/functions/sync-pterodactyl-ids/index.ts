import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!PTERODACTYL_API_KEY || !PTERODACTYL_PANEL_URL) {
      return new Response(
        JSON.stringify({ error: "Pterodactyl configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "No email found for user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const panelUrl = PTERODACTYL_PANEL_URL.replace(/\/+$/, "");
    const pteroHeaders = {
      Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Step 1: Find Pterodactyl user by email
    const userRes = await fetch(
      `${panelUrl}/api/application/users?filter[email]=${encodeURIComponent(userEmail)}`,
      { headers: pteroHeaders }
    );

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Pterodactyl user lookup failed:", userRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to look up Pterodactyl user" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userData = await userRes.json();
    const pteroUsers = userData?.data || [];

    if (pteroUsers.length === 0) {
      console.log(`No Pterodactyl user found for email: ${userEmail}`);
      return new Response(
        JSON.stringify({ message: "No Pterodactyl user found", synced: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pteroUserId = pteroUsers[0].attributes.id;
    console.log(`Found Pterodactyl user ID ${pteroUserId} for email ${userEmail}`);

    // Step 2: Fetch servers owned by this Pterodactyl user
    let allServers: any[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const serverRes = await fetch(
        `${panelUrl}/api/application/servers?filter[owner_id]=${pteroUserId}&page=${page}`,
        { headers: pteroHeaders }
      );

      if (!serverRes.ok) {
        const errText = await serverRes.text();
        console.error("Pterodactyl server lookup failed:", serverRes.status, errText);
        break;
      }

      const serverData = await serverRes.json();
      allServers = allServers.concat(serverData?.data || []);
      lastPage = serverData?.meta?.pagination?.total_pages || 1;
      page++;
    } while (page <= lastPage);

    if (allServers.length === 0) {
      console.log(`No Pterodactyl servers found for user ${pteroUserId}`);
      return new Response(
        JSON.stringify({ message: "No Pterodactyl servers found", synced: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${allServers.length} server(s) for Pterodactyl user ${pteroUserId}`);

    // Step 3: Match servers to server_requests by server name and update pterodactyl_server_id
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's server requests that don't have a pterodactyl_server_id yet
    const { data: requests, error: reqError } = await supabaseAdmin
      .from("server_requests")
      .select("id, server_name, pterodactyl_server_id")
      .eq("user_id", userId)
      .in("status", ["pending", "active", "suspended"]);

    if (reqError) {
      console.error("Error fetching server requests:", reqError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch server requests" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let syncedCount = 0;

    // Build a map of pterodactyl server name -> pterodactyl server id
    const pteroServerMap = new Map<string, number>();
    for (const srv of allServers) {
      const name = (srv.attributes.name as string).toLowerCase().trim();
      pteroServerMap.set(name, srv.attributes.id);
    }

    for (const req of requests || []) {
      // Skip if already has a pterodactyl_server_id
      if (req.pterodactyl_server_id) continue;

      const reqName = req.server_name.toLowerCase().trim();
      const pteroId = pteroServerMap.get(reqName);

      if (pteroId) {
        const { error: updateError } = await supabaseAdmin
          .from("server_requests")
          .update({ pterodactyl_server_id: pteroId })
          .eq("id", req.id);

        if (updateError) {
          console.error(`Failed to update request ${req.id}:`, updateError);
        } else {
          console.log(`Synced request "${req.server_name}" -> pterodactyl_server_id ${pteroId}`);
          syncedCount++;
        }
      } else {
        console.log(`No Pterodactyl match for server_request "${req.server_name}"`);
      }
    }

    // If only one server request and one ptero server, force-match regardless of name
    if (syncedCount === 0 && requests && requests.length === 1 && allServers.length === 1) {
      const req = requests[0];
      if (!req.pterodactyl_server_id) {
        const pteroId = allServers[0].attributes.id;
        const { error: updateError } = await supabaseAdmin
          .from("server_requests")
          .update({ pterodactyl_server_id: pteroId })
          .eq("id", req.id);

        if (!updateError) {
          console.log(`Force-matched single request "${req.server_name}" -> pterodactyl_server_id ${pteroId}`);
          syncedCount = 1;
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Synced ${syncedCount} server(s)`,
        synced: syncedCount,
        ptero_user_id: pteroUserId,
        ptero_servers: allServers.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Unhandled error in sync-pterodactyl-ids:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
