import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const monthlyDiff =
  (newResult?.totalMonthlySaving || 0) -
  (oldResult?.totalMonthlySaving || 0);

const annualDiff =
  (newResult?.totalAnnualSaving || 0) -
  (oldResult?.totalAnnualSaving || 0);

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
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">

      <h2 style="margin-bottom: 16px;">
        Pricing Changes Detected
      </h2>

      <p>
        We detected pricing updates that affect one of your previous AI spend audits.
      </p>

      <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;">
        <h3>Impact on Your Audit</h3>

        <p>
          Previous Monthly Savings:
          <strong>$${oldResult?.totalMonthlySaving || 0}</strong>
        </p>

        <p>
          Updated Monthly Savings:
          <strong>$${newResult?.totalMonthlySaving || 0}</strong>
        </p>

        <p>
          Savings Difference:
          <strong>
            ${monthlyDiff >= 0 ? "+" : ""}
            $${monthlyDiff.toFixed(2)}/month
          </strong>
        </p>

        <p>
          Annual Difference:
          <strong>
            ${annualDiff >= 0 ? "+" : ""}
            $${annualDiff.toFixed(2)}/year
          </strong>
        </p>
      </div>

      <p>
        Your recommendations have been recalculated using current pricing data.
      </p>

      <a
        href="https://credex-audit-beta.vercel.app/reaudit/${auditId}"
        style="
          display:inline-block;
          background:#2563eb;
          color:#ffffff;
          text-decoration:none;
          padding:12px 20px;
          border-radius:8px;
          font-weight:bold;
          margin-top:12px;
        "
      >
        Re-run Audit Now
      </a>

      <p style="margin-top:24px;color:#666;font-size:14px;">
        Open the re-audit page to compare your historical audit against the updated recommendation set.
      </p>

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