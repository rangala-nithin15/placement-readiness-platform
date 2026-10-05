import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getStudentTasks,
  updateStudentTaskStatus,
  type Task,
} from "../../services/taskService";

export default function StudentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");
      const res = await getStudentTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(
    taskId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  ) {
    try {
      setUpdatingId(taskId);
      setError("");
      setSuccess("");
      const res = await updateStudentTaskStatus(taskId, newStatus);
      setSuccess(res.message || "Task updated.");
      setTasks((current) =>
        current.map((t) => (t.id === taskId ? res.task : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredTasks = useMemo(() => {
    if (statusFilter === "ALL") return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      in_progress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tasks.filter((t) => t.status === "COMPLETED").length,
    };
  }, [tasks]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assigned Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            Action items and skill milestones assigned by your mentor.
          </p>
        </div>
        <button
          onClick={loadTasks}
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

      {/* METRIC CARDS */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Tasks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.all}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase">Pending</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-600 uppercase">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.in_progress}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-600 uppercase">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{counts.completed}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Filter size={14} /> Filter:
        </span>
        {(["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === s
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* TASKS LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw size={24} className="animate-spin mr-2" />
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          No tasks found matching your filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((t) => {
            const isPending = t.status === "PENDING";
            const isInProgress = t.status === "IN_PROGRESS";
            const isCompleted = t.status === "COMPLETED";

            return (
              <div
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                          t.priority === "HIGH"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : t.priority === "MEDIUM"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {t.priority} Priority
                      </span>

                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          <PlayCircle size={12} /> In Progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-slate-900">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">
                      {t.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>
                        Assigned on {new Date(t.created_at).toLocaleDateString()}
                      </span>
                      {t.due_date && (
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Calendar size={13} />
                          Due: {t.due_date}
                        </span>
                      )}
                      {t.completed_at && (
                        <span className="text-emerald-600 font-medium">
                          Completed on {new Date(t.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleStatusChange(t.id, "IN_PROGRESS")}
                        disabled={updatingId === t.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <PlayCircle size={14} />
                        Start Task
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        onClick={() => handleStatusChange(t.id, "COMPLETED")}
                        disabled={updatingId === t.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        Mark Done
                      </button>
                    )}
                    {isCompleted && (
                      <button
                        onClick={() => handleStatusChange(t.id, "IN_PROGRESS")}
                        disabled={updatingId === t.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}