import {
  ArrowRight,
  LockKeyhole,
  Mail,
  User,
  Hash,
  Building2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  registerStudent,
} from "../../services/authService";

import {
  saveAuth,
} from "../../services/authStorage";


export default function SignupPage() {

  const navigate = useNavigate();


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [registerNumber, setRegisterNumber] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [batch, setBatch] =
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


    if (!name.trim()) {

      setError(
        "Please enter your name."
      );

      return;

    }


    if (!email.trim()) {

      setError(
        "Please enter your email."
      );

      return;

    }


    if (!password) {

      setError(
        "Please enter a password."
      );

      return;

    }


    if (password.length < 8) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;

    }


    if (!registerNumber.trim()) {

      setError(
        "Please enter your register number."
      );

      return;

    }


    if (!department.trim()) {

      setError(
        "Please enter your department."
      );

      return;

    }


    if (!batch.trim()) {

      setError(
        "Please enter your batch."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await registerStudent({

          name: name.trim(),

          email: email.trim(),

          password,

          register_number:
            registerNumber.trim(),

          department:
            department.trim(),

          batch:
            batch.trim(),

        });


      saveAuth(
        response.access_token,
        response.user
      );


      navigate(
        "/student",
        {
          replace: true,
        }
      );


    } catch (error) {

      if (error instanceof Error) {

        setError(
          error.message
        );

      } else {

        setError(
          "Unable to create your account."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="min-h-screen bg-slate-50">

      <div className="grid min-h-screen lg:grid-cols-2">


        {/* LEFT SECTION */}

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

              Start building your
              placement profile.

            </h1>


            <p className="mt-5 text-base leading-7 text-slate-300">

              Create your student account once.
              Your academic information,
              achievements, coding profiles,
              tasks and placement progress
              can be managed from one place.

            </p>


            <div className="mt-8 space-y-4">

              <Feature
                text="Maintain one complete student profile"
              />

              <Feature
                text="Connect your coding profiles"
              />

              <Feature
                text="Work with your assigned mentor"
              />

            </div>

          </div>


          <p className="text-xs text-slate-500">

            College Placement Readiness Platform

          </p>

        </div>


        {/* FORM SECTION */}

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-lg">


            {/* Mobile heading */}

            <div className="mb-8 lg:hidden">

              <p className="text-sm font-bold text-slate-900">

                PLACEMENT READINESS

              </p>

              <p className="mt-1 text-xs text-slate-400">

                Student Development Portal

              </p>

            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">


              <div className="mb-7">

                <h2 className="text-2xl font-bold text-slate-900">

                  Create student account

                </h2>


                <p className="mt-2 text-sm text-slate-500">

                  Enter your basic academic information
                  to get started.

                </p>

              </div>


              {/* ERROR */}

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


                {/* NAME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">

                    Full name

                  </label>


                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />


                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                </div>


                {/* EMAIL */}

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


                {/* REGISTER NUMBER */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">

                    Register number

                  </label>


                  <div className="relative">

                    <Hash
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />


                    <input
                      type="text"
                      value={registerNumber}
                      onChange={(event) =>
                        setRegisterNumber(
                          event.target.value
                        )
                      }
                      placeholder="23CSE001"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm uppercase outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                </div>


                {/* DEPARTMENT + BATCH */}

                <div className="grid gap-5 sm:grid-cols-2">


                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">

                      Department

                    </label>


                    <div className="relative">

                      <Building2
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />


                      <input
                        type="text"
                        value={department}
                        onChange={(event) =>
                          setDepartment(
                            event.target.value
                          )
                        }
                        placeholder="CSE"
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                    </div>

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-700">

                      Batch

                    </label>


                    <div className="relative">

                      <GraduationCap
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />


                      <input
                        type="text"
                        value={batch}
                        onChange={(event) =>
                          setBatch(
                            event.target.value
                          )
                        }
                        placeholder="2028"
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                    </div>

                  </div>

                </div>


                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">

                    Password

                  </label>


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
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                  </div>

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Creating account..."
                    : "Create student account"}


                  {!loading && (

                    <ArrowRight
                      size={17}
                    />

                  )}

                </button>


              </form>


              {/* LOGIN */}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">

                <p className="text-sm text-slate-500">

                  Already have an account?

                  {" "}

                  <Link
                    to="/login"
                    className="font-semibold text-slate-900 hover:underline"
                  >

                    Sign in

                  </Link>

                </p>

              </div>


              {/* SECURITY */}

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">

                <ShieldCheck
                  size={14}
                />

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