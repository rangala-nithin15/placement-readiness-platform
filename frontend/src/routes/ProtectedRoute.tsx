import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  type User,
} from "../services/authService";

import {
  clearAuth,
  getToken,
  getStoredUser,
  saveAuth,
} from "../services/authStorage";


type ProtectedRouteProps = {
  allowedRoles?: string[];
};


export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {

  const location = useLocation();

  const [checking, setChecking] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [user, setUser] =
    useState<User | null>(null);


  useEffect(() => {

    let mounted = true;


    async function validateSession() {

      const token = getToken();

      const storedUser =
        getStoredUser();


      // No token means no session
      if (!token || !storedUser) {

        if (mounted) {

          setAuthenticated(false);
          setChecking(false);

        }

        return;
      }


      try {

        // Ask the backend whether
        // this JWT is actually valid.
        const currentUser =
          await getCurrentUser(token);


        if (!mounted) {
          return;
        }


        // Refresh stored user information
        // from the backend.
        saveAuth(
          token,
          currentUser
        );


        setUser(currentUser);

        setAuthenticated(true);

      } catch {

        // Token is invalid,
        // expired, or user no longer exists.

        clearAuth();

        if (mounted) {

          setAuthenticated(false);

        }

      } finally {

        if (mounted) {

          setChecking(false);

        }

      }

    }


    validateSession();


    return () => {

      mounted = false;

    };

  }, []);


  // While /auth/me is being checked
  if (checking) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Checking your session...
          </p>

        </div>

      </div>
    );

  }


  // Not authenticated
  if (!authenticated || !user) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );

  }


  // Role protection
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {

    if (user.role === "STUDENT") {

      return (
        <Navigate
          to="/student"
          replace
        />
      );

    }


    if (user.role === "MENTOR") {

      return (
        <Navigate
          to="/mentor"
          replace
        />
      );

    }


    if (user.role === "ADMIN") {

      return (
        <Navigate
          to="/admin"
          replace
        />
      );

    }


    clearAuth();

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  return <Outlet />;
}