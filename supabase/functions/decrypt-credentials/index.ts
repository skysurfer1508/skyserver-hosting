import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DecryptRequest {
  requestId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ENCRYPTION_KEY = Deno.env.get("CREDENTIALS_ENCRYPTION_KEY");
    if (!ENCRYPTION_KEY) {
      throw new Error("CREDENTIALS_ENCRYPTION_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create clients
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: DecryptRequest = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: "Missing requestId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the server request
    const { data: serverRequest, error: fetchError } = await supabaseAdmin
      .from("server_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !serverRequest) {
      return new Response(
        JSON.stringify({ error: "Server request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns this request or is admin
    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });

    if (serverRequest.user_id !== user.id && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If credentials are not encrypted, return them as-is
    if (!serverRequest.credentials_encrypted) {
      return new Response(
        JSON.stringify({
          assigned_ip: serverRequest.assigned_ip,
          panel_url: serverRequest.panel_url,
          panel_username: serverRequest.panel_username,
          panel_password: serverRequest.panel_password,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt credentials
    const { data: decryptedIp, error: decErr1 } = await supabaseAdmin.rpc(
      "decrypt_credential",
      { ciphertext: serverRequest.assigned_ip, encryption_key: ENCRYPTION_KEY }
    );

    const { data: decryptedUrl, error: decErr2 } = await supabaseAdmin.rpc(
      "decrypt_credential",
      { ciphertext: serverRequest.panel_url, encryption_key: ENCRYPTION_KEY }
    );

    const { data: decryptedUsername, error: decErr3 } = await supabaseAdmin.rpc(
      "decrypt_credential",
      { ciphertext: serverRequest.panel_username, encryption_key: ENCRYPTION_KEY }
    );

    const { data: decryptedPassword, error: decErr4 } = await supabaseAdmin.rpc(
      "decrypt_credential",
      { ciphertext: serverRequest.panel_password, encryption_key: ENCRYPTION_KEY }
    );

    if (decErr1 || decErr2 || decErr3 || decErr4) {
      console.error("Decryption errors:", { decErr1, decErr2, decErr3, decErr4 });
      throw new Error("Failed to decrypt credentials");
    }

    return new Response(
      JSON.stringify({
        assigned_ip: decryptedIp,
        panel_url: decryptedUrl,
        panel_username: decryptedUsername,
        panel_password: decryptedPassword,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in decrypt-credentials:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
