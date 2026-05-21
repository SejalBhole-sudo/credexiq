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

// group audits by user email
const auditsByEmail = {};

for (const audit of affectedAudits) {
  if (!audit.email) continue;

  if (!auditsByEmail[audit.email]) {
    auditsByEmail[audit.email] = [];
  }

  auditsByEmail[audit.email].push(audit);
}

// send ONE email per user
const emailPromises = Object.entries(auditsByEmail).map(
  async ([email, audits]) => {
    const latestAudit = audits[0];

    return sendReauditEmail({
      email,
      auditId: latestAudit.auditId,
      oldResult: latestAudit.oldResult,
      newResult: latestAudit.newResult,
    });
  }
);

await Promise.allSettled(emailPromises);
for (const audit of affectedAudits) {
  await supabase
    .from("audits")
    .update({
      pricing_changed: true,
      notified_at: new Date().toISOString(),
    })
    .eq("id", audit.auditId);
}

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