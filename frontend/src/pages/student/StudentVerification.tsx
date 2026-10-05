import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getExternalProfiles,
  type ExternalProfile,
} from "../../services/externalProfileService";
import {
  getStudentVerificationRequests,
  requestVerification,
  type VerificationRequestItem,
} from "../../services/verificationService";

export default function StudentVerification() {
  const [profiles, setProfiles] = useState<ExternalProfile[]>([]);
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [profilesRes, requestsRes] = await Promise.all([
        getExternalProfiles(),
        getStudentVerificationRequests(),
      ]);
      setProfiles(profilesRes.profiles || []);
      setRequests(requestsRes.requests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load verification data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRequestVerification(profileId: string) {
    try {
      setRequestingId(profileId);
      setError("");
      setSuccess("");
      const res = await requestVerification(profileId);
      setSuccess(res.message || "Verification request submitted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit verification request."
      );
    } finally {
      setRequestingId(null);
    }
  }

  const pendingRequestProfileIds = new Set(
    requests
      .filter((r) => r.status === "PENDING")
      .map((r) => r.external_profile_id)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Profile Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Request official faculty verification for your connected profiles.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw size={24} className="animate-spin mr-2" />
          Loading verification requests...
        </div>
      ) : (
        <div className="space-y-8">
          {/* CONNECTED PROFILES REQUIRING VERIFICATION */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Connected Profiles
              </h2>
              <Link
                to="/student/profiles"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                + Connect New Profile
              </Link>
            </div>

            {profiles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900">
                  No connected profiles yet
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Connect your LeetCode, GitHub, CodeChef, or HackerRank profiles
                  first.
                </p>
                <Link
                  to="/student/profiles"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Connect Profile
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((p) => {
                  const isVerified = p.verification_status === "VERIFIED";
                  const isRejected = p.verification_status === "REJECTED";
                  const hasPendingReq = pendingRequestProfileIds.has(p.id);

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase text-slate-700">
                              {p.platform}
                            </span>
                            <h3 className="mt-2 font-semibold text-slate-900">
                              @{p.username}
                            </h3>
                          </div>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 size={13} />
                              Verified
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              <XCircle size={13} />
                              Rejected
                            </span>
                          ) : hasPendingReq ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <Clock size={13} />
                              Under Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              Pending
                            </span>
                          )}
                        </div>

                        <a
                          href={p.profile_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          View External Profile
                          <ExternalLink size={12} />
                        </a>

                        {p.last_verified_at && (
                          <p className="mt-2 text-xs text-slate-400">
                            Verified on:{" "}
                            {new Date(p.last_verified_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4">
                        {isVerified ? (
                          <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Approved by Mentor
                          </p>
                        ) : hasPendingReq ? (
                          <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
                            Verification request sent. Awaiting mentor approval.
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestVerification(p.id)}
                            disabled={requestingId === p.id}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {requestingId === p.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                            {isRejected
                              ? "Request Re-Verification"
                              : "Request Verification"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* REQUEST HISTORY TABLE */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Verification Request History
            </h2>
            {requests.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No verification requests submitted yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                    <tr>
                      <th className="px-6 py-3">Profile ID</th>
                      <th className="px-6 py-3">Submitted At</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Reviewed At</th>
                      <th className="px-6 py-3">Mentor Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {r.external_profile_id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {r.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 size={12} />
                              Approved
                            </span>
                          )}
                          {r.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                          {r.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                              <XCircle size={12} />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {r.reviewed_at
                            ? new Date(r.reviewed_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {r.review_note || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}