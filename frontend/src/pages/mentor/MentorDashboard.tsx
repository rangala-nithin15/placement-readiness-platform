import {
  AlertCircle,
  Search,
  UserCheck,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { apiRequest } from "../../services/api";
import { getToken } from "../../services/authStorage";


type MentorStudent = {
  id: string;
  name: string;
  email: string;
  register_number?: string;
  department?: string;
  batch?: string;
  profile_completion: number;
};


type MentorStudentResponse = {
  students: MentorStudent[];
  total: number;
};


export default function MentorDashboard() {

  const navigate = useNavigate();

  const [students, setStudents] =
    useState<MentorStudent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");


  async function loadStudents() {

    try {

      setLoading(true);

      setError("");

      const token = getToken();

      if (!token) {

        throw new Error(
          "Authentication token not found."
        );

      }

      const response =
        await apiRequest<MentorStudentResponse>(
          "/mentor/students",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setStudents(
        response.students
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load students."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadStudents();

  }, []);


  const filteredStudents =
    useMemo(() => {

      const value =
        search.trim().toLowerCase();

      if (!value) {

        return students;

      }

      return students.filter(
        (student) =>

          student.name
            .toLowerCase()
            .includes(value) ||

          student.email
            .toLowerCase()
            .includes(value) ||

          (
            student.register_number ||
            ""
          )
            .toLowerCase()
            .includes(value)
      );

    }, [
      students,
      search,
    ]);


  const completedProfiles =
    students.filter(
      (student) =>
        student.profile_completion >= 80
    ).length;


  const incompleteProfiles =
    students.filter(
      (student) =>
        student.profile_completion < 80
    ).length;


  return (

    <div className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-6">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Mentor Portal
              </p>

              <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                My Students
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage and monitor the students assigned to you.
              </p>

            </div>

            <div className="text-sm text-slate-500">

              {students.length} assigned{" "}

              {students.length === 1
                ? "student"
                : "students"}

            </div>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-7xl px-6 py-8">


        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">


          <div className="border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Assigned Students
                </p>

                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {students.length}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center bg-slate-100">

                <Users
                  size={21}
                  className="text-slate-700"
                />

              </div>

            </div>

          </div>


          <div className="border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Profiles Completed
                </p>

                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {completedProfiles}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center bg-slate-100">

                <UserCheck
                  size={21}
                  className="text-slate-700"
                />

              </div>

            </div>

          </div>


          <div className="border border-slate-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Needs Attention
                </p>

                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {incompleteProfiles}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center bg-slate-100">

                <AlertCircle
                  size={21}
                  className="text-slate-700"
                />

              </div>

            </div>

          </div>


        </section>


        <section className="mt-8 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Assigned Students
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search students by name, email or register number.
                </p>

              </div>


              <div className="relative w-full md:w-80">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search students..."
                  className="w-full border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-slate-900"
                />

              </div>

            </div>

          </div>


          {loading && (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading students...
              </p>

            </div>

          )}


          {!loading && error && (

            <div className="px-6 py-12 text-center">

              <p className="text-sm font-medium text-red-600">
                {error}
              </p>

              <button
                onClick={loadStudents}
                className="mt-4 border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Try Again
              </button>

            </div>

          )}


          {!loading &&
            !error &&
            filteredStudents.length === 0 && (

              <div className="px-6 py-12 text-center">

                <Users
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-4 text-sm font-medium text-slate-700">

                  {students.length === 0
                    ? "No students assigned yet."
                    : "No students found."}

                </p>

                <p className="mt-1 text-sm text-slate-500">

                  {students.length === 0
                    ? "Assigned students will appear here."
                    : "Try a different search."}

                </p>

              </div>

            )}


          {!loading &&
            !error &&
            filteredStudents.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-slate-200 bg-slate-50 text-left">

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Register Number
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Department
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Batch
                      </th>

                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Profile
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredStudents.map(
                      (student) => (

                        <tr
                          key={student.id}
                          onClick={() =>
                            navigate(
                              `/mentor/students/${student.id}`
                            )
                          }
                          className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <div>

                              <p className="text-sm font-medium text-slate-900">
                                {student.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {student.email}
                              </p>

                            </div>

                          </td>


                          <td className="px-6 py-4 text-sm text-slate-700">

                            {student.register_number ||
                              "—"}

                          </td>


                          <td className="px-6 py-4 text-sm text-slate-700">

                            {student.department ||
                              "—"}

                          </td>


                          <td className="px-6 py-4 text-sm text-slate-700">

                            {student.batch ||
                              "—"}

                          </td>


                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-2 w-24 bg-slate-200">

                                <div
                                  className="h-2 bg-slate-900"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        student.profile_completion,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                              <span className="text-xs font-medium text-slate-600">
                                {student.profile_completion}%
                              </span>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

      </main>

    </div>

  );
}