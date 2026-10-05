from typing import Any, Dict, List
from datetime import datetime

import httpx


GITHUB_API_URL = "https://api.github.com"


def extract_github_username(
    profile_url: str,
) -> str:

    url = profile_url.strip()

    if not url:
        raise ValueError(
            "GitHub profile URL is required."
        )

    if not url.startswith(
        "http://"
    ) and not url.startswith(
        "https://"
    ):
        url = "https://" + url

    try:

        from urllib.parse import urlparse

        parsed = urlparse(url)

        hostname = (
            parsed.hostname or ""
        ).lower()

        if hostname not in {
            "github.com",
            "www.github.com",
        }:

            raise ValueError(
                "Please enter a valid GitHub profile URL."
            )

        parts = [
            part
            for part in parsed.path.split("/")
            if part
        ]

        if len(parts) != 1:

            raise ValueError(
                "Invalid GitHub profile URL."
            )

        username = parts[0].strip()

        if not username:

            raise ValueError(
                "GitHub username could not be found."
            )

        return username

    except ValueError:
        raise

    except Exception:

        raise ValueError(
            "Invalid GitHub profile URL."
        )


def normalize_github_url(
    username: str,
) -> str:

    return (
        f"https://github.com/"
        f"{username}"
    )


def _github_headers() -> Dict[str, str]:

    return {
        "Accept": (
            "application/vnd.github+json"
        ),
        "X-GitHub-Api-Version": (
            "2022-11-28"
        ),
        "User-Agent": (
            "Placement-Readiness-Platform"
        ),
    }


def fetch_github_profile(
    username: str,
) -> Dict[str, Any]:

    username = username.strip()

    if not username:

        raise ValueError(
            "GitHub username is required."
        )

    headers = _github_headers()

    try:

        with httpx.Client(
            timeout=15.0,
            headers=headers,
        ) as client:

            # --------------------------------------
            # USER PROFILE
            # --------------------------------------

            user_response = client.get(
                f"{GITHUB_API_URL}/users/{username}"
            )

            if (
                user_response.status_code
                == 404
            ):

                raise ValueError(
                    "GitHub profile was not found."
                )

            user_response.raise_for_status()

            user_data = (
                user_response.json()
            )

            # --------------------------------------
            # PUBLIC REPOSITORIES
            # --------------------------------------

            repos_response = client.get(
                f"{GITHUB_API_URL}/users/"
                f"{username}/repos",
                params={
                    "per_page": 100,
                    "page": 1,
                    "sort": "updated",
                },
            )

            repos_response.raise_for_status()

            repositories = (
                repos_response.json()
            )

    except ValueError:
        raise

    except httpx.HTTPStatusError as error:

        if (
            error.response.status_code
            == 403
        ):

            raise ValueError(
                "GitHub API rate limit reached. "
                "Please try again later."
            )

        raise ValueError(
            "GitHub API request failed."
        )

    except httpx.RequestError:

        raise ValueError(
            "Unable to connect to GitHub."
        )

    except Exception as error:

        raise ValueError(
            f"Unable to fetch GitHub profile: {error}"
        )


    # ------------------------------------------
    # CALCULATE PUBLIC REPOSITORY INFORMATION
    # ------------------------------------------

    total_stars = 0
    total_forks = 0

    languages = set()

    repository_summary: List[
        Dict[str, Any]
    ] = []

    for repository in repositories:

        stars = int(
            repository.get(
                "stargazers_count",
                0,
            )
            or 0
        )

        forks = int(
            repository.get(
                "forks_count",
                0,
            )
            or 0
        )

        total_stars += stars
        total_forks += forks

        language = repository.get(
            "language"
        )

        if language:

            languages.add(
                language
            )

        repository_summary.append(
            {
                "name": repository.get(
                    "name",
                    "",
                ),
                "html_url": repository.get(
                    "html_url",
                    "",
                ),
                "description": repository.get(
                    "description"
                ),
                "language": language,
                "stars": stars,
                "forks": forks,
                "is_fork": bool(
                    repository.get(
                        "fork",
                        False,
                    )
                ),
                "updated_at": repository.get(
                    "updated_at"
                ),
            }
        )


    # ------------------------------------------
    # PROFILE DATES
    # ------------------------------------------

    created_at = user_data.get(
        "created_at"
    )

    updated_at = user_data.get(
        "updated_at"
    )


    # ------------------------------------------
    # FINAL PUBLIC PROFILE DATA
    # ------------------------------------------

    return {

        "username": user_data.get(
            "login",
            username,
        ),

        "name": user_data.get(
            "name"
        ),

        "bio": user_data.get(
            "bio"
        ),

        "company": user_data.get(
            "company"
        ),

        "location": user_data.get(
            "location"
        ),

        "public_repositories": int(
            user_data.get(
                "public_repos",
                0,
            )
            or 0
        ),

        "followers": int(
            user_data.get(
                "followers",
                0,
            )
            or 0
        ),

        "following": int(
            user_data.get(
                "following",
                0,
            )
            or 0
        ),

        "public_gists": int(
            user_data.get(
                "public_gists",
                0,
            )
            or 0
        ),

        "total_stars": total_stars,

        "total_forks": total_forks,

        "languages": sorted(
            languages
        ),

        "account_created_at": created_at,

        "last_updated_at": updated_at,

        "repositories": repository_summary,
    }