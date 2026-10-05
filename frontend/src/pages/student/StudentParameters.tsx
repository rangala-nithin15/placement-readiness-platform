export default function StudentParameters() {
  const parameters = [
    "Coding Problems Solved",
    "Open-Source Contribution",
    "Competition Achievement",
    "Certification Achievement",
    "Competitive Programming Rating",
    "Project / Publication / Patent",
    "Aptitude & Communication",
    "Monthly Coding Assessment",
    "GATE / Higher Studies",
    "Internship / Startup / Industry",
    "Foreign Language",
    "Hundred Days Training Programme",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

      <div className="mb-7">

        <h1 className="text-2xl font-bold text-slate-900">
          Placement Parameters
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your progress across the placement framework parameters.
        </p>

      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-4">

          <h2 className="font-semibold text-slate-900">
            Your parameters
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Official marks and milestone rules will be connected from the placement framework later.
          </p>

        </div>

        <div className="divide-y divide-slate-100">

          {parameters.map((parameter, index) => (

            <div
              key={parameter}
              className="flex items-center justify-between px-6 py-4"
            >

              <div className="flex items-center gap-4">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {index + 1}
                </span>

                <span className="text-sm font-medium text-slate-700">
                  {parameter}
                </span>

              </div>

              <span className="text-xs text-slate-400">
                Not calculated
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}