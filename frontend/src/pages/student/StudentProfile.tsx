import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  UserRound,
} from "lucide-react";

import {
  getStudentProfile,
  updateStudentProfile,
  type StudentProfile,
} from "../../services/studentService";


export default function StudentProfile() {

  const [profile, setProfile] =
    useState<StudentProfile | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [saving, setSaving] =
    useState(false);


  const [error, setError] =
    useState("");


  const [success, setSuccess] =
    useState("");


  const [phone, setPhone] =
    useState("");


  const [location, setLocation] =
    useState("");


  const [linkedinUrl, setLinkedinUrl] =
    useState("");


  const [cgpa, setCgpa] =
    useState("");


  const [tenthPercentage, setTenthPercentage] =
    useState("");


  const [twelfthPercentage, setTwelfthPercentage] =
    useState("");


  const [backlogs, setBacklogs] =
    useState("");


  const [skills, setSkills] =
    useState("");


  const [careerInterests, setCareerInterests] =
    useState("");


  useEffect(() => {

    loadProfile();

  }, []);


  async function loadProfile() {

    try {

      setLoading(true);

      setError("");


      const data =
        await getStudentProfile();


      setProfile(data);


      setPhone(
        data.phone || ""
      );


      setLocation(
        data.location || ""
      );


      setLinkedinUrl(
        data.linkedin_url || ""
      );


      setCgpa(
        data.cgpa !== null &&
        data.cgpa !== undefined
          ? String(data.cgpa)
          : ""
      );


      setTenthPercentage(
        data.tenth_percentage !== null &&
        data.tenth_percentage !== undefined
          ? String(data.tenth_percentage)
          : ""
      );


      setTwelfthPercentage(
        data.twelfth_percentage !== null &&
        data.twelfth_percentage !== undefined
          ? String(data.twelfth_percentage)
          : ""
      );


      setBacklogs(
        String(data.backlogs ?? 0)
      );


      setSkills(
        data.skills.join(", ")
      );


      setCareerInterests(
        data.career_interests.join(", ")
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your profile."
      );

    } finally {

      setLoading(false);

    }

  }


  async function handleSave(
    event: React.FormEvent
  ) {

    event.preventDefault();


    try {

      setSaving(true);

      setError("");

      setSuccess("");


      const updatedProfile =
        await updateStudentProfile({

          phone:
            phone.trim() || undefined,

          location:
            location.trim() || undefined,

          linkedin_url:
            linkedinUrl.trim() || undefined,

          cgpa:
            cgpa.trim()
              ? Number(cgpa)
              : undefined,

          tenth_percentage:
            tenthPercentage.trim()
              ? Number(tenthPercentage)
              : undefined,

          twelfth_percentage:
            twelfthPercentage.trim()
              ? Number(twelfthPercentage)
              : undefined,

          backlogs:
            backlogs.trim()
              ? Number(backlogs)
              : 0,

          skills:
            skills
              .split(",")
              .map(
                (item) => item.trim()
              )
              .filter(Boolean),

          career_interests:
            careerInterests
              .split(",")
              .map(
                (item) => item.trim()
              )
              .filter(Boolean),

        });


      setProfile(
        updatedProfile
      );


      setSuccess(
        "Your profile has been saved successfully."
      );


      setTimeout(() => {

        setSuccess("");

      }, 3000);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save your profile."
      );

    } finally {

      setSaving(false);

    }

  }


  if (loading) {

    return (

      <div className="flex min-h-[70vh] items-center justify-center">

        <div className="text-center">

          <Loader2
            size={28}
            className="mx-auto animate-spin text-slate-700"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading your profile...
          </p>

        </div>

      </div>

    );

  }


  if (!profile) {

    return (

      <div className="p-6">

        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={20}
              className="mt-0.5 text-red-600"
            />

            <div>

              <h2 className="font-semibold text-red-900">
                Unable to load profile
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error || "Something went wrong."}
              </p>

            </div>

          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-5xl">


        {/* PAGE HEADER */}

        <div className="mb-6">

          <p className="text-sm font-medium text-slate-500">
            Student Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Keep your placement profile up to date.
          </p>

        </div>


        {/* PROFILE SUMMARY */}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">


            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100">

              <UserRound
                size={30}
                className="text-slate-600"
              />

            </div>


            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-semibold text-slate-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {profile.email}
              </p>


              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">

                <span>
                  Reg No:{" "}
                  <strong className="text-slate-800">
                    {profile.register_number || "Not available"}
                  </strong>
                </span>

                <span>
                  Department:{" "}
                  <strong className="text-slate-800">
                    {profile.department || "Not available"}
                  </strong>
                </span>

                <span>
                  Batch:{" "}
                  <strong className="text-slate-800">
                    {profile.batch || "Not available"}
                  </strong>
                </span>

              </div>

            </div>


            <div className="sm:text-right">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Profile completion
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {profile.profile_completion}%
              </p>

            </div>

          </div>

        </div>


        {/* ALERTS */}

        {error && (

          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">

            <AlertCircle
              size={19}
              className="mt-0.5 text-red-600"
            />

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>

        )}


        {success && (

          <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">

            <CheckCircle2
              size={19}
              className="mt-0.5 text-green-600"
            />

            <p className="text-sm text-green-700">
              {success}
            </p>

          </div>

        )}


        <form
          onSubmit={handleSave}
          className="space-y-6"
        >


          {/* PERSONAL INFORMATION */}

          <section className="rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic contact information for your placement profile.
              </p>

            </div>


            <div className="grid gap-5 p-6 md:grid-cols-2">


              <Field
                label="Full Name"
                value={profile.name}
                disabled
              />


              <Field
                label="Email"
                value={profile.email}
                disabled
              />


              <Field
                label="Register Number"
                value={
                  profile.register_number || ""
                }
                disabled
              />


              <Field
                label="Department"
                value={
                  profile.department || ""
                }
                disabled
              />


              <Field
                label="Batch"
                value={
                  profile.batch || ""
                }
                disabled
              />


              <InputField
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="Enter your phone number"
              />


              <InputField
                label="Location"
                value={location}
                onChange={setLocation}
                placeholder="Example: Chennai"
              />


              <InputField
                label="LinkedIn Profile"
                value={linkedinUrl}
                onChange={setLinkedinUrl}
                placeholder="https://www.linkedin.com/in/..."
              />

            </div>

          </section>


          {/* ACADEMIC INFORMATION */}

          <section className="rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Academic Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your current academic details.
              </p>

            </div>


            <div className="grid gap-5 p-6 md:grid-cols-2">


              <InputField
                label="CGPA"
                type="number"
                value={cgpa}
                onChange={setCgpa}
                placeholder="Example: 8.2"
                step="0.01"
              />


              <InputField
                label="10th Percentage"
                type="number"
                value={tenthPercentage}
                onChange={setTenthPercentage}
                placeholder="Example: 92.5"
                step="0.01"
              />


              <InputField
                label="12th Percentage"
                type="number"
                value={twelfthPercentage}
                onChange={setTwelfthPercentage}
                placeholder="Example: 89.4"
                step="0.01"
              />


              <InputField
                label="Number of Backlogs"
                type="number"
                value={backlogs}
                onChange={setBacklogs}
                placeholder="Example: 0"
                min="0"
              />

            </div>

          </section>


          {/* SKILLS AND INTERESTS */}

          <section className="rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="font-semibold text-slate-900">
                Skills & Career Interests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Separate multiple values using commas.
              </p>

            </div>


            <div className="grid gap-5 p-6 md:grid-cols-2">


              <TextAreaField
                label="Skills"
                value={skills}
                onChange={setSkills}
                placeholder="Python, Java, React, AWS, Docker"
              />


              <TextAreaField
                label="Career Interests"
                value={careerInterests}
                onChange={setCareerInterests}
                placeholder="Cloud Engineering, DevOps, Software Development"
              />

            </div>

          </section>


          {/* SAVE */}

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (

                <Loader2
                  size={17}
                  className="animate-spin"
                />

              ) : (

                <Save size={17} />

              )}

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>


        </form>

      </div>

    </div>

  );

}


/* ------------------------------------------------ */
/* REUSABLE FIELD COMPONENTS */
/* ------------------------------------------------ */


function Field({
  label,
  value,
  disabled = false,
}: {
  label: string;
  value: string;
  disabled?: boolean;
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        value={value}
        disabled={disabled}
        readOnly
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none"
      />

    </div>

  );

}


function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
      />

    </div>

  );

}


function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
      />

    </div>

  );

}