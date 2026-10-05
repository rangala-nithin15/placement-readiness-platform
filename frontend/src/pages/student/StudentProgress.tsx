import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Target,
} from "lucide-react";

import {
  getMyPlacementReadiness,
  type PlacementReadiness,
} from "../../services/placementService";

export default function StudentProgress() {
  const [placement, setPlacement] = useState<PlacementReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await getMyPlacementReadiness();
        setPlacement(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load progress."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            My Progress
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Loading your placement progress...
          </p>
        </div>

        <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !placement) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 p-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">
              Unable to load progress
            </p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-300/80">
              {error || "Placement data unavailable."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          My Progress
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your progress across all placement parameters.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-sm text-slate-500 dark:text-slate-400">Current Score</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {placement.total_score}
            <span className="text-lg text-slate-400 dark:text-slate-500">
              {" "}
              / {placement.maximum_score}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-sm text-slate-500 dark:text-slate-400">Current Level</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {placement.current_level}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <p className="text-sm text-slate-500 dark:text-slate-400">Next Level</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {placement.next_level}
          </p>
          {placement.marks_needed > 0 && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {placement.marks_needed} marks needed
            </p>
          )}
        </div>
      </div>

      {/* OVERALL PROGRESS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Overall Placement Progress
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {placement.total_score} out of {placement.maximum_score} marks
            </p>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            {placement.percentage}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all"
            style={{
              width: `${Math.min(100, placement.percentage)}%`,
            }}
          />
        </div>
      </div>

      {/* PARAMETERS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                12 Parameter Progress
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                See how much you have earned in every parameter.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {placement.parameter_scores.map((parameter) => {
            const percentage =
              parameter.max_marks > 0
                ? (parameter.earned_marks / parameter.max_marks) * 100
                : 0;

            const completed = parameter.earned_marks >= parameter.max_marks;

            return (
              <div key={parameter.parameter_id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="mt-0.5">
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Target className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {parameter.parameter_id}. {parameter.name}
                      </h3>

                      {parameter.details.length > 0 && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {parameter.details.join(" ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {parameter.earned_marks}
                      <span className="font-normal text-slate-400 dark:text-slate-500">
                        {" "}
                        / {parameter.max_marks}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {Math.round(percentage)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, percentage))}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONDITIONS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="border-b border-slate-200 dark:border-slate-800 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Level Requirements
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your current status against each placement level.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {placement.conditions.map((condition) => (
            <div key={condition.level} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {condition.level}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Required score: {condition.required_score}
                  </p>
                </div>

                {condition.conditions_satisfied ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Satisfied
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Not satisfied
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-2 text-xs md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3">
                  <p className="text-slate-500 dark:text-slate-400">Score</p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                    {condition.score_satisfied
                      ? "Completed"
                      : `Need ${condition.required_score}`}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3">
                  <p className="text-slate-500 dark:text-slate-400">Coding Assessment</p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                    {condition.coding_assessment_satisfied
                      ? "Completed"
                      : `Required ${condition.coding_assessment_required}`}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3">
                  <p className="text-slate-500 dark:text-slate-400">GATE</p>
                  <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                    {condition.gate_satisfied
                      ? "Completed"
                      : `Required ${condition.gate_required}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}