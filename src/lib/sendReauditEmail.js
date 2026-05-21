import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendReauditEmail({
  email,
  auditId,
  oldResult,
  newResult,
}) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your CredexIQ audit has changed",

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Pricing Changes Detected</h2>

          <p>
            We detected pricing changes that affected one of your previous audits.
          </p>

          <p>
            Previous monthly savings:
            <strong>$${oldResult?.totalMonthlySaving || 0}</strong>
          </p>

          <p>
            Updated monthly savings:
            <strong>$${newResult?.totalMonthlySaving || 0}</strong>
          </p>

          <p>
            Review the updated audit:
          </p>

          <a href="http://localhost:3000/reaudit/${auditId}">
            View Updated Audit
          </a>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error(
      "Failed to send re-audit email:",
      error
    );

    return false;
  }
}