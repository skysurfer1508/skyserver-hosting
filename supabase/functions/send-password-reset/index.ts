import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
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

    const { email, resetUrl }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email || !resetUrl) {
      throw new Error("Missing required fields: email and resetUrl");
    }

    // Find user by email in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (profileError) {
      console.error("Error finding profile:", profileError);
      throw new Error("Error looking up user");
    }

    // Always return success to prevent email enumeration
    if (!profile) {
      console.log("No profile found for email:", email);
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset email has been sent" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate secure token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();

    // Delete any existing tokens for this user
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", profile.id);

    // Store the token in the database
    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        token: token,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      });

    if (tokenError) {
      console.error("Error storing token:", tokenError);
      throw new Error("Failed to create reset token");
    }

    const fullResetUrl = `${resetUrl}?token=${token}`;
    const userName = profile.full_name || "User";

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "SkyServer <noreply@skyserver1508.de>",
      to: [email],
      subject: "Reset Your Password - SkyServer",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a4a;">
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="color: white; font-size: 24px; font-weight: bold;">S</span>
                      </div>
                      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px; font-weight: 700;">Password Reset Request</h1>
                      <p style="color: #a0a0b0; font-size: 16px; margin: 0;">SkyServer Game Hosting</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hi ${userName},
                      </p>
                      <p style="color: #c0c0d0; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                        We received a request to reset your password. Click the button below to choose a new password. This link will expire in <strong style="color: #8b5cf6;">1 hour</strong>.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${fullResetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #808090; font-size: 13px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: rgba(0,0,0,0.2); border-top: 1px solid #2a2a4a;">
                      <p style="color: #606070; font-size: 12px; margin: 0; text-align: center;">
                        &copy; ${new Date().getFullYear()} SkyServer. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
