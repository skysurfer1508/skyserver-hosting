import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EncryptRequest {
  requestId: string;
  assignedIp: string;
  panelUrl: string;
  panelUsername: string;
  panelPassword: string;
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

    // Get authorization header to verify admin
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

    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: EncryptRequest = await req.json();
    const { requestId, assignedIp, panelUrl, panelUsername, panelPassword } = body;

    if (!requestId || !assignedIp || !panelUsername || !panelPassword) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Encrypt credentials using database function
    const { data: encryptedAssignedIp, error: encErr1 } = await supabaseAdmin.rpc(
      "encrypt_credential",
      { plaintext: assignedIp, encryption_key: ENCRYPTION_KEY }
    );

    const { data: encryptedPanelUrl, error: encErr2 } = await supabaseAdmin.rpc(
      "encrypt_credential",
      { plaintext: panelUrl || "", encryption_key: ENCRYPTION_KEY }
    );

    const { data: encryptedPanelUsername, error: encErr3 } = await supabaseAdmin.rpc(
      "encrypt_credential",
      { plaintext: panelUsername, encryption_key: ENCRYPTION_KEY }
    );

    const { data: encryptedPanelPassword, error: encErr4 } = await supabaseAdmin.rpc(
      "encrypt_credential",
      { plaintext: panelPassword, encryption_key: ENCRYPTION_KEY }
    );

    if (encErr1 || encErr2 || encErr3 || encErr4) {
      console.error("Encryption errors:", { encErr1, encErr2, encErr3, encErr4 });
      throw new Error("Failed to encrypt credentials");
    }

    // Update server request with encrypted credentials
    const { error: updateError } = await supabaseAdmin
      .from("server_requests")
      .update({
        status: "active",
        assigned_ip: encryptedAssignedIp,
        panel_url: encryptedPanelUrl,
        panel_username: encryptedPanelUsername,
        panel_password: encryptedPanelPassword,
        credentials_encrypted: true,
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update server request");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in encrypt-credentials:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
