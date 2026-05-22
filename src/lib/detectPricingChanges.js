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
      console.log(`Audit ${audit.id}: No pricing changes detected`);
      continue;
    }

    console.log(`Audit ${audit.id}: Pricing detected as changed`);
    console.log("INPUT STACK:", audit.input_stack);

    // Run new audit with current pricing
    const newAuditResult = runAudit(audit.input_stack);

    // Check if the recommendations actually changed
    const oldSavings = audit.output_result.totalMonthlySaving || 0;
    const newSavings = newAuditResult.totalMonthlySaving || 0;

    const oldAnnualSavings = audit.output_result.totalAnnualSaving || 0;
    const newAnnualSavings = newAuditResult.totalAnnualSaving || 0;

    const recommendationChanged = oldSavings !== newSavings || oldAnnualSavings !== newAnnualSavings;

    console.log(`Audit ${audit.id}: Old savings: $${oldSavings}, New savings: $${newSavings}, Changed: ${recommendationChanged}`);

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