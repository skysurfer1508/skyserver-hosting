import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, newPassword }: ResetPasswordRequest = await req.json();

    // Validate required fields
    if (!token || !newPassword) {
      throw new Error("Missing required fields: token and newPassword");
    }

    // Validate password strength
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Find the token and check if it's valid
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) {
      console.error("Error finding token:", tokenError);
      throw new Error("Error validating reset token");
    }

    if (!tokenData) {
      throw new Error("Invalid or expired reset link");
    }

    if (tokenData.used) {
      throw new Error("This reset link has already been used");
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      throw new Error("This reset link has expired");
    }

    // Get the auth user ID from the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", tokenData.user_id)
      .single();

    if (profileError || !profile) {
      console.error("Error finding profile:", profileError);
      throw new Error("User not found");
    }

    // Update the user's password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      throw new Error("Failed to update password");
    }

    // Mark the token as used
    await supabase
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", tokenData.id);

    // Clean up old tokens for this user
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", tokenData.user_id)
      .neq("id", tokenData.id);

    console.log("Password reset successful for user:", tokenData.user_id);

    return new Response(
      JSON.stringify({ success: true, message: "Password has been reset successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
