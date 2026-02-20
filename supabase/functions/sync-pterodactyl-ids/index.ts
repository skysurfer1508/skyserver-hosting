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
        JSON.stringify({ error: "PTERODACTYL_PANEL_URL is not a valid URL.", logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const panelUrl = PTERODACTYL_PANEL_URL.replace(/\/+$/, "");
    log(`[Config] Panel URL: ${panelUrl}`);
    log(`[Config] API Key: ${PTERODACTYL_API_KEY.substring(0, 8)}...`);

    // Step 1: Verify the calling user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      log("ERROR: No valid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", logs }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
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

    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: userData.user.id });
    if (!isAdmin) {
      log("ERROR: User is not an admin");
      return new Response(
        JSON.stringify({ error: "Admin access required", logs }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log(`[Step 1] Authenticated admin: ${userData.user.id}`);

    // Step 2: Fetch ALL Pterodactyl users with included servers
    const pteroHeaders = {
      Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
      Accept: "application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json",
    };

    // Fetch all pages of Pterodactyl users
    interface PteroUser {
      attributes: {
        id: number;
        email: string;
        relationships?: {
          servers?: {
            data: Array<{ attributes: { id: number; name: string } }>;
          };
        };
      };
    }

    const allPteroUsers: PteroUser[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const url = `${panelUrl}/api/application/users?include=servers&page=${currentPage}`;
      log(`[Step 2] Fetching Pterodactyl users page ${currentPage}: ${url}`);

      let res: Response;
      try {
        res = await fetch(url, { headers: pteroHeaders });
      } catch (fetchErr) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        log(`[Step 2] FETCH ERROR: ${msg}`);
        return new Response(
          JSON.stringify({ error: `Cannot reach Pterodactyl panel: ${msg}`, logs }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!res.ok) {
        const errText = await res.text();
        log(`[Step 2] Ptero API error ${res.status}: ${errText}`);
        return new Response(
          JSON.stringify({ error: `Pterodactyl API error: ${res.status}`, details: errText, logs }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const json = await res.json();
      const users = json?.data || [];
      allPteroUsers.push(...users);

      totalPages = json?.meta?.pagination?.total_pages || 1;
      log(`[Step 2] Page ${currentPage}/${totalPages} - got ${users.length} users`);
      currentPage++;
    } while (currentPage <= totalPages);

    log(`[Step 2] Total Pterodactyl users fetched: ${allPteroUsers.length}`);

    // Build email -> servers map from Pterodactyl
    const pteroEmailMap = new Map<string, Array<{ id: number; name: string }>>();
    for (const pu of allPteroUsers) {
      const email = pu.attributes.email?.toLowerCase().trim();
      if (!email) continue;
      const servers = pu.attributes.relationships?.servers?.data || [];
      const serverList = servers.map((s) => ({
        id: s.attributes.id,
        name: s.attributes.name,
      }));
      pteroEmailMap.set(email, serverList);
    }

    log(`[Step 2] Unique Pterodactyl emails with servers: ${pteroEmailMap.size}`);

    // Step 3: Fetch all Supabase profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email");

    if (profilesError) {
      log(`[Step 3] ERROR: Failed to fetch profiles: ${profilesError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to fetch profiles", logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log(`[Step 3] Supabase profiles: ${profiles?.length || 0}`);

    // Step 4: Fetch all server requests (pending/active/suspended)
    const { data: allRequests, error: reqError } = await supabaseAdmin
      .from("server_requests")
      .select("id, user_id, server_name, pterodactyl_server_id, status")
      .in("status", ["pending", "active", "suspended"]);

    if (reqError) {
      log(`[Step 4] ERROR: Failed to fetch server requests: ${reqError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to fetch server requests", logs }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log(`[Step 4] Total server requests: ${allRequests?.length || 0}`);

    // Build user_id -> email map
    const userEmailMap = new Map<string, string>();
    for (const p of profiles || []) {
      userEmailMap.set(p.id, p.email.toLowerCase().trim());
    }

    // Step 5: Match and update
    let updatedUsers = 0;
    let totalMatched = 0;

    // Group requests by user_id
    const requestsByUser = new Map<string, typeof allRequests>();
    for (const r of allRequests || []) {
      if (!requestsByUser.has(r.user_id)) {
        requestsByUser.set(r.user_id, []);
      }
      requestsByUser.get(r.user_id)!.push(r);
    }

    for (const [userId, userRequests] of requestsByUser) {
      const email = userEmailMap.get(userId);
      if (!email) {
        log(`[Step 5] No email found for user ${userId}, skipping`);
        continue;
      }

      const pteroServers = pteroEmailMap.get(email);
      if (!pteroServers || pteroServers.length === 0) {
        log(`[Step 5] No Pterodactyl servers for email ${email}`);
        continue;
      }

      totalMatched++;

      // Format the pterodactyl_server_id string
      let formattedId: string;
      if (pteroServers.length === 1) {
        formattedId = String(pteroServers[0].id);
      } else {
        formattedId = pteroServers
          .map((s, i) => `Server#${i + 1}: ${s.id}`)
          .join(", ");
      }

      log(`[Step 5] User ${email}: ${pteroServers.length} server(s) -> "${formattedId}"`);

      // Update all requests for this user with the same formatted ID
      for (const r of userRequests) {
        const { error: updateError } = await supabaseAdmin
          .from("server_requests")
          .update({ pterodactyl_server_id: formattedId })
          .eq("id", r.id);

        if (updateError) {
          log(`[Step 5] ERROR updating request ${r.id}: ${updateError.message}`);
        } else {
          log(`[Step 5] Updated request "${r.server_name}" (${r.id})`);
        }
      }

      updatedUsers++;
    }

    log(`[DONE] Global sync complete. Matched ${totalMatched} user(s), updated ${updatedUsers} user(s).`);

    return new Response(
      JSON.stringify({
        message: `Global Sync Complete! Updated ${updatedUsers} user(s).`,
        updated_users: updatedUsers,
        total_matched: totalMatched,
        ptero_users: allPteroUsers.length,
        db_profiles: profiles?.length || 0,
        db_requests: allRequests?.length || 0,
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
