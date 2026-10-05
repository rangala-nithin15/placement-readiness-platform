import re
from typing import Dict, Any

import httpx


LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/"


PROFILE_QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      ranking
      reputation
      countryName
      aboutMe
      school
    }
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    badges {
      id
      displayName
      icon
    }
  }

  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    topPercentage
  }
}
"""


def extract_leetcode_username(
    profile_url: str,
) -> str:

    value = profile_url.strip()

    patterns = [
        r"^https?://(?:www\.)?leetcode\.com/u/([^/?#]+)/?$",
        r"^https?://(?:www\.)?leetcode\.com/profile/([^/?#]+)/?$",
    ]

    for pattern in patterns:

        match = re.match(
            pattern,
            value,
            re.IGNORECASE,
        )

        if match:

            return match.group(1).strip()

    raise ValueError(
        "Invalid LeetCode profile URL. "
        "Use https://leetcode.com/u/username/"
    )


def normalize_leetcode_url(
    username: str,
) -> str:

    return (
        f"https://leetcode.com/u/{username}/"
    )


def _get_difficulty_count(
    submissions: list,
    difficulty: str,
) -> int:

    for item in submissions:

        if (
            item.get("difficulty", "").lower()
            == difficulty.lower()
        ):

            return int(
                item.get("count", 0)
            )

    return 0


def fetch_leetcode_profile(
    username: str,
) -> Dict[str, Any]:

    payload = {
        "query": PROFILE_QUERY,
        "variables": {
            "username": username,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": (
            "PlacementReadinessPlatform/1.0"
        ),
        "Referer": (
            "https://leetcode.com/"
        ),
    }

    try:

        response = httpx.post(
            LEETCODE_GRAPHQL_URL,
            json=payload,
            headers=headers,
            timeout=15.0,
        )

        response.raise_for_status()

        data = response.json()

    except httpx.HTTPError as error:

        raise RuntimeError(
            f"Unable to contact LeetCode: {error}"
        )

    except ValueError:

        raise RuntimeError(
            "LeetCode returned an invalid response."
        )

    if data.get("errors"):

        raise RuntimeError(
            "LeetCode rejected the profile request."
        )

    graphql_data = data.get(
        "data",
        {},
    )

    matched_user = graphql_data.get(
        "matchedUser"
    )

    if matched_user is None:

        raise ValueError(
            "LeetCode username does not exist."
        )

    profile = matched_user.get(
        "profile"
    ) or {}

    submit_stats = (
        matched_user.get(
            "submitStats"
        ) or {}
    )

    submissions = (
        submit_stats.get(
            "acSubmissionNum"
        ) or []
    )

    contest = (
        graphql_data.get(
            "userContestRanking"
        )
        or {}
    )

    stats = {
        "problems_solved": (
            _get_difficulty_count(
                submissions,
                "All",
            )
        ),
        "easy": (
            _get_difficulty_count(
                submissions,
                "Easy",
            )
        ),
        "medium": (
            _get_difficulty_count(
                submissions,
                "Medium",
            )
        ),
        "hard": (
            _get_difficulty_count(
                submissions,
                "Hard",
            )
        ),
        "contest_rating": (
            contest.get("rating")
        ),
        "contest_global_ranking": (
            contest.get(
                "globalRanking"
            )
        ),
        "contest_top_percentage": (
            contest.get(
                "topPercentage"
            )
        ),
        "attended_contests": (
            contest.get(
                "attendedContestsCount"
            )
        ),
        "global_ranking": (
            profile.get(
                "ranking"
            )
        ),
        "reputation": (
            profile.get(
                "reputation"
            )
        ),
        "real_name": (
            profile.get(
                "realName"
            )
        ),
        "country": (
            profile.get(
                "countryName"
            )
        ),
        "school": (
            profile.get(
                "school"
            )
        ),
        "about": (
            profile.get(
                "aboutMe"
            )
        ),
        "badges_count": len(
            matched_user.get(
                "badges"
            ) or []
        ),
    }

    return {
        "username": matched_user.get(
            "username",
            username,
        ),
        "stats": stats,
    }