import { OFFICIAL_PRICING } from "@/data/pricingData";

export function createPricingSnapshot() {
  return JSON.parse(JSON.stringify(OFFICIAL_PRICING));
}