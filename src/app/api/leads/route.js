import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const {
  email,
  company,
  role,
  monthlySaving,
  annualSaving,
  reportId,
} = body;

    // Validate input
    if (!email || !company || !role) {
      console.warn("Missing required fields in lead submission");
      return Response.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Step 1: Save to database
    const { error: dbError } = await supabase
      .from("leads")
      .insert([
        {
          email,
          company,
          role,
          monthly_saving: monthlySaving,
          annual_saving: annualSaving,
        },
      ]);

    if (dbError) {
      console.error("Database error:", dbError);
      return Response.json(
        {
          success: false,
          error: `Database error: ${dbError.message}`,
        },
        { status: 500 }
      );
    }
    // Link lead email to stored audit
if (reportId) {
  const { error: auditUpdateError } = await supabase
    .from("audits")
    .update({
      user_email: email,
    })
    .eq("id", reportId);

  if (auditUpdateError) {
    console.error(
      "Failed to update audit email:",
      auditUpdateError
    );
  }
}

    // Step 2: Try to send email (but don't fail if it doesn't work)
    let emailSent = false;
    try {
      const emailResponse = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your AI Spend Audit Report | CredexIQ",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Your AI Spend Audit</h2>
            
            <p style="color: #666;">
              <strong>Estimated Monthly Savings:</strong><br/>
              <span style="font-size: 24px; color: #22c55e; font-weight: bold;">$${monthlySaving.toFixed(0)}</span>
            </p>

            <p style="color: #666;">
              <strong>Estimated Annual Savings:</strong><br/>
              <span style="font-size: 24px; color: #22c55e; font-weight: bold;">$${annualSaving.toFixed(0)}</span>
            </p>

            <p style="color: #999; font-size: 14px;">
              Thanks for trying CredexIQ. We'll notify you when additional optimization opportunities become available.
            </p>
          </div>
        `,
      });
console.log("EMAIL RESPONSE:", emailResponse);

      emailSent = true;
    } catch (emailError) {
      // Log the error but don't fail the whole request
      // The lead was still saved successfully
      console.error("Email sending failed:", emailError.message);
      console.warn(`Warning: Lead saved for ${email} but email delivery failed`);
    }

    return Response.json({
      success: true,
      message: emailSent ? "Lead saved and email sent" : "Lead saved (email pending)",
      emailSent,
    });

  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      {
        success: false,
        error: `Server error: ${error.message}`,
      },
      { status: 500 }
    );
  }
}