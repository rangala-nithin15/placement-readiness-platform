import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Link2,
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


// ==================================================
// TYPES
// ==================================================

type StudentProfile = {
  id: string;
  name: string;
  email: string;

  register_number?: string | null;
  department?: string | null;
  batch?: string | null;

  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;

  cgpa?: number | null;
  tenth_percentage?: number | null;
  twelfth_percentage?: number | null;

  backlogs?: number | null;

  skills?: string[];
  career_interests?: string[];

  profile_completion?: number;
};


type ParameterResult = {
  parameter_id?: number;
  id?: number;

  parameter_name?: string;
  name?: string;

  max_marks?: number;
  maximum_marks?: number;

  marks?: number;
  score?: number;
};


type PlacementData = {
  total_score?: number;
  score?: number;

  maximum_marks?: number;

  percentage?: number;

  current_level?: string | null;

  current_category?: string | null;

  next_level?: string | null;

  marks_needed?: number;

  eligibility?: string | null;

  parameter_results?: ParameterResult[];

  parameters?: ParameterResult[];

  conditions?: unknown[];

  error?: string;
};


type ExternalProfile = {
  id: string;

  student_id?: string;

  platform: string;

  username: string;

  profile_url: string;

  verification_status?: string;

  stats?: Record<string, unknown>;

  last_verified_at?: string | null;
};


type MentorStudentProfileResponse = {
  student?: StudentProfile;

  placement?: PlacementData;

  connected_profiles?: ExternalProfile[];
};


// ==================================================
// COMPONENT
// ==================================================

