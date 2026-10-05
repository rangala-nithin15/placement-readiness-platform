import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


import LoginPage
  from "../pages/auth/LoginPage";

import SignupPage
  from "../pages/auth/SignupPage";


import StudentLayout
  from "../layouts/StudentLayout";


import StudentDashboard
  from "../pages/student/StudentDashboard";

import StudentProgress
  from "../pages/student/StudentProgress";

import StudentParameters
  from "../pages/student/StudentParameters";

import StudentTasks
  from "../pages/student/StudentTasks";

import ConnectedProfiles
  from "../pages/student/ConnectedProfiles";

import StudentVerification
  from "../pages/student/StudentVerification";

import StudentMessages
  from "../pages/student/StudentMessages";

import StudentNotifications
  from "../pages/student/StudentNotifications";

import StudentProfile
  from "../pages/student/StudentProfile";

import StudentSettings
  from "../pages/student/StudentSettings";


import MentorDashboard
  from "../pages/mentor/MentorDashboard";

import MentorStudentProfile
  from "../pages/mentor/MentorStudentProfile";

import MentorVerification
  from "../pages/mentor/MentorVerification";

import MentorTasks
  from "../pages/mentor/MentorTasks";

import MentorLayout
  from "../layouts/MentorLayout";

import AdminDashboard
  from "../pages/admin/AdminDashboard";


import ProtectedRoute
  from "./ProtectedRoute";


export default function AppRoutes() {

  return (

    <Routes>


      {/* Public Routes */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />


      <Route
        path="/signup"
        element={
          <SignupPage />
        }
      />


      {/* Student Routes */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
            ]}
          />
        }
      >

        <Route
          path="/student"
          element={
            <StudentLayout />
          }
        >

          <Route
            index
            element={
              <StudentDashboard />
            }
          />

          <Route
            path="progress"
            element={
              <StudentProgress />
            }
          />

          <Route
            path="parameters"
            element={
              <StudentParameters />
            }
          />

          <Route
            path="tasks"
            element={
              <StudentTasks />
            }
          />

          <Route
            path="profiles"
            element={
              <ConnectedProfiles />
            }
          />

          <Route
            path="verification"
            element={
              <StudentVerification />
            }
          />

          <Route
            path="messages"
            element={
              <StudentMessages />
            }
          />

          <Route
            path="notifications"
            element={
              <StudentNotifications />
            }
          />

          <Route
            path="profile"
            element={
              <StudentProfile />
            }
          />

          <Route
            path="settings"
            element={
              <StudentSettings />
            }
          />

        </Route>

      </Route>


      {/* Mentor Routes */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "MENTOR",
            ]}
          />
        }
      >

        <Route
          path="/mentor"
          element={
            <MentorLayout />
          }
        >
          <Route
            index
            element={
              <MentorDashboard />
            }
          />

          <Route
            path="verifications"
            element={
              <MentorVerification />
            }
          />

          <Route
            path="tasks"
            element={
              <MentorTasks />
            }
          />

          <Route
            path="students/:studentId"
            element={
              <MentorStudentProfile />
            }
          />
        </Route>

      </Route>


      {/* Admin Routes */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
            ]}
          />
        }
      >

        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />

      </Route>


      {/* Unknown Route */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


    </Routes>

  );

}