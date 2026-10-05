import {
  AlertCircle,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { getStoredUser, getToken } from "../../services/authStorage";

type MentorStudent = {
  id: string;
  name: string;
  email: string;
  register_number?: string;
  department?: string;
  batch?: string;
  profile_completion: number;
  level?: string;
  placement_score?: number;
};

type MentorStudentResponse = {
  students: MentorStudent[];
  total: number;
};

export default function MentorDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [students, setStudents] = useState<MentorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const data = await apiRequest<MentorStudentResponse>(
        "/mentor/students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(data.students || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assigned students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.register_number && s.register_number.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (levelFilter === "ALL") return true;
      if (levelFilter === "NEEDS_ATTENTION") return s.profile_completion < 50;
      return (s.level || "LEVEL 1") === levelFilter;
    });
  }, [students, search, levelFilter]);

  const completedProfiles = students.filter((s) => s.profile_completion >= 80).length;
  const incompleteProfiles = students.filter((s) => s.profile_completion < 50).length;

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {user?.department || "CSE"} Department
              </span>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user?.batch || "2024-28"} Batch
              </span>
              {user?.mentor_id && (
                <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                  {user.mentor_id}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              Assigned Mentee Cohort
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Only students directly assigned to you are accessible in this workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{students.length}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total Mentees</p>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assigned Students
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {students.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Profiles Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {completedProfiles}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Needs Attention
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {incompleteProfiles}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
      </section>

      {/* STUDENTS TABLE SECTION */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Students List ({filteredStudents.length})
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Click any row to inspect readiness details, external profiles and verification status.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or reg no..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-slate-900 dark:focus:border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400 mr-1">Filter:</span>
            {[
              { id: "ALL", label: "All" },
              { id: "LEVEL 1", label: "Level 1" },
              { id: "LEVEL 2", label: "Level 2" },
              { id: "LEVEL 3", label: "Level 3" },
              { id: "ELITE", label: "Elite" },
              { id: "NEEDS_ATTENTION", label: "Needs Attention" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLevelFilter(tab.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  levelFilter === tab.id
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-200" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading assigned students...</p>
          </div>
        )}

        {!loading && error && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={loadStudents}
              className="mt-4 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredStudents.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Users size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {students.length === 0
                ? "No students assigned to your account yet."
                : "No students matching your filter criteria."}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {students.length === 0
                ? "Students can be assigned by administrator."
                : "Try resetting your search or filter pills."}
            </p>
          </div>
        )}

        {!loading && !error && filteredStudents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/70 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Register Number</th>
                  <th className="px-6 py-3.5">Current Level</th>
                  <th className="px-6 py-3.5">Readiness Score</th>
                  <th className="px-6 py-3.5">Profile Completion</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredStudents.map((student) => {
                  const level = student.level || "LEVEL 1";
                  const score = student.placement_score ?? 0;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => navigate(`/mentor/students/${student.id}`)}
                      className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {student.register_number || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            level === "ELITE"
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              : level === "LEVEL 3"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : level === "LEVEL 2"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {level}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">{score}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">/ 250</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                student.profile_completion >= 80
                                  ? "bg-emerald-500"
                                  : student.profile_completion >= 40
                                  ? "bg-indigo-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${student.profile_completion}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {student.profile_completion}%
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                          View Details →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}