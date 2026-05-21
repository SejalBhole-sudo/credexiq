import { OFFICIAL_PRICING } from "@/data/pricingData";
import { runAudit } from "@/lib/auditEngine";

export async function detectPricingChanges(audits) {
  const affectedAudits = [];

  for (const audit of audits) {
    const oldSnapshot = audit.pricing_snapshot;

    const pricingChanged =
      JSON.stringify(oldSnapshot) !==
      JSON.stringify(OFFICIAL_PRICING);

    if (!pricingChanged) continue;

    console.log("INPUT STACK:", audit.input_stack);
    const newAuditResult = runAudit(
      audit.input_stack
    );

    const recommendationChanged =
  audit.output_result.totalMonthlySaving !==
    newAuditResult.totalMonthlySaving ||
  audit.output_result.totalAnnualSaving !==
    newAuditResult.totalAnnualSaving;

    affectedAudits.push({
      auditId: audit.id,
      email: audit.user_email,

      pricingChanged,
      recommendationChanged,

      oldResult: audit.output_result,
      newResult: newAuditResult,
    });
  }

  return affectedAudits;
}