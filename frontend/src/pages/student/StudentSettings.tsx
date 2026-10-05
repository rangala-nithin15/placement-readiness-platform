export default function StudentSettings() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">

      <div className="mb-7">

        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account preferences.
        </p>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div>

            <h2 className="font-semibold text-slate-900">
              Account settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Account security and preferences will be available here.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}