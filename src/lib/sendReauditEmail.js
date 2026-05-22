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
  const monthlyDiff =
    (newResult?.totalMonthlySaving || 0) -
    (oldResult?.totalMonthlySaving || 0);

  const annualDiff =
    (newResult?.totalAnnualSaving || 0) -
    (oldResult?.totalAnnualSaving || 0);

  try {
    console.log("EMAIL PAYLOAD", {
      to: email,
      auditId,
    });

    const response = await resend.emails.send({
      from: "CredexIQ <onboarding@resend.dev>",
      to: email,
      subject: "CredexIQ Pricing Change Alert",

      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          
          <h2>Pricing Changes Detected</h2>

          <p>
            We detected pricing updates that affect one of your previous AI spend audits.
          </p>

          <hr />

          <p>
            <strong>Previous Monthly Savings:</strong>
            $${oldResult?.totalMonthlySaving || 0}
          </p>

          <p>
            <strong>Updated Monthly Savings:</strong>
            $${newResult?.totalMonthlySaving || 0}
          </p>

          <p>
            <strong>Monthly Difference:</strong>
            ${monthlyDiff >= 0 ? "+" : ""}
            $${monthlyDiff.toFixed(2)}
          </p>

          <p>
            <strong>Annual Difference:</strong>
            ${annualDiff >= 0 ? "+" : ""}
            $${annualDiff.toFixed(2)}
          </p>

          <br />

          <a
            href="https://credex-audit-beta.vercel.app/reaudit/${auditId}"
            style="
              background:#2563eb;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
            "
          >
            View Updated Audit
          </a>

          <p style="margin-top:20px;color:#666;">
            Your recommendations have been recalculated using the latest pricing information.
          </p>

        </div>
      `,
    });

    console.log("Resend response:", response);

    return !response.error;
  } catch (error) {
    console.error(
      "Failed to send re-audit email:",
      error
    );

    return false;
  }
}