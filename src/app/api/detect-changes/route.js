import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { detectPricingChanges } from "@/lib/detectPricingChanges";

export async function GET() {
  try {
    // fetch all stored audits
    const { data: audits, error } = await supabase
      .from("audits")
      .select("*");

    if (error) {
      throw error;
    }

    // detect affected audits
    const affectedAudits =
      await detectPricingChanges(audits);

    return NextResponse.json({
      success: true,
      affectedAudits,
    });
  } catch (error) {
    console.error("Detect changes failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}