import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PANEL_URL = "https://panel.skyserver1508.org";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PterodactylMeta {
  pagination: { total: number; total_pages: number; per_page: number };
}

async function fetchAllPages(
  endpoint: string,
  apiKey: string
): Promise<{ total: number; items: any[] }> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const firstRes = await fetch(`${PANEL_URL}${endpoint}?per_page=50&page=1`, { headers });
  if (!firstRes.ok) {
    throw new Error(`Pterodactyl API error: ${firstRes.status} on ${endpoint}`);
  }
  const firstData = await firstRes.json();
  const meta: PterodactylMeta = firstData.meta;
  const items = firstData.data || [];

  for (let page = 2; page <= meta.pagination.total_pages; page++) {
    const res = await fetch(`${PANEL_URL}${endpoint}?per_page=50&page=${page}`, { headers });
    if (res.ok) {
      const data = await res.json();
      items.push(...(data.data || []));
    }
  }

  return { total: meta.pagination.total, items };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PTERODACTYL_API_KEY = Deno.env.get("PTERODACTYL_API_KEY");
    if (!PTERODACTYL_API_KEY) {
      throw new Error("PTERODACTYL_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache
    const { data: cache } = await supabase
      .from("panel_stats_cache")
      .select("*")
      .eq("id", 1)
      .single();

    const now = Date.now();
    const cacheAge = cache?.updated_at
      ? now - new Date(cache.updated_at).getTime()
      : Infinity;

    if (cache && cacheAge < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({
          total_servers: cache.total_servers,
          total_users: cache.total_users,
          total_ram_mb: cache.total_ram_mb,
          nodes_online: cache.nodes_online,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch fresh data from Pterodactyl
    const [serversData, usersData, nodesData] = await Promise.all([
      fetchAllPages("/api/application/servers", PTERODACTYL_API_KEY),
      fetchAllPages("/api/application/users", PTERODACTYL_API_KEY),
      fetchAllPages("/api/application/nodes", PTERODACTYL_API_KEY),
    ]);

    // Sum RAM from all servers
    const totalRamMb = serversData.items.reduce((sum: number, server: any) => {
      return sum + (server.attributes?.limits?.memory || 0);
    }, 0);

    const stats = {
      total_servers: serversData.total,
      total_users: usersData.total,
      total_ram_mb: totalRamMb,
      nodes_online: nodesData.total,
    };

    // Update cache
    await supabase
      .from("panel_stats_cache")
      .upsert({ id: 1, ...stats, updated_at: new Date().toISOString() });

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("panel-stats error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch panel stats" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
