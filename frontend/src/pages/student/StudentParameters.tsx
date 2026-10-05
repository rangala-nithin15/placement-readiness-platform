import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Award } from "lucide-react";
import { getMyPlacementReadiness, type PlacementReadiness } from "../../services/placementService";

export default function StudentParameters() {
  const [placement, setPlacement] = useState<PlacementReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getMyPlacementReadiness();
        setPlacement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load parameters.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <p className="mt-4 text-sm text-slate-500">Loading placement parameters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !placement) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error || "Failed to load parameters."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Placement Parameters</h1>
          <p className="mt-1 text-sm text-slate-500">
            12 official evaluation parameters totaling {placement.maximum_score} marks.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Award className="text-indigo-600" size={20} />
          <div>
            <p className="text-xs text-slate-400">Total Marks Earned</p>
            <p className="text-sm font-bold text-slate-900">
              {placement.total_score} / {placement.maximum_score} ({placement.percentage}%)
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
            <span>Parameter</span>
            <span>Earned / Max Marks</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {placement.parameter_scores.map((param) => {
            const pct = param.max_marks > 0 ? (param.earned_marks / param.max_marks) * 100 : 0;
            const isCompleted = param.earned_marks >= param.max_marks && param.max_marks > 0;

            return (
              <div key={param.parameter_id} className="p-6 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                      {param.parameter_id}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{param.name}</h3>
                      {param.details && param.details.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {param.details.map((detail, idx) => (
                            <span key={idx} className="text-xs text-slate-500">
                              {detail}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">No achievements recorded yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="flex items-center sm:justify-end gap-2">
                      <span className="text-lg font-bold text-slate-900">{param.earned_marks}</span>
                      <span className="text-xs text-slate-400">/ {param.max_marks} marks</span>
                    </div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={12} /> Max Reached
                      </span>
                    ) : param.earned_marks > 0 ? (
                      <span className="text-xs font-medium text-blue-600">{Math.round(pct)}% achieved</span>
                    ) : (
                      <span className="text-xs text-slate-400">Pending activity</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? "bg-emerald-500" : param.earned_marks > 0 ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}