import { pricingData } from "@/data/pricingData";

export function createPricingSnapshot() {
  return JSON.parse(JSON.stringify(pricingData));
}