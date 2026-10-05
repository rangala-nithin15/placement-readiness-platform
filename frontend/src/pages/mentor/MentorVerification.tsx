import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getMentorVerificationRequests,
  reviewVerificationRequest,
  type MentorVerificationItem,
} from "../../services/verificationService";

export default function MentorVerification() {
  const [requests, setRequests] = useState<MentorVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");
      const res = await getMentorVerificationRequests();
      setRequests(res.requests || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load verification requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleReview(
    requestId: string,
    action: "APPROVE" | "REJECT"
  ) {
    try {
      setActingId(requestId);
      setError("");
      setSuccess("");
      const note = reviewNote[requestId] || "";
      const res = await reviewVerificationRequest(requestId, action, note);
      setSuccess(
        res.message ||
          `Request successfully ${
            action === "APPROVE" ? "approved" : "rejected"
          }.`
      );
      // Remove reviewed request from list
      setRequests((current) =>
        current.filter((item) => item.request.id !== requestId)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to review verification request."
      );
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Student Profile Verifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and verify external coding profiles submitted by your assigned mentees.
          </p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Requests
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
        <div className="flex items-center justify-center py-24 text-slate-500">
          <RefreshCw size={24} className="animate-spin mr-2" />
          Loading pending verifications...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No Pending Verifications
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            All profile verification requests for your mentees have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500 px-1">
            <span>Pending Requests ({requests.length})</span>
            <span>Only assigned mentees</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {requests.map(({ request, student, profile }) => (
              <div
                key={request.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* CARD HEADER: STUDENT INFO */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-medium">
                          {student.register_number}
                        </span>
                        <span>•</span>
                        <span>{student.department || "CSE"}</span>
                        <span>•</span>
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Clock size={12} />
                    Pending Review
                  </span>
                </div>

                {/* PROFILE DETAILS */}
                <div className="my-4 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold uppercase text-slate-700">
                        {profile.platform}
                      </span>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        @{profile.username}
                      </p>
                    </div>
                    <a
                      href={profile.profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm hover:bg-slate-50"
                    >
                      Inspect Profile
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  {/* STATS SUMMARY IF AVAILABLE */}
                  {profile.stats && Object.keys(profile.stats).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-slate-200/60 pt-3 text-xs">
                      {profile.platform === "leetcode" && (
                        <>
                          <div className="rounded bg-white p-2 border border-slate-200">
                            <span className="text-slate-400 block">Solved</span>
                            <span className="font-bold text-slate-800">
                              {String(profile.stats.problems_solved ?? "0")}
                            </span>
                          </div>
                          <div className="rounded bg-white p-2 border border-slate-200">
                            <span className="text-slate-400 block">Contest Rating</span>
                            <span className="font-bold text-slate-800">
                              {String(profile.stats.contest_rating ?? "Unrated")}
                            </span>
                          </div>
                          <div className="rounded bg-white p-2 border border-slate-200">
                            <span className="text-slate-400 block">Hard</span>
                            <span className="font-bold text-slate-800">
                              {String(profile.stats.hard ?? "0")}
                            </span>
                          </div>
                        </>
                      )}
                      {profile.platform === "github" && (
                        <>
                          <div className="rounded bg-white p-2 border border-slate-200">
                            <span className="text-slate-400 block">Public Repos</span>
                            <span className="font-bold text-slate-800">
                              {String(profile.stats.public_repos ?? "0")}
                            </span>
                          </div>
                          <div className="rounded bg-white p-2 border border-slate-200">
                            <span className="text-slate-400 block">Followers</span>
                            <span className="font-bold text-slate-800">
                              {String(profile.stats.followers ?? "0")}
                            </span>
                          </div>
                          <div className="rounded bg-white p-2 border border-slate-200">
                            <span className="text-slate-400 block">Stars</span>
                            <span className="font-bold text-slate-800">
                              {String(profile.stats.total_stars ?? "0")}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-right text-[11px] text-slate-400">
                    Requested on {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>

                {/* REVIEW CONTROLS */}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={reviewNote[request.id] || ""}
                    onChange={(e) =>
                      setReviewNote((prev) => ({
                        ...prev,
                        [request.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional review note or feedback for student..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReview(request.id, "REJECT")}
                      disabled={actingId === request.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleReview(request.id, "APPROVE")}
                      disabled={actingId === request.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actingId === request.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={14} />
                      )}
                      Approve & Verify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
