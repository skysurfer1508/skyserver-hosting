import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationStatusRequest {
  user_ids: string[];
}

interface VerificationStatusResponse {
  [userId: string]: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client with the user's token to verify they're an admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if the user is an admin
    const { data: adminRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !adminRole) {
      throw new Error("Forbidden: Admin access required");
    }

    // Parse request body
    const { user_ids }: VerificationStatusRequest = await req.json();

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create admin client with service role to access auth.users
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch all users from auth.users
    const { data: authUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000,
      });

    if (listError) {
      console.error("Error listing users:", listError);
      throw new Error("Failed to fetch user verification status");
    }

    // Build response map
    const verificationStatus: VerificationStatusResponse = {};
    const requestedIds = new Set(user_ids);

    for (const authUser of authUsers.users) {
      if (requestedIds.has(authUser.id)) {
        verificationStatus[authUser.id] = !!authUser.email_confirmed_at;
      }
    }

    // Set any missing IDs to false (user not found in auth)
    for (const id of user_ids) {
      if (!(id in verificationStatus)) {
        verificationStatus[id] = false;
      }
    }

    return new Response(JSON.stringify(verificationStatus), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in get-users-verification-status:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage === "Unauthorized" ? 401 : errorMessage.includes("Forbidden") ? 403 : 500;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
