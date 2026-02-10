import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuthEmailRequest {
  type: "signup" | "recovery";
  email: string;
}

const CUSTOM_DOMAIN = "https://www.skyserver1508.org";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email }: AuthEmailRequest = await req.json();

    if (!email || !type) {
      throw new Error("Missing required fields: email and type");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Determine redirect and link type
    const isSignup = type === "signup";
    const redirectTo = isSignup
      ? `${CUSTOM_DOMAIN}/dashboard`
      : `${CUSTOM_DOMAIN}/auth/update-password`;

    const linkType = isSignup ? "signup" : "recovery";

    // Generate the auth link using admin API
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: linkType,
        email,
        options: { redirectTo },
      });

    if (linkError || !linkData) {
      console.error("generateLink error:", linkError);
      throw new Error(linkError?.message || "Failed to generate auth link");
    }

    // The action_link contains the full verification URL through Supabase
    // We need to keep it pointing to Supabase's /auth/v1/verify endpoint
    // but ensure the redirect_to param points to our custom domain
    let actionLink = linkData.properties.action_link;

    // Replace the redirect_to parameter in the link to use our custom domain
    const url = new URL(actionLink);
    url.searchParams.set("redirect_to", redirectTo);
    actionLink = url.toString();

    console.log("Generated action link for", type, "- redirecting to:", redirectTo);

    // For signup: nullify email_confirmed_at so user must verify
    if (isSignup && linkData.user) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        linkData.user.id,
        { email_confirm: false }
      );
      if (updateError) {
        console.error("Failed to reset email_confirmed_at:", updateError);
      }
    }

    // Build email content
    let subject: string;
    let html: string;

    if (isSignup) {
      subject = "Verify your SkyServer1508 account";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed; text-align: center;">Welcome to SkyServer1508!</h1>
          <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionLink}" 
               style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `;
    } else {
      subject = "Reset your SkyServer1508 password";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed; text-align: center;">Password Reset</h1>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionLink}" 
               style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "SkyServer1508 <noreply@skyserver1508.org>",
      to: [email],
      subject,
      html,
    });

    console.log("Auth email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
