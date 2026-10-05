export default function StudentVerification() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

      <div className="mb-7">

        <h1 className="text-2xl font-bold text-slate-900">
          Verification
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track items that require mentor verification.
        </p>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <p className="text-sm text-slate-500">
          You have no pending verification requests.
        </p>

      </div>

    </div>
  );
}