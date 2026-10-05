import {
  ArrowLeft,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { apiRequest } from "../../services/api";
import { getToken } from "../../services/authStorage";


type StudentProfile = {

  id: string;

  name: string;

  email: string;

  register_number?: string;

  department?: string;

  batch?: string;

  phone?: string | null;

  location?: string | null;

  linkedin_url?: string | null;

  cgpa?: number | null;

  tenth_percentage?: number | null;

  twelfth_percentage?: number | null;

  backlogs: number;

  skills: string[];

  career_interests: string[];

  profile_completion: number;

};


export default function MentorStudentProfile() {

  const {
    studentId,
  } = useParams();

  const navigate = useNavigate();


  const [student, setStudent] =
    useState<StudentProfile | null>(
      null
    );


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  async function loadStudent() {

    try {

      setLoading(true);

      setError("");


      const token =
        getToken();


      if (!token) {

        throw new Error(
          "Authentication token not found."
        );

      }


      if (!studentId) {

        throw new Error(
          "Student ID is missing."
        );

      }


      const response =
        await apiRequest<StudentProfile>(
          `/mentor/students/${studentId}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setStudent(
        response
      );


    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load student profile."
      );


    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadStudent();

  }, [studentId]);


  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50">

        <div className="flex min-h-screen items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Loading student profile...
            </p>

          </div>

        </div>

      </div>

    );

  }


  if (error || !student) {

    return (

      <div className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-3xl px-6 py-12">

          <button
            onClick={() =>
              navigate("/mentor")
            }
            className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >

            <ArrowLeft
              size={17}
            />

            Back to students

          </button>


          <div className="border border-slate-200 bg-white p-8">

            <p className="text-sm font-medium text-red-600">

              {error ||
                "Student not found."}

            </p>

          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="min-h-screen bg-slate-50">


      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-6 py-6">


          <button
            onClick={() =>
              navigate("/mentor")
            }
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >

            <ArrowLeft
              size={17}
            />

            Back to students

          </button>


          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">


            <div className="flex h-16 w-16 items-center justify-center bg-slate-900 text-white">

              <UserRound
                size={30}
              />

            </div>


            <div>

              <h1 className="text-2xl font-semibold text-slate-900">

                {student.name}

              </h1>


              <p className="mt-1 text-sm text-slate-500">

                {student.register_number ||
                  "No register number"}

                {" • "}

                {student.department ||
                  "Department"}

                {" • "}

                {student.batch ||
                  "Batch"}

              </p>

            </div>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-6xl px-6 py-8">


        {/* Profile Completion */}

        <section className="border border-slate-200 bg-white p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Profile Completion
              </p>

              <p className="mt-1 text-sm text-slate-700">
                Student profile information completed
              </p>

            </div>


            <p className="text-2xl font-semibold text-slate-900">

              {student.profile_completion}%

            </p>

          </div>


          <div className="mt-4 h-2 w-full bg-slate-200">

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

        </section>


        {/* Academic Information */}

        <section className="mt-6 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Academic Information
            </h2>

          </div>


          <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 sm:grid-cols-2 lg:grid-cols-4">


            <InfoItem
              label="Register Number"
              value={
                student.register_number ||
                "—"
              }
            />


            <InfoItem
              label="Department"
              value={
                student.department ||
                "—"
              }
            />


            <InfoItem
              label="Batch"
              value={
                student.batch ||
                "—"
              }
            />


            <InfoItem
              label="CGPA"
              value={
                student.cgpa !== null &&
                student.cgpa !== undefined
                  ? String(student.cgpa)
                  : "—"
              }
            />


            <InfoItem
              label="10th Percentage"
              value={
                student.tenth_percentage !== null &&
                student.tenth_percentage !== undefined
                  ? `${student.tenth_percentage}%`
                  : "—"
              }
            />


            <InfoItem
              label="12th Percentage"
              value={
                student.twelfth_percentage !== null &&
                student.twelfth_percentage !== undefined
                  ? `${student.twelfth_percentage}%`
                  : "—"
              }
            />


            <InfoItem
              label="Backlogs"
              value={
                String(
                  student.backlogs
                )
              }
            />


          </div>

        </section>


        {/* Contact Information */}

        <section className="mt-6 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Contact Information
            </h2>

          </div>


          <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 sm:grid-cols-2">


            <InfoItem
              label="Email"
              value={
                student.email
              }
            />


            <InfoItem
              label="Phone"
              value={
                student.phone ||
                "—"
              }
            />


            <InfoItem
              label="Location"
              value={
                student.location ||
                "—"
              }
            />


            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                LinkedIn
              </p>


              {student.linkedin_url ? (

                <a
                  href={
                    student.linkedin_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-sm font-medium text-slate-900 underline"
                >

                  {student.linkedin_url}

                </a>

              ) : (

                <p className="mt-2 text-sm text-slate-700">
                  —
                </p>

              )}

            </div>


          </div>

        </section>


        {/* Skills */}

        <section className="mt-6 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Skills
            </h2>

          </div>


          <div className="p-6">


            {student.skills.length > 0 ? (

              <div className="flex flex-wrap gap-2">

                {student.skills.map(
                  (skill) => (

                    <span
                      key={skill}
                      className="border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                    >

                      {skill}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p className="text-sm text-slate-500">
                No skills added yet.
              </p>

            )}

          </div>

        </section>


        {/* Career Interests */}

        <section className="mt-6 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Career Interests
            </h2>

          </div>


          <div className="p-6">


            {student.career_interests.length > 0 ? (

              <div className="space-y-3">

                {student.career_interests.map(
                  (interest) => (

                    <div
                      key={interest}
                      className="flex items-center gap-3"
                    >

                      <CheckCircle2
                        size={17}
                        className="text-slate-700"
                      />

                      <span className="text-sm text-slate-700">
                        {interest}
                      </span>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="text-sm text-slate-500">
                No career interests added yet.
              </p>

            )}

          </div>

        </section>


      </main>

    </div>

  );

}


function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div>

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-900">
        {value}
      </p>

    </div>

  );

}