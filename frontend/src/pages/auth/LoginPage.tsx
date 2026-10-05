import {
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { login } from "../../services/authService";
import { saveAuth } from "../../services/authStorage";
import ThemeToggle from "../../components/common/ThemeToggle";


export default function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your email."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    try {

      setLoading(true);

      const response = await login({
        email: email.trim(),
        password,
      });

      saveAuth(
        response.access_token,
        response.user
      );


      if (
        response.user.role ===
        "STUDENT"
      ) {

        navigate(
          "/student",
          {
            replace: true,
          }
        );

        return;
      }


      if (
        response.user.role ===
        "MENTOR"
      ) {

        navigate(
          "/mentor",
          {
            replace: true,
          }
        );

        return;
      }


      if (
        response.user.role ===
        "ADMIN"
      ) {

        navigate(
          "/admin",
          {
            replace: true,
          }
        );

        return;
      }


      setError(
        "Your account has an unsupported role."
      );

    } catch (error) {

      if (error instanceof Error) {

        setError(
          error.message
        );

      } else {

        setError(
          "Unable to login. Please try again."
        );
      }

    } finally {

      setLoading(false);
    }
  }


  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left information section */}
        <div className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div>

            <p className="text-sm font-bold tracking-wide">
              PLACEMENT READINESS
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Student Development Portal
            </p>

          </div>


          <div className="max-w-lg">

            <h1 className="text-4xl font-bold leading-tight">
              Build your placement
              readiness step by step.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-300">
              Track your skills, achievements,
              coding profiles, tasks and
              placement progress from one
              place.
            </p>


            <div className="mt-8 space-y-4">

              <Feature
                text="Track your placement score"
              />

              <Feature
                text="Connect your coding profiles"
              />

              <Feature
                text="Work with your mentor"
              />

            </div>

          </div>


          <p className="text-xs text-slate-500">
            College Placement Readiness Platform
          </p>

        </div>


        {/* Login section */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile heading */}
            <div className="mb-8 lg:hidden">

              <p className="text-sm font-bold text-slate-900">
                PLACEMENT READINESS
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Student Development Portal
              </p>

            </div>


            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm sm:p-8">

              <div className="mb-7">

                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Sign in to continue to your
                  placement portal.
                </p>

              </div>


              {/* Error */}
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>

                </div>
              )}


              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                </div>


                {/* Password */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Forgot password?
                    </button>

                  </div>


                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                </div>


                {/* Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight
                      size={17}
                    />
                  )}

                </button>

              </form>


              {/* Signup */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">

                <p className="text-sm text-slate-500">

                  Don't have an account?

                  {" "}

                  <Link
                    to="/signup"
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Create student account
                  </Link>

                </p>

              </div>


              {/* Security */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">

                <ShieldCheck size={14} />

                Secure account authentication

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">

        <ShieldCheck
          size={15}
        />

      </div>

      <p className="text-sm text-slate-300">
        {text}
      </p>

    </div>
  );
}