import {
  CheckCircle2,
  Code2,
  ExternalLink,
  Link2,
  RefreshCw,
} from "lucide-react";


import {
  useEffect,
  useState,
} from "react";


import {
  connectExternalProfile,
  getExternalProfiles,
  refreshExternalProfile,
  type ExternalProfile,
} from "../../services/externalProfileService";


const platforms = [

  {
    value: "leetcode",
    name: "LeetCode",
    description:
      "Connect your LeetCode profile.",
    placeholder:
      "https://leetcode.com/u/username",
  },

  {
    value: "github",
    name: "GitHub",
    description:
      "Connect your GitHub profile.",
    placeholder:
      "https://github.com/username",
  },

  {
    value: "codechef",
    name: "CodeChef",
    description:
      "Connect your CodeChef profile.",
    placeholder:
      "https://www.codechef.com/users/username",
  },

  {
    value: "hackerrank",
    name: "HackerRank",
    description:
      "Connect your HackerRank profile.",
    placeholder:
      "https://www.hackerrank.com/profile/username",
  },

];


export default function ConnectedProfiles() {

  const [profiles, setProfiles] =
    useState<ExternalProfile[]>([]);


  const [platform, setPlatform] =
    useState("github");


  const [profileUrl, setProfileUrl] =
    useState("");


  const [loading, setLoading] =
    useState(true);


  const [connecting, setConnecting] =
    useState(false);


  const [refreshingId, setRefreshingId] =
    useState<string | null>(null);


  const [error, setError] =
    useState("");


  const [success, setSuccess] =
    useState("");


  async function loadProfiles() {

    try {

      setLoading(true);

      setError("");

      const response =
        await getExternalProfiles();

      setProfiles(
        response.profiles
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


  async function handleConnect(
    event: React.FormEvent
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    if (!profileUrl.trim()) {

      setError(
        "Please enter your profile URL."
      );

      return;

    }


    try {

      setConnecting(true);


      const response =
        await connectExternalProfile({

          platform,

          profile_url:
            profileUrl.trim(),

        });


      setProfiles(
        (current) => [

          ...current,

          response,

        ]
      );


      setProfileUrl("");


      setSuccess(
        `${response.platform} profile connected successfully.`
      );


    } catch (err) {

      setError(

        err instanceof Error
          ? err.message
          : "Failed to connect profile."

      );

    } finally {

      setConnecting(false);

    }

  }


  async function handleRefresh(
    profileId: string
  ) {

    try {

      setRefreshingId(
        profileId
      );

      setError("");

      setSuccess("");


      const response =
        await refreshExternalProfile(
          profileId
        );


      setProfiles(
        (current) =>

          current.map(
            (profile) =>

              profile.id === profileId
                ? response
                : profile
          )

      );


      setSuccess(
        "GitHub profile statistics updated successfully."
      );


    } catch (err) {

      setError(

        err instanceof Error
          ? err.message
          : "Failed to refresh profile."

      );

    } finally {

      setRefreshingId(
        null
      );

    }

  }


  function getPlatformName(
    platformValue: string
  ) {

    const item =
      platforms.find(
        (item) =>
          item.value ===
          platformValue
      );


    return (
      item?.name ||
      platformValue
    );

  }


  const connectedPlatforms =
    new Set(

      profiles.map(
        (profile) =>
          profile.platform
      )

    );


  return (

    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-8">


        {/* Header */}

        <div>

          <p className="text-sm font-medium text-slate-500">
            Placement Profile
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Connected Profiles
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

            Connect your coding and professional
            profiles so your placement progress
            can be tracked in one place.

          </p>

        </div>


        {/* Error */}

        {error && (

          <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>

        )}


        {/* Success */}

        {success && (

          <div className="mt-6 border border-green-200 bg-green-50 px-4 py-3">

            <p className="text-sm font-medium text-green-700">
              {success}
            </p>

          </div>

        )}


        {/* Connect Profile */}

        <section className="mt-8 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center bg-slate-100">

                <Link2
                  size={20}
                  className="text-slate-700"
                />

              </div>


              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Connect a Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the public profile URL.
                </p>

              </div>

            </div>

          </div>


          <form
            onSubmit={handleConnect}
            className="p-6"
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">


              <div>

                <label className="block text-sm font-medium text-slate-700">
                  Platform
                </label>


                <select
                  value={platform}
                  onChange={(event) =>
                    setPlatform(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
                >

                  {platforms.map(
                    (item) => (

                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="md:col-span-2">

                <label className="block text-sm font-medium text-slate-700">
                  Profile URL
                </label>


                <input
                  type="url"
                  value={profileUrl}
                  onChange={(event) =>
                    setProfileUrl(
                      event.target.value
                    )
                  }
                  placeholder={
                    platforms.find(
                      (item) =>
                        item.value ===
                        platform
                    )?.placeholder
                  }
                  className="mt-2 w-full border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900"
                />

              </div>

            </div>


            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-500">

                GitHub statistics can be
                refreshed automatically.

              </p>


              <button
                type="submit"
                disabled={connecting}
                className="flex items-center justify-center gap-2 bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {connecting && (

                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />

                )}


                {connecting
                  ? "Connecting..."
                  : "Connect Profile"}

              </button>

            </div>

          </form>

        </section>


        {/* Profiles */}

        <section className="mt-8 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Your Connected Profiles
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Profiles currently connected to your placement account.
            </p>

          </div>


          {loading && (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading profiles...
              </p>

            </div>

          )}


          {!loading &&
            profiles.length === 0 && (

              <div className="px-6 py-12 text-center">

                <Code2
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-4 text-sm font-medium text-slate-700">
                  No profiles connected yet.
                </p>

              </div>

            )}


          {!loading &&
            profiles.length > 0 && (

              <div className="divide-y divide-slate-100">

                {profiles.map(
                  (profile) => (

                    <div
                      key={profile.id}
                      className="px-6 py-6"
                    >


                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">


                        <div className="flex items-center gap-4">

                          <div className="flex h-11 w-11 items-center justify-center bg-slate-100">

                            <Code2
                              size={21}
                              className="text-slate-700"
                            />

                          </div>


                          <div>

                            <p className="text-sm font-semibold text-slate-900">

                              {getPlatformName(
                                profile.platform
                              )}

                            </p>

                            <p className="mt-1 text-sm text-slate-500">

                              @{profile.username}

                            </p>

                          </div>

                        </div>


                        <div className="flex flex-wrap items-center gap-4">


                          <div className="flex items-center gap-2">

                            {profile.verification_status ===
                            "VERIFIED" ? (

                              <CheckCircle2
                                size={17}
                                className="text-green-600"
                              />

                            ) : (

                              <span className="h-2 w-2 rounded-full bg-amber-500" />

                            )}


                            <span className="text-sm font-medium text-slate-700">

                              {profile.verification_status ===
                              "VERIFIED"
                                ? "Verified"
                                : "Pending verification"}

                            </span>

                          </div>


                          {profile.platform ===
                            "github" && (

                            <button
                              onClick={() =>
                                handleRefresh(
                                  profile.id
                                )
                              }
                              disabled={
                                refreshingId ===
                                profile.id
                              }
                              className="flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >

                              <RefreshCw
                                size={15}
                                className={
                                  refreshingId ===
                                  profile.id
                                    ? "animate-spin"
                                    : ""
                                }
                              />

                              {refreshingId ===
                              profile.id
                                ? "Refreshing..."
                                : "Refresh"}

                            </button>

                          )}


                          <a
                            href={
                              profile.profile_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                          >

                            View

                            <ExternalLink
                              size={15}
                            />

                          </a>

                        </div>

                      </div>


                      {/* GitHub Statistics */}

                      {profile.platform ===
                        "github" &&
                        Object.keys(
                          profile.stats
                        ).length > 0 && (

                        <div className="mt-6 border-t border-slate-100 pt-5">

                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            GitHub Statistics
                          </p>


                          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">


                            <Stat
                              label="Repositories"
                              value={
                                String(
                                  profile.stats[
                                    "public_repositories"
                                  ] ?? 0
                                )
                              }
                            />


                            <Stat
                              label="Stars"
                              value={
                                String(
                                  profile.stats[
                                    "total_stars"
                                  ] ?? 0
                                )
                              }
                            />


                            <Stat
                              label="Forks"
                              value={
                                String(
                                  profile.stats[
                                    "total_forks"
                                  ] ?? 0
                                )
                              }
                            />


                            <Stat
                              label="Followers"
                              value={
                                String(
                                  profile.stats[
                                    "followers"
                                  ] ?? 0
                                )
                              }
                            />


                          </div>


                          {Array.isArray(
                            profile.stats[
                              "languages"
                            ]
                          ) &&
                            (
                              profile.stats[
                                "languages"
                              ] as string[]
                            ).length > 0 && (

                              <div className="mt-5">

                                <p className="text-xs font-medium text-slate-500">
                                  Languages
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">

                                  {(
                                    profile.stats[
                                      "languages"
                                    ] as string[]
                                  ).map(
                                    (language) => (

                                      <span
                                        key={language}
                                        className="border border-slate-300 px-2.5 py-1 text-xs text-slate-700"
                                      >
                                        {language}
                                      </span>

                                    )
                                  )}

                                </div>

                              </div>

                            )}


                          {profile.last_verified_at && (

                            <p className="mt-5 text-xs text-slate-500">

                              Last updated:{" "}

                              {new Date(
                                profile.last_verified_at
                              ).toLocaleString()}

                            </p>

                          )}

                        </div>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

        </section>


        {/* Platform status */}

        <section className="mt-8 border border-slate-200 bg-white">


          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Profile Status
            </h2>

          </div>


          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">

            {platforms.map(
              (item) => {

                const connected =
                  connectedPlatforms.has(
                    item.value
                  );


                return (

                  <div
                    key={item.value}
                    className="flex items-center justify-between px-6 py-5"
                  >

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.description}
                      </p>

                    </div>


                    <span
                      className={
                        connected
                          ? "text-xs font-medium text-green-700"
                          : "text-xs font-medium text-slate-400"
                      }
                    >

                      {connected
                        ? "Connected"
                        : "Not connected"}

                    </span>

                  </div>

                );

              }
            )}

          </div>

        </section>


      </div>

    </div>

  );

}


function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (

    <div className="border border-slate-200 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-slate-900">
        {value}
      </p>

    </div>

  );

}