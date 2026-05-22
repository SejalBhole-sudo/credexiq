import { supabase } from "@/lib/supabase";
import { runAudit } from "@/lib/auditEngine";

export default async function ReauditPage({ params }) {
  const { id } = await params;
  const { data: audit, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !audit) {
    return (
      <main className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Re-Audit Not Found
          </h1>

          <p className="text-gray-400">
            This audit could not be located.
          </p>
        </div>
      </main>
    );
  }

  const oldResult = audit.output_result;

  const newResult = runAudit(
    audit.input_stack
  );

  const monthlyDelta =
  (newResult.totalMonthlySaving || 0) -
  (oldResult.totalMonthlySaving || 0);

const annualDelta =
  (newResult.totalAnnualSaving || 0) -
  (oldResult.totalAnnualSaving || 0);

  return (
    <main className="min-h-screen bg-[#0B1120] text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-3">
            🔄 Audit Update
          </h1>

            
          <p className="text-gray-400">
            Comparing historical audit results with
            recommendations generated using current pricing data.
          </p>
        </div>

        {/* Savings Impact */}
<div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
  <h2 className="text-2xl font-bold mb-4">
    Savings Impact
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p className="text-gray-400">
        Monthly Savings Change
      </p>

      <p className="text-3xl font-black text-green-400">
        ${monthlyDelta.toFixed(2)}
      </p>
    </div>

    <div>
      <p className="text-gray-400">
        Annual Savings Change
      </p>

      <p className="text-3xl font-black text-cyan-400">
        ${annualDelta.toFixed(2)}
      </p>
    </div>

  </div>
</div>

        {/* Savings Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Previous Audit
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-gray-400">
                  Monthly Savings
                </p>

                <p className="text-3xl font-black text-green-400">
                  $
                  {oldResult.totalMonthlySaving?.toFixed(0)}
                </p>
              </div>

              <div>
                <p className="text-gray-400">
                  Annual Savings
                </p>

                <p className="text-2xl font-bold">
                  $
                  {oldResult.totalAnnualSaving?.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Updated Audit
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-gray-400">
                  Monthly Savings
                </p>

                <p className="text-3xl font-black text-cyan-400">
                  $
                  {newResult.totalMonthlySaving?.toFixed(0)}
                </p>
              </div>

              <div>
                <p className="text-gray-400">
                  Annual Savings
                </p>

                <p className="text-2xl font-bold">
                  $
                  {newResult.totalAnnualSaving?.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Previous Recommendations */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Previous Recommendations
          </h2>

          {oldResult.results.map((tool) => (
            <div
              key={tool.toolId}
              className="mb-6 border border-white/10 rounded-xl p-5"
            >
              <h3 className="font-bold text-lg mb-3">
                {tool.toolName}
              </h3>

              {tool.recommendations.length === 0 ? (
                <p className="text-green-400">
                  ✓ Already optimized
                </p>
              ) : (
                <ul className="space-y-2">
                  {tool.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="text-gray-300"
                    >
                      • {rec.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Updated Recommendations */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Updated Recommendations
          </h2>

          {newResult.results.map((tool) => (
            <div
              key={tool.toolId}
              className="mb-6 border border-white/10 rounded-xl p-5"
            >
              <h3 className="font-bold text-lg mb-3">
                {tool.toolName}
              </h3>

              {tool.recommendations.length === 0 ? (
                <p className="text-green-400">
                  ✓ Already optimized
                </p>
              ) : (
                <ul className="space-y-2">
                  {tool.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="text-gray-300"
                    >
                      • {rec.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

