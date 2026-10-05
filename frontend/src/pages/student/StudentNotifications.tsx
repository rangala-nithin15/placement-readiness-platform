import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "../../services/notificationService";

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");
      const res = await getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Non-blocking
    }
  }

  async function handleMarkAllRead() {
    try {
      setError("");
      const res = await markAllNotificationsRead();
      setNotifications((current) =>
        current.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      setSuccess(res.message || "All notifications marked as read.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all as read."
      );
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">
              Updates on tasks, verifications, and announcements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <CheckCheck size={14} />
              Mark All as Read ({unreadCount})
            </button>
          )}
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* FEEDBACK */}
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

      {/* LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw size={24} className="animate-spin mr-2" />
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          <Bell className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          No notifications yet. You're completely up to date!
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isRead = n.is_read;

            return (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition ${
                  isRead
                    ? "border-slate-200 bg-white opacity-85"
                    : "border-blue-200 bg-blue-50/40 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      n.type === "TASK"
                        ? "bg-amber-100 text-amber-700"
                        : n.type === "VERIFICATION"
                        ? "bg-emerald-100 text-emerald-700"
                        : n.type === "CHAT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {n.type === "TASK" && <Clock size={16} />}
                    {n.type === "VERIFICATION" && <ShieldCheck size={16} />}
                    {n.type === "CHAT" && <MessageSquare size={16} />}
                    {n.type === "SYSTEM" && <Bell size={16} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold ${
                          isRead ? "text-slate-800" : "text-slate-900"
                        }`}
                      >
                        {n.title}
                      </h4>
                      {!isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{n.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => handleMarkRead(n.id)}
                          className="flex items-center gap-1 font-medium text-blue-600 hover:underline"
                        >
                          View Details <ExternalLink size={11} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    title="Mark as read"
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}