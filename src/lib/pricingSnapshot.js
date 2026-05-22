import { OFFICIAL_PRICING } from "@/data/pricingData";

/**
 * Creates a snapshot of current pricing at the time of audit
 * This is used to detect pricing changes later
 */
export function createPricingSnapshot() {
  return JSON.parse(JSON.stringify(OFFICIAL_PRICING));
}

/**
 * Detects if pricing has changed between two snapshots
 * Returns true if ANY price, plan, or structure changed
 */
export function hasPricingChanged(oldSnapshot, newSnapshot) {
  // Deep comparison of pricing objects
  const oldStr = JSON.stringify(oldSnapshot || {});
  const newStr = JSON.stringify(newSnapshot || {});
  
  return oldStr !== newStr;
}

/**
 * Returns a human-readable summary of what pricing changed
 * between two snapshots
 */
export function getPricingChangeSummary(oldSnapshot, newSnapshot) {
  const changes = [];

  if (!oldSnapshot || !newSnapshot) {
    return changes;
  }

  // Check each tool
  for (const toolId of Object.keys(newSnapshot)) {
    const oldTool = oldSnapshot[toolId];
    const newTool = newSnapshot[toolId];

    if (!oldTool) {
      // New tool added
      changes.push({
        type: 'added',
        tool: toolId,
        message: `${toolId} pricing added to system`
      });
      continue;
    }

    // Check each plan in the tool
    for (const planName of Object.keys(newTool)) {
      const oldPlan = oldTool[planName];
      const newPlan = newTool[planName];

      if (!oldPlan) {
        // New plan added
        changes.push({
          type: 'plan_added',
          tool: toolId,
          plan: planName,
          message: `${toolId} ${planName} plan added`
        });
        continue;
      }

      // Check if price changed
      if (oldPlan.pricePerSeat !== newPlan.pricePerSeat) {
        changes.push({
          type: 'price_changed',
          tool: toolId,
          plan: planName,
          oldPrice: oldPlan.pricePerSeat,
          newPrice: newPlan.pricePerSeat,
          message: `${toolId} ${planName}: $${oldPlan.pricePerSeat} → $${newPlan.pricePerSeat}`
        });
      }
    }

    // Check if plans were removed
    for (const planName of Object.keys(oldTool)) {
      if (!newTool[planName]) {
        changes.push({
          type: 'plan_removed',
          tool: toolId,
          plan: planName,
          message: `${toolId} ${planName} plan removed`
        });
      }
    }
  }

  // Check if tools were removed
  for (const toolId of Object.keys(oldSnapshot)) {
    if (!newSnapshot[toolId]) {
      changes.push({
        type: 'removed',
        tool: toolId,
        message: `${toolId} removed from pricing`
      });
    }
  }

  return changes;
}