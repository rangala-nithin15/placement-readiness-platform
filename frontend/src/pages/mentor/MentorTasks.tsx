import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import { getToken } from "../../services/authStorage";
import {
  createMentorTask,
  deleteMentorTask,
  getMentorTasks,
  type Task,
} from "../../services/taskService";

type AssignedStudent = {
  id: string;
  name: string;
  register_number: string;
  department?: string;
};

export default function MentorTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [targetStudentId, setTargetStudentId] = useState("");
  const [broadcast, setBroadcast] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      const [tasksRes, studentsRes] = await Promise.all([
        getMentorTasks(),
        apiRequest<{ students: AssignedStudent[] }>("/mentor/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTasks(tasksRes.tasks || []);
      setStudents(studentsRes.students || []);
      if (studentsRes.students && studentsRes.students.length > 0) {
        setTargetStudentId(studentsRes.students[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mentor tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const res = await createMentorTask({
        title,
        description,
        priority,
        due_date: dueDate || null,
        broadcast_to_all: broadcast,
        student_id: broadcast ? undefined : targetStudentId,
      });

      setSuccess(res.message || "Task created successfully.");
      setTitle("");
      setDescription("");
      setDueDate("");
      setBroadcast(false);
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(taskId: string) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      setDeletingId(taskId);
      setError("");
      await deleteMentorTask(taskId);
      setTasks((current) => current.filter((t) => t.id !== taskId));
      setSuccess("Task deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign problem-solving milestones and skill targets to your assigned mentees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Assign New Task
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
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

      {/* SUMMARY STATS */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Assigned Tasks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{tasks.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase">Pending</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {tasks.filter((t) => t.status === "PENDING").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600 uppercase">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {tasks.filter((t) => t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {tasks.filter((t) => t.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* TASKS LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <RefreshCw size={24} className="animate-spin mr-2" />
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            No Tasks Assigned Yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Click "Assign New Task" above to assign milestones to your mentees.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tasks.map((t) => {
            const assignedStudent = students.find(
              (s) => s.id === t.student_id || s.register_number === t.student_id
            );

            return (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                          t.priority === "HIGH"
                            ? "bg-red-50 text-red-700"
                            : t.priority === "MEDIUM"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : t.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.status === "COMPLETED" && <CheckCircle2 size={12} />}
                        {t.status === "IN_PROGRESS" && <Clock size={12} />}
                        {t.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      title="Delete task"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="mt-2.5 text-base font-semibold text-slate-900">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 whitespace-pre-line line-clamp-3">
                    {t.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <User size={13} className="text-slate-400" />
                    <span>
                      {assignedStudent ? assignedStudent.name : "Assigned Student"}
                    </span>
                    {assignedStudent?.register_number && (
                      <span className="font-mono text-slate-400">
                        ({assignedStudent.register_number})
                      </span>
                    )}
                  </div>

                  {t.due_date && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar size={13} /> Due: {t.due_date}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Assign Task to Mentees
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Target Student(s)
                </label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={broadcast}
                      onChange={(e) => setBroadcast(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Broadcast to ALL my assigned mentees ({students.length})</span>
                  </label>

                  {!broadcast && (
                    <select
                      value={targetStudentId}
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.register_number}) - {s.department || "CSE"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete 5 Medium Dynamic Programming problems"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Description & Requirements
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain problem topics, constraints, or submission criteria..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting && <RefreshCw size={13} className="animate-spin" />}
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
