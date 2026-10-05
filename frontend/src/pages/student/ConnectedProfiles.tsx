import {
  ExternalLink,
  Link2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  connectExternalProfile,
  deleteExternalProfile,
  getExternalProfiles,
  refreshExternalProfile,
} from "../../services/externalProfileService";

import type {
  ExternalProfile,
} from "../../services/externalProfileService";


// ==================================================
// MAIN COMPONENT
// ==================================================

export default function ConnectedProfiles() {
  const [profiles, setProfiles] =
    useState<ExternalProfile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [connecting, setConnecting] =
    useState(false);

  const [refreshingId, setRefreshingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [platform, setPlatform] =
    useState("leetcode");

  const [profileUrl, setProfileUrl] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==================================================
  // LOAD PROFILES
  // ==================================================

  async function loadProfiles() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getExternalProfiles();

      setProfiles(
        Array.isArray(response.profiles)
          ? response.profiles
          : []
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load connected profiles."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadProfiles();
  }, []);


  // ==================================================
  // CONNECT PROFILE
  // ==================================================

  async function handleConnect(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedUrl =
      profileUrl.trim();

    if (!trimmedUrl) {
      setError(
        `Please enter your ${getPlatformName(
          platform
        )} profile URL.`
      );

      return;
    }

    try {
      setConnecting(true);

      const profile =
        await connectExternalProfile({
          platform,
          profile_url: trimmedUrl,
        });

      setProfiles((current) => {
        const alreadyExists =
          current.some(
            (item) =>
              item.id === profile.id
          );

        if (alreadyExists) {
          return current;
        }

        return [
          profile,
          ...current,
        ];
      });

      setProfileUrl("");

      setSuccess(
        `${getPlatformName(
          platform
        )} profile connected successfully.`
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to connect ${getPlatformName(
              platform
            )} profile.`
      );
    } finally {
      setConnecting(false);
    }
  }


  // ==================================================
  // REFRESH PROFILE
  // ==================================================

  async function handleRefresh(
    profileId: string
  ) {
    try {
      setError("");
      setSuccess("");

      setRefreshingId(profileId);

      const updatedProfile =
        await refreshExternalProfile(
          profileId
        );

      setProfiles((current) =>
        current.map(
          (profile) =>
            profile.id === profileId
              ? updatedProfile
              : profile
        )
      );

      setSuccess(
        "Profile refreshed successfully."
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh profile."
      );
    } finally {
      setRefreshingId(null);
    }
  }


  // ==================================================
  // DELETE PROFILE
  // ==================================================

  async function handleDelete(
    profileId: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to disconnect this profile?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      setDeletingId(profileId);

      await deleteExternalProfile(
        profileId
      );

      setProfiles((current) =>
        current.filter(
          (profile) =>
            profile.id !== profileId
        )
      );

      setSuccess(
        "Profile disconnected successfully."
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to disconnect profile."
      );
    } finally {
      setDeletingId(null);
    }
  }


  // ==================================================
  // HELPERS
  // ==================================================

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "Not verified yet";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString();
  }


  function getPlatformName(
    value: string
  ) {
    switch (
      value.toLowerCase()
    ) {
      case "leetcode":
        return "LeetCode";

      case "github":
        return "GitHub";

      case "codechef":
        return "CodeChef";

      case "hackerrank":
        return "HackerRank";

      case "linkedin":
        return "LinkedIn";

      default:
        return value;
    }
  }


  function getVerificationLabel(
    status: string
  ) {
    switch (
      status.toUpperCase()
    ) {
      case "VERIFIED":
        return "Verified";

      case "PENDING":
        return "Pending";

      default:
        return status;
    }
  }


  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-6xl px-6 py-8">

          <p className="text-sm font-medium text-slate-500">
            Student Portal
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Connected Profiles
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Connect your coding and professional profiles
            so your placement readiness information can be
            reviewed in one place.
          </p>

        </div>

      </header>


      {/* MAIN */}

      <main className="mx-auto max-w-6xl px-6 py-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3">

            <p className="text-sm font-medium text-green-700">
              {success}
            </p>

          </div>
        )}


        {/* CONNECT PROFILE */}

        <section className="border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center bg-slate-900 text-white">

                <Link2 size={19} />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Connect a Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Connect your external coding profiles.
                </p>

              </div>

            </div>

          </div>


          <div className="p-6">

            <form
              onSubmit={handleConnect}
              className="space-y-4"
            >

              {/* PLATFORM */}

              <div>

                <label
                  htmlFor="platform"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Platform
                </label>

                <select
                  id="platform"
                  value={platform}
                  onChange={(event) =>
                    setPlatform(
                      event.target.value
                    )
                  }
                  className="w-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                >

                  <option value="leetcode">
                    LeetCode
                  </option>

                  <option value="github">
                    GitHub
                  </option>

                  <option value="codechef">
                    CodeChef
                  </option>

                  <option value="hackerrank">
                    HackerRank
                  </option>

                  <option value="linkedin">
                    LinkedIn
                  </option>

                </select>

              </div>


              {/* PROFILE URL */}

              <div>

                <label
                  htmlFor="profile-url"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {getPlatformName(
                    platform
                  )}{" "}
                  Profile URL
                </label>

                <input
                  id="profile-url"
                  type="url"
                  value={profileUrl}
                  onChange={(event) =>
                    setProfileUrl(
                      event.target.value
                    )
                  }
                  placeholder={
                    platform === "github"
                      ? "https://github.com/your-username"
                      : platform === "codechef"
                      ? "https://www.codechef.com/users/your-username"
                      : platform === "hackerrank"
                      ? "https://www.hackerrank.com/profile/your-username"
                      : platform === "linkedin"
                      ? "https://www.linkedin.com/in/your-username"
                      : "https://leetcode.com/u/your-username/"
                  }
                  className="w-full border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />

              </div>


              {/* CONNECT BUTTON */}

              <button
                type="submit"
                disabled={connecting}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {connecting ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />

                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 size={16} />

                    Connect{" "}
                    {getPlatformName(
                      platform
                    )}
                  </>
                )}

              </button>

            </form>

          </div>

        </section>


        {/* CONNECTED PROFILES */}

        <section className="mt-8">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-slate-900">
              Your Connected Profiles
            </h2>

            <p className="mt-1 text-sm text-slate-500">

              {profiles.length} connected profile
              {profiles.length === 1
                ? ""
                : "s"}

            </p>

          </div>


          {/* LOADING */}

          {loading ? (

            <div className="border border-slate-200 bg-white p-10 text-center">

              <RefreshCw
                size={24}
                className="mx-auto animate-spin text-slate-500"
              />

              <p className="mt-4 text-sm text-slate-500">
                Loading connected profiles...
              </p>

            </div>

          ) : profiles.length === 0 ? (

            /* EMPTY */

            <div className="border border-dashed border-slate-300 bg-white p-10 text-center">

              <Link2
                size={30}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No profiles connected
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Connect your LeetCode or GitHub
                profile above to display your
                real profile statistics.
              </p>

            </div>

          ) : (

            /* PROFILE LIST */

            <div className="space-y-6">

              {profiles.map(
                (profile) => (

                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    refreshing={
                      refreshingId ===
                      profile.id
                    }
                    deleting={
                      deletingId ===
                      profile.id
                    }
                    onRefresh={() =>
                      handleRefresh(
                        profile.id
                      )
                    }
                    onDelete={() =>
                      handleDelete(
                        profile.id
                      )
                    }
                    platformName={
                      getPlatformName(
                        profile.platform
                      )
                    }
                    verificationLabel={
                      getVerificationLabel(
                        profile.verification_status
                      )
                    }
                    formattedDate={
                      formatDate(
                        profile.last_verified_at
                      )
                    }
                  />

                )
              )}

            </div>

          )}

        </section>


        {/* INFORMATION */}

        <section className="mt-8 border border-slate-200 bg-white p-6">

          <h2 className="text-base font-semibold text-slate-900">
            How profile data is used
          </h2>

          <div className="mt-4 space-y-3 text-sm text-slate-600">

            <p>
              • Your public profile information is fetched
              from the connected platform.
            </p>

            <p>
              • The system stores the latest available
              statistics for placement-readiness tracking.
            </p>

            <p>
              • Mentors can view your connected profiles
              from your student profile.
            </p>

            <p>
              • You can refresh your profile whenever you
              want to retrieve the latest available data.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}


// =====================================================
// PROFILE CARD
// =====================================================

function ProfileCard({
  profile,
  refreshing,
  deleting,
  onRefresh,
  onDelete,
  platformName,
  verificationLabel,
  formattedDate,
}: {
  profile: ExternalProfile;

  refreshing: boolean;

  deleting: boolean;

  onRefresh: () => void;

  onDelete: () => void;

  platformName: string;

  verificationLabel: string;

  formattedDate: string;
}) {

  const stats =
    profile.stats || {};


  const isLeetCode =
    profile.platform.toLowerCase() ===
    "leetcode";


  const isGitHub =
    profile.platform.toLowerCase() ===
    "github";


  return (
    <article className="border border-slate-200 bg-white">

      {/* PROFILE HEADER */}

      <div className="border-b border-slate-200 px-6 py-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 items-center justify-center bg-slate-900 text-white">

              <Link2 size={22} />

            </div>


            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-lg font-semibold text-slate-900">
                  {platformName}
                </h3>


                <span
                  className={
                    profile.verification_status.toUpperCase() ===
                    "VERIFIED"
                      ? "border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                      : "border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
                  }
                >
                  {verificationLabel}
                </span>

              </div>


              <p className="mt-1 text-sm text-slate-500">
                @{profile.username}
              </p>


              <a
                href={profile.profile_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700 underline"
              >

                Open profile

                <ExternalLink size={14} />

              </a>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={onRefresh}
              disabled={
                refreshing ||
                deleting
              }
              className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>


            <button
              type="button"
              onClick={onDelete}
              disabled={
                refreshing ||
                deleting
              }
              className="inline-flex items-center gap-2 border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Trash2 size={15} />

              {deleting
                ? "Removing..."
                : "Disconnect"}

            </button>

          </div>

        </div>

      </div>


      {/* ================================ */}
      {/* LEETCODE STATISTICS              */}
      {/* ================================ */}

      {isLeetCode && (

        <div className="p-6">

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

            <StatItem
              label="Problems Solved"
              value={
                Number(
                  stats.problems_solved ?? 0
                )
              }
            />

            <StatItem
              label="Easy"
              value={
                Number(
                  stats.easy ?? 0
                )
              }
            />

            <StatItem
              label="Medium"
              value={
                Number(
                  stats.medium ?? 0
                )
              }
            />

            <StatItem
              label="Hard"
              value={
                Number(
                  stats.hard ?? 0
                )
              }
            />

            <StatItem
              label="Contest Rating"
              value={
                stats.contest_rating != null
                  ? String(
                      stats.contest_rating
                    )
                  : "—"
              }
            />

            <StatItem
              label="Contests"
              value={
                stats.contests_attended != null
                  ? String(
                      stats.contests_attended
                    )
                  : "—"
              }
            />

            <StatItem
              label="Global Ranking"
              value={
                stats.global_ranking != null
                  ? Number(
                      stats.global_ranking
                    ).toLocaleString()
                  : "—"
              }
            />

            <StatItem
              label="Reputation"
              value={
                stats.reputation != null
                  ? String(
                      stats.reputation
                    )
                  : "—"
              }
            />

          </div>

        </div>

      )}


      {/* ================================ */}
      {/* GITHUB STATISTICS                */}
      {/* ================================ */}

      {isGitHub && (

        <div className="p-6">

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

            <StatItem
              label="Repositories"
              value={
                Number(
                  stats.public_repositories ?? 0
                )
              }
            />

            <StatItem
              label="Followers"
              value={
                Number(
                  stats.followers ?? 0
                )
              }
            />

            <StatItem
              label="Following"
              value={
                Number(
                  stats.following ?? 0
                )
              }
            />

            <StatItem
              label="Public Gists"
              value={
                Number(
                  stats.public_gists ?? 0
                )
              }
            />

            <StatItem
              label="Total Stars"
              value={
                Number(
                  stats.total_stars ?? 0
                )
              }
            />

            <StatItem
              label="Total Forks"
              value={
                Number(
                  stats.total_forks ?? 0
                )
              }
            />

          </div>


          {/* LANGUAGES */}

          {Array.isArray(
            stats.languages
          ) &&
            stats.languages.length > 0 && (

              <div className="mt-6">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Languages
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {stats.languages.map(
                    (language) => (

                      <span
                        key={String(
                          language
                        )}
                        className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                      >
                        {String(
                          language
                        )}
                      </span>

                    )
                  )}

                </div>

              </div>

            )}


          {/* RECENT REPOSITORIES */}

          {Array.isArray(
            stats.repositories
          ) &&
            stats.repositories.length > 0 && (

              <div className="mt-6">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recent Public Repositories
                </p>


                <div className="mt-3 space-y-3">

                  {stats.repositories
                    .slice(0, 5)
                    .map(
                      (
                        repository: any
                      ) => (

                        <div
                          key={
                            String(
                              repository.name
                            )
                          }
                          className="border border-slate-200 p-4"
                        >

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                            <div className="min-w-0">

                              <p className="font-medium text-slate-900">
                                {String(
                                  repository.name
                                )}
                              </p>


                              {repository.description && (

                                <p className="mt-1 text-sm text-slate-500">
                                  {String(
                                    repository.description
                                  )}
                                </p>

                              )}

                            </div>


                            {repository.html_url && (

                              <a
                                href={String(
                                  repository.html_url
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-700 underline"
                              >

                                Open

                                <ExternalLink
                                  size={14}
                                />

                              </a>

                            )}

                          </div>


                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">

                            {repository.language && (
                              <span>
                                Language:{" "}
                                {String(
                                  repository.language
                                )}
                              </span>
                            )}

                            <span>
                              Stars:{" "}
                              {Number(
                                repository.stars ?? 0
                              )}
                            </span>

                            <span>
                              Forks:{" "}
                              {Number(
                                repository.forks ?? 0
                              )}
                            </span>

                          </div>

                        </div>

                      )
                    )}

                </div>

              </div>

            )}

        </div>

      )}


      {/* LAST REFRESHED */}

      <div className="px-6 pb-6">

        <div className="border-t border-slate-100 pt-4">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Last refreshed
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {formattedDate}
          </p>

        </div>

      </div>

    </article>
  );
}


// =====================================================
// STAT ITEM
// =====================================================

function StatItem({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {

  return (

    <div className="border border-slate-200 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-slate-900">
        {value}
      </p>

    </div>

  );
}