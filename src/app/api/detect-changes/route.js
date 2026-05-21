import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { detectPricingChanges } from "@/lib/detectPricingChanges";
import { sendReauditEmail } from "@/lib/sendReauditEmail";

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

const emailPromises = affectedAudits.map((audit) =>
  sendReauditEmail({
    email: audit.email,
    auditId: audit.auditId,
    oldResult: audit.oldResult,
    newResult: audit.newResult,
  })
);

await Promise.allSettled(emailPromises);

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