import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Target,
} from "lucide-react";

import {
  getMyPlacementReadiness,
  type PlacementReadiness,
} from "../../services/placementService";


export default function StudentDashboard() {

  const [
    placement,
    setPlacement,
  ] = useState<PlacementReadiness | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    async function loadPlacement() {

      try {

        setLoading(true);

        const data =
          await getMyPlacementReadiness();

        setPlacement(data);

      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load placement readiness."
        );

      } finally {

        setLoading(false);

      }
    }

    loadPlacement();

  }, []);


  if (loading) {

    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-white">
            Placement Readiness
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Loading your placement progress...
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />

          <div className="mt-6 h-4 w-full animate-pulse rounded bg-slate-800" />

          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-800" />

        </div>

      </div>
    );
  }


  if (error) {

    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-semibold text-white">
            Placement Readiness
          </h1>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

          <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />

          <div>

            <p className="font-medium text-red-300">
              Unable to load placement data
            </p>

            <p className="mt-1 text-sm text-red-300/80">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }


  if (!placement) {
    return null;
  }


  const progressPercentage =
    Math.min(
      100,
      Math.max(
        0,
        placement.percentage
      )
    );


  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-semibold text-white">
          Placement Readiness
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Your current placement development progress.
        </p>

      </div>


      {/* SCORE */}

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Current Score
              </p>

              <div className="mt-2 flex items-end gap-2">

                <span className="text-5xl font-bold text-white">
                  {placement.total_score}
                </span>

                <span className="mb-1 text-lg text-slate-500">
                  / {placement.maximum_score}
                </span>

              </div>

            </div>

            <div className="rounded-xl bg-indigo-500/10 p-3">
              <Target className="h-6 w-6 text-indigo-400" />
            </div>

          </div>


          <div className="mt-6">

            <div className="mb-2 flex justify-between text-sm">

              <span className="text-slate-400">
                Overall progress
              </span>

              <span className="font-medium text-white">
                {placement.percentage}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* LEVEL */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Current Placement Level
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            {placement.current_level}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {placement.placement_category}
          </p>

          <div className="mt-6 flex items-center gap-2">

            {placement.eligible ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-400" />
            )}

            <span
              className={
                placement.eligible
                  ? "text-sm font-medium text-emerald-400"
                  : "text-sm font-medium text-amber-400"
              }
            >
              {placement.eligible
                ? "Eligible"
                : "Not Eligible"}
            </span>

          </div>

        </div>

      </div>


      {/* NEXT TARGET */}

      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">

        <div className="flex items-start justify-between gap-6">

          <div>

            <p className="text-sm font-medium text-indigo-400">
              NEXT TARGET
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              {placement.next_level}
            </h2>

            <p className="mt-2 text-sm text-slate-400">

              {placement.marks_needed > 0
                ? `${placement.marks_needed} marks needed to reach the next level.`
                : "You have reached the highest available level."}

            </p>

          </div>

          <ArrowRight className="h-6 w-6 text-indigo-400" />

        </div>

      </div>


      {/* PARAMETERS */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 p-6">

          <h2 className="text-lg font-semibold text-white">
            Parameter Progress
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Your progress across the placement framework.
          </p>

        </div>


        <div className="divide-y divide-slate-800">

          {placement.parameter_scores.map(
            (parameter) => {

              const percentage =
                parameter.max_marks > 0
                  ? (
                      parameter.earned_marks /
                      parameter.max_marks
                    ) * 100
                  : 0;

              return (
                <div
                  key={parameter.parameter_id}
                  className="p-5"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="min-w-0">

                      <p className="font-medium text-white">
                        {parameter.name}
                      </p>

                      {parameter.details.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500">
                          {parameter.details[0]}
                        </p>
                      )}

                    </div>

                    <div className="shrink-0 text-sm">

                      <span className="font-semibold text-white">
                        {parameter.earned_marks}
                      </span>

                      <span className="text-slate-500">
                        {" "}
                        / {parameter.max_marks}
                      </span>

                    </div>

                  </div>


                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            percentage
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* CONDITIONS */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 p-6">

          <h2 className="text-lg font-semibold text-white">
            Placement Conditions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Conditions required for each placement level.
          </p>

        </div>


        <div className="divide-y divide-slate-800">

          {placement.conditions.map(
            (condition) => {

              return (
                <div
                  key={condition.level}
                  className="flex items-center justify-between gap-4 p-5"
                >

                  <div>

                    <p className="font-medium text-white">
                      {condition.level}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Score: {condition.required_score}
                      {" • "}
                      Coding Assessment:{" "}
                      {condition.coding_assessment_required}
                      {" • "}
                      GATE:{" "}
                      {condition.gate_required}
                    </p>

                  </div>


                  <div>

                    {condition.conditions_satisfied ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">

                        <CheckCircle2 className="h-3.5 w-3.5" />

                        Satisfied

                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                        Not satisfied
                      </span>
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}