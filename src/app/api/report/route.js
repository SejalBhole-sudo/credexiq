import { supabase } from "@/lib/supabase";
import { createPricingSnapshot } from "@/lib/pricingSnapshot";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      reportData,
      email,
      formData,
    } = body;

    // Validate input
    if (!reportData) {
      return Response.json(
        {
          success: false,
          error: "No report data provided",
        },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return Response.json(
        {
          success: false,
          error: "Missing Supabase URL",
        },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return Response.json(
        {
          success: false,
          error: "Missing Supabase key",
        },
        { status: 500 }
      );
    }

    // Insert report into reports table
    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          report_data: reportData,
        },
      ])
      .select()
      .single();

    // Handle insert errors
    if (error) {
      console.error("Database insertion error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      let userMessage = "Failed to save report";

      if (error.code === "42P01") {
        userMessage = "Reports table not found";
      } else if (error.code === "42501") {
        userMessage = "Permission denied";
      } else if (error.code === "23505") {
        userMessage = "Duplicate report";
      }

      return Response.json(
        {
          success: false,
          error: userMessage,
          code: error.code,
        },
        { status: 500 }
      );
    }

    // Verify insert returned data
    if (!data || !data.id) {
      return Response.json(
        {
          success: false,
          error: "Report created but no ID returned",
        },
        { status: 500 }
      );
    }

    // Determine email - use explicit email param first, fallback to formData if needed
   const userEmail =
  email?.trim() ||
  "unknown@example.com";
    
    // Save audit log (non-blocking)
    const { error: auditError } = await supabase
      .from("audits")
      .insert([
        {
          id: data.id,
          user_email: userEmail,
          input_stack: formData || {},
          output_result: reportData,
          pricing_snapshot: createPricingSnapshot(),
        },
      ]);

    // Audit errors should not fail main request
    if (auditError) {
      console.error("Audit persistence error:", auditError);
    }

    // Success response
    return Response.json({
      success: true,
      id: data.id,
    });

  } catch (error) {
    console.error("Report API error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}