import { OFFICIAL_PRICING } from "@/data/pricingData";
import { runAudit } from "@/lib/auditEngine";
import { hasPricingChanged, getPricingChangeSummary } from "@/lib/pricingSnapshot";

export async function detectPricingChanges(audits) {
  const affectedAudits = [];

  for (const audit of audits) {
    const oldSnapshot = audit.pricing_snapshot;
    const currentPricing = OFFICIAL_PRICING;

    // Check if pricing has actually changed
    const pricingChanged = hasPricingChanged(oldSnapshot, currentPricing);

    if (!pricingChanged) {
      continue;
    }

    // Run new audit with current pricing
    const newAuditResult = runAudit(audit.input_stack);

    // Check if the recommendations actually changed
    const oldSavings = audit.output_result.totalMonthlySaving || 0;
    const newSavings = newAuditResult.totalMonthlySaving || 0;

    const oldAnnualSavings = audit.output_result.totalAnnualSaving || 0;
    const newAnnualSavings = newAuditResult.totalAnnualSaving || 0;

    const recommendationChanged =
  JSON.stringify(audit.output_result) !==
  JSON.stringify(newAuditResult);
if (!recommendationChanged) {
  continue;
}


    // Get human-readable pricing change summary
    const pricingChangeDetails = getPricingChangeSummary(oldSnapshot, currentPricing);

    affectedAudits.push({
      auditId: audit.id,
      email: audit.user_email,
      pricingChanged,
      recommendationChanged,
      pricingChangeDetails,
      oldResult: audit.output_result,
      newResult: newAuditResult,
    });
  }

  return affectedAudits;
}