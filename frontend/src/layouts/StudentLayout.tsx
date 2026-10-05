import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Target,
  UserRound,
  X,
} from "lucide-react";

import { useState } from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import ThemeToggle from "../components/common/ThemeToggle";

import {
  clearAuth,
  getStoredUser,
} from "../services/authStorage";


export default function StudentLayout() {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const navigate = useNavigate();

  const user = getStoredUser();


  function logout() {

    clearAuth();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  }


  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">


      {/* MOBILE OVERLAY */}

      {sidebarOpen && (

        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}


      {/* SIDEBAR */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          border-r border-slate-200 bg-white
          dark:border-slate-800 dark:bg-slate-900
          transition-transform duration-200
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* SIDEBAR HEADER */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5">

          <div>

            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Placement
            </p>

            <p className="text-xs text-slate-400">
              Readiness Portal
            </p>

          </div>


          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden"
          >

            <X size={19} />

          </button>

        </div>


        {/* NAVIGATION */}

        <nav className="p-3">


          <NavItem
            to="/student"
            icon={
              <LayoutDashboard size={18} />
            }
            label="Dashboard"
            end
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/progress"
            icon={
              <Target size={18} />
            }
            label="My Progress"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/parameters"
            icon={
              <ClipboardCheck size={18} />
            }
            label="Parameters"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/tasks"
            icon={
              <CheckCircle2 size={18} />
            }
            label="Tasks"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/profiles"
            icon={
              <GitBranch size={18} />
            }
            label="Connected Profiles"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/verification"
            icon={
              <CheckCircle2 size={18} />
            }
            label="Verification"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/messages"
            icon={
              <MessageSquare size={18}
              />
            }
            label="Messages"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/notifications"
            icon={
              <Bell size={18} />
            }
            label="Notifications"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <div className="my-4 border-t border-slate-100" />


          <NavItem
            to="/student/profile"
            icon={
              <UserRound size={18} />
            }
            label="Profile"
            onClick={() =>
              setSidebarOpen(false)
            }
          />


          <NavItem
            to="/student/settings"
            icon={
              <Settings size={18} />
            }
            label="Settings"
            onClick={() =>
              setSidebarOpen(false)
            }
          />

        </nav>


        {/* SIGN OUT */}

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 p-3">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
          >

            <LogOut size={18} />

            Sign out

          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <div className="lg:pl-64">


        {/* HEADER */}

        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95 px-4 backdrop-blur sm:px-6">


          {/* MOBILE MENU */}

          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="text-slate-600 dark:text-slate-400 lg:hidden"
          >

            <Menu size={21} />

          </button>


          {/* DESKTOP TITLE */}

          <div className="hidden lg:block">

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Student Portal
            </p>

          </div>


          {/* USER AREA */}

          <div className="ml-auto flex items-center gap-3">

            {/* THEME TOGGLE */}
            <ThemeToggle />

            {/* NOTIFICATION */}

            <button
              onClick={() => navigate("/student/notifications")}
              className="relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >

              <Bell size={19} />

              <span className="absolute 1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />

            </button>


            {/* USER */}

            <div className="flex items-center gap-3">


              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name || "Student"}
                </p>

                <p className="text-xs text-slate-400 dark:text-slate-500">

                  {user?.department || "Department"}

                  {" • "}

                  {user?.batch || "Batch"}

                </p>

              </div>


              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">

                <UserRound
                  size={19}
                  className="text-slate-600 dark:text-slate-300"
                />

              </div>

            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <main>

          <Outlet />

        </main>

      </div>

    </div>

  );
}


/* ------------------------------------------------ */
/* NAVIGATION ITEM */
/* ------------------------------------------------ */


function NavItem({
  to,
  icon,
  label,
  end = false,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  onClick?: () => void;
}) {

  return (

    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => {

        if (isActive) {

          return `
            mb-1 flex w-full items-center gap-3 rounded-lg
            px-3 py-2.5 text-sm font-medium
            bg-slate-900 dark:bg-slate-100
            !text-white dark:!text-slate-900
            transition shadow-xs
          `;

        }


        return `
          mb-1 flex w-full items-center gap-3 rounded-lg
          px-3 py-2.5 text-sm font-medium
          text-slate-600 dark:text-slate-400
          hover:bg-slate-100 dark:hover:bg-slate-800
          hover:text-slate-900 dark:hover:text-slate-100
          transition
        `;

      }}
    >

      {icon}

      {label}

    </NavLink>

  );

}