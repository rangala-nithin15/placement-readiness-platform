import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  LogOut,
  Plus,
  Search,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/common/ThemeToggle";
import { apiRequest } from "../../services/api";
import { clearAuth, getStoredUser, getToken } from "../../services/authStorage";

type OverviewData = {
  total_students: number;
  total_mentors: number;
  total_assignments: number;
  departments: string[];
  batches: string[];
};

type StudentItem = {
  id: string;
  name: string;
  email: string;
  register_number?: string;
  department?: string;
  batch?: string;
  is_active: boolean;
  assigned_mentor_name?: string;
  assigned_mentor_id?: string;
};

type MentorItem = {
  id: string;
  name: string;
  email: string;
  mentor_id?: string;
  department?: string;
  batch?: string;
  is_active: boolean;
  is_approved: boolean;
  assigned_students_count: number;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [activeTab, setActiveTab] = useState<"overview" | "mentors" | "students" | "assign">("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Filter
  const [search, setSearch] = useState("");

  // Assign Student Modal/Form State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Create Mentor State
  const [showCreateMentor, setShowCreateMentor] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorPassword, setMentorPassword] = useState("Password@123");
  const [mentorDept, setMentorDept] = useState("CSE");
  const [mentorBatch, setMentorBatch] = useState("2024-28");
  const [mentorCode, setMentorCode] = useState("");
  const [creatingMentor, setCreatingMentor] = useState(false);

  function getHeaders() {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const headers = getHeaders();

      const [ovData, stData, meData] = await Promise.all([
        apiRequest<OverviewData>("/admin/overview", { headers }),
        apiRequest<{ students: StudentItem[] }>("/admin/students", { headers }),
        apiRequest<{ mentors: MentorItem[] }>("/admin/mentors", { headers }),
      ]);

      setOverview(ovData);
      setStudents(stData.students || []);
      setMentors(meData.mentors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAssignStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentId || !selectedMentorId) {
      setError("Please select both a student and a mentor.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      await apiRequest("/admin/assignments", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          student_id: selectedStudentId,
          mentor_id: selectedMentorId,
        }),
      });
      setSuccess("Student successfully assigned to mentor!");
      setSelectedStudentId("");
      setSelectedMentorId("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign student.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleCreateMentor(e: React.FormEvent) {
    e.preventDefault();
    if (!mentorName.trim() || !mentorEmail.trim() || !mentorDept.trim()) {
      setError("Please fill all required mentor fields.");
      return;
    }

    try {
      setCreatingMentor(true);
      setError("");
      await apiRequest("/admin/mentors", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: mentorName.trim(),
          email: mentorEmail.trim(),
          password: mentorPassword,
          department: mentorDept.trim().toUpperCase(),
          batch: mentorBatch.trim(),
          mentor_id: mentorCode.trim() ? mentorCode.trim().toUpperCase() : undefined,
        }),
      });
      setSuccess("Mentor created successfully!");
      setShowCreateMentor(false);
      setMentorName("");
      setMentorEmail("");
      setMentorCode("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mentor.");
    } finally {
      setCreatingMentor(false);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMentors = mentors.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.mentor_id?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="mt-4 text-sm text-slate-500">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* HEADER */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Administration Console</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Placement Readiness Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {user?.name || user?.email} <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">ADMIN</span>
            </span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mx-auto flex max-w-7xl gap-6 px-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 py-3 text-sm font-medium ${
              activeTab === "overview" ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("mentors")}
            className={`border-b-2 py-3 text-sm font-medium ${
              activeTab === "mentors" ? "border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Mentors ({mentors.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`border-b-2 py-3 text-sm font-medium ${
              activeTab === "students" ? "border-slate-900 text-slate-900 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("assign")}
            className={`border-b-2 py-3 text-sm font-medium ${
              activeTab === "assign" ? "border-slate-900 text-slate-900 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Assign Students
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Total Mentors</p>
                  <Users className="text-blue-500" size={24} />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">{overview?.total_mentors ?? 0}</p>
                <p className="mt-1 text-xs text-slate-400">Assigned & Active Faculty</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Total Students</p>
                  <GraduationCap className="text-emerald-500" size={24} />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">{overview?.total_students ?? 0}</p>
                <p className="mt-1 text-xs text-slate-400">Registered across batches</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Active Assignments</p>
                  <UserCheck className="text-purple-500" size={24} />
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">{overview?.total_assignments ?? 0}</p>
                <p className="mt-1 text-xs text-slate-400">Mentor-Student pairings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Registered Departments</h3>
                <div className="flex flex-wrap gap-2">
                  {overview?.departments.map((d) => (
                    <span key={d} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {d}
                    </span>
                  ))}
                  {(!overview?.departments || overview.departments.length === 0) && (
                    <p className="text-xs text-slate-400">No departments configured.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Active Batches</h3>
                <div className="flex flex-wrap gap-2">
                  {overview?.batches.map((b) => (
                    <span key={b} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {b}
                    </span>
                  ))}
                  {(!overview?.batches || overview.batches.length === 0) && (
                    <p className="text-xs text-slate-400">No batches configured.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MENTORS */}
        {activeTab === "mentors" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search mentors by name, ID, department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <button
                onClick={() => setShowCreateMentor(!showCreateMentor)}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={16} />
                Add New Mentor
              </button>
            </div>

            {/* Create Mentor Modal / Drawer */}
            {showCreateMentor && (
              <form onSubmit={handleCreateMentor} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900">Create Mentor Account</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Rajesh Kumar"
                      value={mentorName}
                      onChange={(e) => setMentorName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="mentor@placement.edu"
                      value={mentorEmail}
                      onChange={(e) => setMentorEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={mentorPassword}
                      onChange={(e) => setMentorPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      placeholder="CSE"
                      value={mentorDept}
                      onChange={(e) => setMentorDept(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Batch</label>
                    <input
                      type="text"
                      placeholder="2024-28"
                      value={mentorBatch}
                      onChange={(e) => setMentorBatch(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Mentor ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty (e.g. CSE-MENTOR-001)"
                      value={mentorCode}
                      onChange={(e) => setMentorCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateMentor(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingMentor}
                    className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {creatingMentor ? "Creating..." : "Save Mentor"}
                  </button>
                </div>
              </form>
            )}

            {/* Mentors Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Mentor ID</th>
                    <th className="px-6 py-3">Name & Email</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Batch</th>
                    <th className="px-6 py-3">Assigned Students</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMentors.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{m.mentor_id || "—"}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {m.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{m.batch || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{m.assigned_students_count}</span> students
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredMentors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No mentors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search students by name, register number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Register No</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Batch</th>
                    <th className="px-6 py-3">Assigned Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{s.register_number || "—"}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {s.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{s.batch}</td>
                      <td className="px-6 py-4">
                        {s.assigned_mentor_name ? (
                          <div>
                            <p className="font-medium text-slate-900">{s.assigned_mentor_name}</p>
                            <p className="font-mono text-xs text-blue-600">{s.assigned_mentor_id}</p>
                          </div>
                        ) : (
                          <span className="inline-block rounded bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Unassigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGN STUDENTS */}
        {activeTab === "assign" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
            <h3 className="font-semibold text-slate-900 mb-2">Assign Student to Mentor</h3>
            <p className="text-xs text-slate-500 mb-6">
              Pair a student with their designated faculty mentor. Mentors will only have access to their assigned students.
            </p>

            <form onSubmit={handleAssignStudent} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.register_number}) - {s.department} {s.assigned_mentor_name ? `[Current: ${s.assigned_mentor_name}]` : "[Unassigned]"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Mentor *</label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:border-slate-900 focus:outline-none"
                >
                  <option value="">-- Choose Mentor --</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.mentor_id || m.email}) - {m.department} ({m.assigned_students_count} students)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={assigning}
                className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign Student to Mentor"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
