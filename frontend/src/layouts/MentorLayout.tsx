import {
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getStoredUser } from "../services/authStorage";

export default function MentorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = getStoredUser();

  function logout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Placement Portal</p>
            <p className="text-xs text-slate-400">Mentor Console</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-500 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="p-3 space-y-1">
          <MentorNavItem
            to="/mentor"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            end
            onClick={() => setSidebarOpen(false)}
          />
          <MentorNavItem
            to="/mentor/verifications"
            icon={<ShieldCheck size={18} />}
            label="Verifications"
            onClick={() => setSidebarOpen(false)}
          />
          <MentorNavItem
            to="/mentor/tasks"
            icon={<ClipboardList size={18} />}
            label="Tasks"
            onClick={() => setSidebarOpen(false)}
          />
          <MentorNavItem
            to="/mentor/messages"
            icon={<MessageSquare size={18} />}
            label="Messages"
            onClick={() => setSidebarOpen(false)}
          />
          <MentorNavItem
            to="/mentor/announcements"
            icon={<Megaphone size={18} />}
            label="Announcements"
            onClick={() => setSidebarOpen(false)}
          />
          <MentorNavItem
            to="/mentor/reports"
            icon={<FileBarChart size={18} />}
            label="Reports"
            onClick={() => setSidebarOpen(false)}
          />
          <MentorNavItem
            to="/mentor/profile"
            icon={<UserRound size={18} />}
            label="Profile"
            onClick={() => setSidebarOpen(false)}
          />
          <MentorNavItem
            to="/mentor/settings"
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => setSidebarOpen(false)}
          />
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {user?.name || "Mentor"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.mentor_id || user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* TOP HEADER */}
      <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:pl-72">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {user?.department || "CSE"} Faculty
          </span>
          {user?.mentor_id && (
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {user.mentor_id}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* PAGE OUTLET */}
      <div className="pt-16 lg:pl-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MentorNavItem({
  to,
  icon,
  label,
  end,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-slate-900 text-white font-semibold"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
