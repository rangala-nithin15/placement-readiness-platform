from typing import Any, Dict, List

import httpx


GITHUB_API_BASE_URL = (
    "https://api.github.com"
)


def get_github_user(
    username: str,
) -> Dict[str, Any]:

    url = (
        f"{GITHUB_API_BASE_URL}"
        f"/users/{username}"
    )

    headers = {
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

    response = httpx.get(
        url,
        headers=headers,
        timeout=10.0,
    )

    if response.status_code == 404:

        raise ValueError(
            "GitHub profile was not found."
        )

    if response.status_code == 403:

        raise ValueError(
            "GitHub API rate limit exceeded. "
            "Please try again later."
        )

    if response.status_code != 200:

        raise ValueError(
            "Unable to fetch GitHub profile."
        )

    return response.json()


def get_github_repositories(
    username: str,
) -> List[Dict[str, Any]]:

    url = (
        f"{GITHUB_API_BASE_URL}"
        f"/users/{username}/repos"
    )

    headers = {
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

    response = httpx.get(
        url,
        headers=headers,
        params={
            "per_page": 100,
            "sort": "updated",
        },
        timeout=10.0,
    )

    if response.status_code != 200:

        raise ValueError(
            "Unable to fetch GitHub repositories."
        )

    return response.json()


def calculate_repository_statistics(
    repositories: List[Dict[str, Any]],
) -> Dict[str, Any]:

    total_repositories = len(
        repositories
    )

    total_stars = 0

    total_forks = 0

    languages = set()

    for repository in repositories:

        total_stars += int(
            repository.get(
                "stargazers_count",
                0,
            )
        )

        total_forks += int(
            repository.get(
                "forks_count",
                0,
            )
        )

        language = repository.get(
            "language"
        )

        if language:

            languages.add(
                language
            )

    return {

        "public_repositories":
            total_repositories,

        "total_stars":
            total_stars,

        "total_forks":
            total_forks,

        "languages":
            sorted(
                list(languages)
            ),

    }


def fetch_github_statistics(
    username: str,
) -> Dict[str, Any]:

    user = get_github_user(
        username
    )

    repositories = (
        get_github_repositories(
            username
        )
    )

    repository_statistics = (
        calculate_repository_statistics(
            repositories
        )
    )

    return {

        "public_repositories":
            repository_statistics[
                "public_repositories"
            ],

        "total_stars":
            repository_statistics[
                "total_stars"
            ],

        "total_forks":
            repository_statistics[
                "total_forks"
            ],

        "languages":
            repository_statistics[
                "languages"
            ],

        "followers":
            int(
                user.get(
                    "followers",
                    0,
                )
            ),

        "following":
            int(
                user.get(
                    "following",
                    0,
                )
            ),

        "public_gists":
            int(
                user.get(
                    "public_gists",
                    0,
                )
            ),

        "account_created_at":
            user.get(
                "created_at"
            ),

        "last_updated_at":
            user.get(
                "updated_at"
            ),

    }