export default function MentorStudentProfile() {

  const {
    studentId,
  } = useParams();

  const navigate = useNavigate();


  const [
    student,
    setStudent,
  ] = useState<StudentProfile | null>(
    null
  );


  const [
    placement,
    setPlacement,
  ] = useState<PlacementData | null>(
    null
  );


  const [
    connectedProfiles,
    setConnectedProfiles,
  ] = useState<ExternalProfile[]>(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // LOAD STUDENT
  // ==================================================

  async function loadStudent() {

    try {

      setLoading(true);

      setError("");


      const token = getToken();


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
        await apiRequest<MentorStudentProfileResponse>(
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
        response.student ?? null
      );


      setPlacement(
        response.placement ?? {}
      );


      setConnectedProfiles(
        Array.isArray(
          response.connected_profiles
        )
          ? response.connected_profiles
          : []
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


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50">

        <div className="flex min-h-screen items-center justify-center">

          <div className="text-center">

            <div
              className="
                mx-auto
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-slate-300
                border-t-slate-900
              "
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading student profile...
            </p>

          </div>

        </div>

      </div>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error || !student) {

    return (

      <div className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-3xl px-6 py-12">

          <button
            onClick={() =>
              navigate("/mentor")
            }
            className="
              mb-8
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-600
              hover:text-slate-900
            "
          >

            <ArrowLeft size={17} />

            Back to students

          </button>


          <div
            className="
              border
              border-slate-200
              bg-white
              p-8
            "
          >

            <p className="text-sm font-medium text-red-600">

              {error ||
                "Student not found."}

            </p>

          </div>

        </div>

      </div>

    );

  }


  // ==================================================
  // SAFE VALUES
  // ==================================================

  const skills =
    Array.isArray(student.skills)
      ? student.skills
      : [];


  const careerInterests =
    Array.isArray(
      student.career_interests
    )
      ? student.career_interests
      : [];


  const parameterResults =
    Array.isArray(
      placement?.parameter_results
    )
      ? placement.parameter_results
      : Array.isArray(
          placement?.parameters
        )
        ? placement.parameters
        : [];


  const profileCompletion =
    Number(
      student.profile_completion ?? 0
    );


  const totalScore =
    Number(
      placement?.total_score ??
      placement?.score ??
      0
    );


  const maximumMarks =
    Number(
      placement?.maximum_marks ??
      250
    );


  const percentage =
    Number(
      placement?.percentage ??
      (
        maximumMarks > 0
          ? (
              totalScore /
              maximumMarks
            ) *
            100
          : 0
      )
    );


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div className="min-h-screen bg-slate-50">


      {/* ==================================================
          HEADER
      ================================================== */}

      <header
        className="
          border-b
          border-slate-200
          bg-white
        "
      >

        <div
          className="
            mx-auto
            max-w-6xl
            px-6
            py-6
          "
        >

          <button
            onClick={() =>
              navigate("/mentor")
            }
            className="
              mb-5
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-600
              hover:text-slate-900
            "
          >

            <ArrowLeft size={17} />

            Back to students

          </button>


          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                bg-slate-900
                text-white
              "
            >

              <UserRound size={30} />

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-semibold
                  text-slate-900
                "
              >

                {student.name}

              </h1>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >

                {student.register_number ||
                  "No register number"}

                {" • "}

                {student.department ||
                  "Department"}

                {" • "}

                {student.batch ||
                  "Batch"}

                {" • "}

                {`Profile: ${profileCompletion}%`}

              </p>

            </div>

          </div>

        </div>

      </header>


      <main
        className="
          mx-auto
          max-w-6xl
          px-6
          py-8
        "
      >


        {/* ==================================================
            PLACEMENT READINESS
        ================================================== */}

        <section
          className="
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >

            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Placement Readiness
            </h2>

          </div>


          <div className="p-6">

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >

              {/* SCORE */}

              <div
                className="
                  border
                  border-slate-200
                  p-5
                "
              >

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  Score
                </p>


                <p
                  className="
                    mt-2
                    text-3xl
                    font-semibold
                    text-slate-900
                  "
                >

                  {totalScore}

                  <span
                    className="
                      text-base
                      font-normal
                      text-slate-500
                    "
                  >
                    {" "}
                    / {maximumMarks}
                  </span>

                </p>

              </div>


              {/* LEVEL */}

              <div
                className="
                  border
                  border-slate-200
                  p-5
                "
              >

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  Current Level
                </p>


                <p
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                >

                  {placement?.current_level ||
                    "Not determined"}

                </p>

              </div>


              {/* CATEGORY */}

              <div
                className="
                  border
                  border-slate-200
                  p-5
                "
              >

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  Placement Category
                </p>


                <p
                  className="
                    mt-2
                    text-sm
                    font-semibold
                    leading-6
                    text-slate-900
                  "
                >

                  {placement?.current_category ||
                    "Not determined"}

                </p>

              </div>


              {/* NEXT LEVEL */}

              <div
                className="
                  border
                  border-slate-200
                  p-5
                "
              >

                <p
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  Next Level
                </p>


                <p
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                >

                  {placement?.next_level ||
                    "Maximum level"}

                </p>

              </div>

            </div>


            {/* SCORE PROGRESS */}

            <div className="mt-6">

              <div
                className="
                  flex
                  items-center
                  justify-between
                  text-sm
                "
              >

                <span className="text-slate-500">
                  Overall Progress
                </span>

                <span
                  className="
                    font-medium
                    text-slate-900
                  "
                >
                  {percentage.toFixed(1)}%
                </span>

              </div>


              <div
                className="
                  mt-2
                  h-2
                  w-full
                  bg-slate-200
                "
              >

                <div
                  className="
                    h-2
                    bg-slate-900
                  "
                  style={{
                    width: `${Math.min(
                      Math.max(
                        percentage,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* ELIGIBILITY */}

            <div
              className="
                mt-6
                border
                border-slate-200
                bg-slate-50
                p-5
              "
            >

              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                Eligibility
              </p>


              <p
                className="
                  mt-2
                  text-sm
                  font-medium
                  text-slate-900
                "
              >

                {placement?.eligibility ||
                  "Eligibility has not been determined yet."}

              </p>

            </div>

          </div>

        </section>


        {/* ==================================================
            PARAMETER PROGRESS
        ================================================== */}

        <section
          className="
            mt-6
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >

            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Parameter Progress
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Placement framework progress for this student.
            </p>

          </div>


          <div className="p-6">

            {parameterResults.length === 0 ? (

              <div
                className="
                  border
                  border-dashed
                  border-slate-300
                  p-8
                  text-center
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  No parameter data available yet.
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Student achievement data will appear here once connected.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {parameterResults.map(
                  (
                    parameter,
                    index
                  ) => {

                    const name =
                      parameter.parameter_name ||
                      parameter.name ||
                      `Parameter ${index + 1}`;


                    const maxMarks =
                      Number(
                        parameter.max_marks ??
                        parameter.maximum_marks ??
                        0
                      );


                    const marks =
                      Number(
                        parameter.marks ??
                        parameter.score ??
                        0
                      );


                    const progress =
                      maxMarks > 0
                        ? (
                            marks /
                            maxMarks
                          ) *
                          100
                        : 0;


                    return (

                      <div
                        key={
                          parameter.parameter_id ??
                          parameter.id ??
                          index
                        }
                      >

                        <div
                          className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-medium
                              text-slate-900
                            "
                          >
                            {name}
                          </p>


                          <p
                            className="
                              text-sm
                              font-medium
                              text-slate-700
                            "
                          >

                            {marks}

                            {maxMarks > 0
                              ? ` / ${maxMarks}`
                              : ""}

                          </p>

                        </div>


                        <div
                          className="
                            mt-2
                            h-2
                            w-full
                            bg-slate-200
                          "
                        >

                          <div
                            className="
                              h-2
                              bg-slate-900
                            "
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  progress,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </section>


        {/* ==================================================
            CONNECTED PROFILES
        ================================================== */}

        <section
          className="
            mt-6
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <Link2
                size={20}
                className="text-slate-700"
              />


              <div>

                <h2
                  className="
                    text-lg
                    font-semibold
                    text-slate-900
                  "
                >
                  Connected Profiles
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  External coding and professional profiles.
                </p>

              </div>

            </div>

          </div>


          <div className="p-6">

            {connectedProfiles.length === 0 ? (

              <div
                className="
                  border
                  border-dashed
                  border-slate-300
                  p-8
                  text-center
                "
              >

                <Link2
                  size={28}
                  className="
                    mx-auto
                    text-slate-300
                  "
                />


                <p
                  className="
                    mt-3
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  No external profiles connected.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {connectedProfiles.map(
                  (
                    profile
                  ) => (

                    <ExternalProfileCard
                      key={profile.id}
                      profile={profile}
                    />

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* ==================================================
            ACADEMIC INFORMATION
        ================================================== */}

        <section
          className="
            mt-6
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >

            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Academic Information
            </h2>

          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-x-8
              gap-y-6
              p-6
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

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
                  ? String(
                      student.cgpa
                    )
                  : "—"
              }
            />


            <InfoItem
              label="10th Percentage"
              value={
                student.tenth_percentage !==
                  null &&
                student.tenth_percentage !==
                  undefined
                  ? `${student.tenth_percentage}%`
                  : "—"
              }
            />


            <InfoItem
              label="12th Percentage"
              value={
                student.twelfth_percentage !==
                  null &&
                student.twelfth_percentage !==
                  undefined
                  ? `${student.twelfth_percentage}%`
                  : "—"
              }
            />


            <InfoItem
              label="Backlogs"
              value={String(
                student.backlogs ?? 0
              )}
            />

          </div>

        </section>


        {/* ==================================================
            CONTACT INFORMATION
        ================================================== */}

        <section
          className="
            mt-6
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >

            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Contact Information
            </h2>

          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-x-8
              gap-y-6
              p-6
              sm:grid-cols-2
            "
          >

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

              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-500
                "
              >
                LinkedIn
              </p>


              {student.linkedin_url ? (

                <a
                  href={
                    student.linkedin_url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    mt-2
                    block
                    break-all
                    text-sm
                    font-medium
                    text-slate-900
                    underline
                  "
                >

                  {student.linkedin_url}

                </a>

              ) : (

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-700
                  "
                >
                  —
                </p>

              )}

            </div>

          </div>

        </section>


        {/* ==================================================
            SKILLS
        ================================================== */}

        <section
          className="
            mt-6
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >

            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Skills
            </h2>

          </div>


          <div className="p-6">

            {skills.length > 0 ? (

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >

                {skills.map(
                  (
                    skill,
                    index
                  ) => (

                    <span
                      key={`${skill}-${index}`}
                      className="
                        border
                        border-slate-300
                        px-3
                        py-1.5
                        text-sm
                        text-slate-700
                      "
                    >

                      {skill}

                    </span>

                  )
                )}

              </div>

            ) : (

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                No skills added yet.
              </p>

            )}

          </div>

        </section>


        {/* ==================================================
            CAREER INTERESTS
        ================================================== */}

        <section
          className="
            mt-6
            border
            border-slate-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-slate-200
              px-6
              py-5
            "
          >

            <h2
              className="
                text-lg
                font-semibold
                text-slate-900
              "
            >
              Career Interests
            </h2>

          </div>


          <div className="p-6">

            {careerInterests.length > 0 ? (

              <div className="space-y-3">

                {careerInterests.map(
                  (
                    interest,
                    index
                  ) => (

                    <div
                      key={`${interest}-${index}`}
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <CheckCircle2
                        size={17}
                        className="text-slate-700"
                      />


                      <span
                        className="
                          text-sm
                          text-slate-700
                        "
                      >
                        {interest}
                      </span>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                No career interests added yet.
              </p>

            )}

          </div>

        </section>


      </main>

    </div>

  );
}


// ==================================================
// EXTERNAL PROFILE CARD
// ==================================================

function ExternalProfileCard({
  profile,
}: {
  profile: ExternalProfile;
}) {

  const stats =
    profile.stats ?? {};


  const isVerified =
    profile.verification_status ===
    "VERIFIED";


  const platformName =
    profile.platform
      ? profile.platform
          .charAt(0)
          .toUpperCase() +
        profile.platform.slice(1)
      : "External Profile";


  const isLeetCode =
    profile.platform ===
    "leetcode";


  const isGitHub =
    profile.platform ===
    "github";


  return (

    <div
      className="
        border
        border-slate-200
        p-5
      "
    >

      {/* PROFILE HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <h3
              className="
                text-base
                font-semibold
                text-slate-900
              "
            >
              {platformName}
            </h3>


            {isVerified && (

              <CheckCircle2
                size={17}
                className="text-green-600"
              />

            )}

          </div>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            @{profile.username}
          </p>


          <p
            className="
              mt-2
              text-xs
              text-slate-500
            "
          >
            Status:{" "}
            {profile.verification_status ||
              "PENDING"}
          </p>

        </div>


        {profile.profile_url && (

          <a
            href={
              profile.profile_url
            }
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-700
              underline
            "
          >

            Open Profile

            <ExternalLink size={15} />

          </a>

        )}

      </div>


      {/* ==================================================
          LEETCODE STATS
      ================================================== */}

      {isLeetCode && (

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            lg:grid-cols-4
          "
        >

          <StatItem
            label="Problems Solved"
            value={
              stats.problems_solved ??
              0
            }
          />


          <StatItem
            label="Easy"
            value={
              stats.easy ??
              0
            }
          />


          <StatItem
            label="Medium"
            value={
              stats.medium ??
              0
            }
          />


          <StatItem
            label="Hard"
            value={
              stats.hard ??
              0
            }
          />


          <StatItem
            label="Contest Rating"
            value={
              stats.contest_rating ??
              "—"
            }
          />


          <StatItem
            label="Contests"
            value={
              stats.contests_attended ??
              0
            }
          />


          <StatItem
            label="Global Ranking"
            value={
              stats.global_ranking ??
              "—"
            }
          />


          <StatItem
            label="Reputation"
            value={
              stats.reputation ??
              0
            }
          />

        </div>

      )}


      {/* ==================================================
          GITHUB STATS
      ================================================== */}

      {isGitHub && (

        <div className="mt-5">

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              lg:grid-cols-4
            "
          >

            <StatItem
              label="Repositories"
              value={
                stats.public_repositories ??
                0
              }
            />


            <StatItem
              label="Followers"
              value={
                stats.followers ??
                0
              }
            />


            <StatItem
              label="Following"
              value={
                stats.following ??
                0
              }
            />


            <StatItem
              label="Public Gists"
              value={
                stats.public_gists ??
                0
              }
            />


            <StatItem
              label="Total Stars"
              value={
                stats.total_stars ??
                0
              }
            />


            <StatItem
              label="Total Forks"
              value={
                stats.total_forks ??
                0
              }
            />

          </div>


          {/* LANGUAGES */}

          <div className="mt-4">

            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Languages
            </p>


            {Array.isArray(
              stats.languages
            ) &&
            stats.languages.length > 0 ? (

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-2
                "
              >

                {stats.languages.map(
                  (
                    language,
                    index
                  ) => (

                    <span
                      key={`${String(language)}-${index}`}
                      className="
                        border
                        border-slate-300
                        bg-slate-50
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-slate-700
                      "
                    >
                      {String(language)}
                    </span>

                  )
                )}

              </div>

            ) : (

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                "
              >
                No public language information available.
              </p>

            )}

          </div>


          {/* GITHUB REPOSITORIES */}

          {Array.isArray(
            stats.repositories
          ) &&
          stats.repositories.length > 0 && (

            <div className="mt-6">

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Recent Public Repositories
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Public repository information retrieved from GitHub.
                  </p>

                </div>

              </div>


              <div className="mt-3 space-y-2">

                {(
                  stats.repositories as Array<
                    Record<string, unknown>
                  >
                )
                  .slice(0, 5)
                  .map(
                    (
                      repository,
                      index
                    ) => {

                      const name =
                        String(
                          repository.name ??
                          "Repository"
                        );

                      const url =
                        String(
                          repository.html_url ??
                          ""
                        );

                      const description =
                        repository.description
                          ? String(
                              repository.description
                            )
                          : "";

                      const language =
                        repository.language
                          ? String(
                              repository.language
                            )
                          : "—";

                      const stars =
                        Number(
                          repository.stars ??
                          0
                        );

                      const forks =
                        Number(
                          repository.forks ??
                          0
                        );


                      return (

                        <div
                          key={`${name}-${index}`}
                          className="
                            border
                            border-slate-200
                            bg-slate-50
                            p-4
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              gap-3
                              sm:flex-row
                              sm:items-start
                              sm:justify-between
                            "
                          >

                            <div className="min-w-0">

                              {url ? (

                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="
                                    break-all
                                    text-sm
                                    font-semibold
                                    text-slate-900
                                    underline
                                  "
                                >
                                  {name}
                                </a>

                              ) : (

                                <p
                                  className="
                                    text-sm
                                    font-semibold
                                    text-slate-900
                                  "
                                >
                                  {name}
                                </p>

                              )}


                              {description && (

                                <p
                                  className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-slate-500
                                  "
                                >
                                  {description}
                                </p>

                              )}

                            </div>


                            <div
                              className="
                                flex
                                shrink-0
                                items-center
                                gap-3
                                text-xs
                                text-slate-500
                              "
                            >

                              <span>
                                ★ {stars}
                              </span>

                              <span>
                                Forks {forks}
                              </span>

                            </div>

                          </div>


                          <div
                            className="
                              mt-3
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <span
                              className="
                                border
                                border-slate-300
                                px-2
                                py-1
                                text-xs
                                text-slate-600
                              "
                            >
                              {language}
                            </span>

                          </div>

                        </div>

                      );

                    }
                  )}

              </div>

            </div>

          )}

        </div>

      )}


      {/* LAST CHECKED */}

      {profile.last_verified_at && (

        <p
          className="
            mt-4
            text-xs
            text-slate-400
          "
        >

          Last checked:{" "}
          {formatDate(
            profile.last_verified_at
          )}

        </p>

      )}

    </div>

  );
}


// ==================================================
// STAT ITEM
// ==================================================

function StatItem({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {

  return (

    <div
      className="
        border
        border-slate-200
        bg-slate-50
        p-3
      "
    >

      <p
        className="
          text-xs
          text-slate-500
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1
          text-lg
          font-semibold
          text-slate-900
        "
      >

        {String(value)}

      </p>

    </div>

  );
}


// ==================================================
// INFO ITEM
// ==================================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div>

      <p
        className="
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-slate-500
        "
      >
        {label}
      </p>


      <p
        className="
          mt-2
          text-sm
          font-medium
          text-slate-900
        "
      >
        {value}
      </p>

    </div>

  );

}


// ==================================================
// DATE FORMATTER
// ==================================================

function formatDate(
  value: string
) {

  try {

    return new Date(
      value
    ).toLocaleString();

  } catch {

    return value;

  }

}