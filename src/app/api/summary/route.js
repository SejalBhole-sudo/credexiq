// File: app/api/summary/route.js

export async function POST(req) {
  try {
    const { reportData, formData } = await req.json();

const auditResult = reportData;
const useCase = formData?.useCase || "general";
    const prompt = `
You are an expert AI infrastructure cost analyst.

A user completed an AI spend audit.

Current monthly spend: $${auditResult.totalCurrentSpend}
Potential monthly savings: $${auditResult.totalMonthlySaving}
Primary use case: ${useCase}

Tools audited:
${auditResult.results
  .map(
    (r) =>
      `${r.toolName} (${r.plan}, $${r.currentSpend}/mo)`
  )
  .join(", ")}

Write a concise, professional, and natural-sounding executive summary of the user's AI spending audit.

The summary should:
- explain the current spending situation
- identify inefficiencies or unnecessary costs
- recommend practical optimizations
- mention estimated long-term savings
- sound conversational and premium
- avoid markdown formatting or section headings

Keep it under 140 words.
`
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // If Gemini fails for any reason,
    // frontend fallback summary handles UX
    if (data.error) {
      console.error(
        "Gemini API Error:",
        data.error.message
      );

      return Response.json({
        summary: null,
        success: false,
      });
    }

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    return Response.json({
      summary,
      success: !!summary,
    });

  } catch (error) {
    console.error(
      "Summary API Route Error:",
      error
    );

    return Response.json(
      {
        summary: null,
        success: false,
      },
      { status: 500 }
    );
  }
}