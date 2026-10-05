import re
from typing import Dict, Any
from app.services.profile_adapters.base_adapter import BaseProfileAdapter


class HackerRankAdapter(BaseProfileAdapter):
    @property
    def platform_name(self) -> str:
        return "hackerrank"

    def extract_username(self, profile_url: str) -> str:
        url = profile_url.strip()
        patterns = [
            r"^https?://(?:www\.)?hackerrank\.com/profile/([a-zA-Z0-9_\-]+)/?$",
            r"^https?://(?:www\.)?hackerrank\.com/([a-zA-Z0-9_\-]+)/?$",
        ]
        reserved = {"dashboard", "domains", "contests", "leaderboard", "challenges", "jobs", "auth", "login"}
        for pattern in patterns:
            match = re.match(pattern, url, re.IGNORECASE)
            if match:
                username = match.group(1).strip()
                if username.lower() not in reserved:
                    return username
        raise ValueError(
            "Invalid HackerRank profile URL. Expected format: https://www.hackerrank.com/profile/username"
        )

    def normalize_url(self, username: str) -> str:
        return f"https://www.hackerrank.com/profile/{username}"

    def fetch_profile_data(self, username: str) -> Dict[str, Any]:
        return {
            "username": username,
            "stats": {},
            "api_available": False,
            "note": "Official public API unavailable. Requires mentor verification.",
        }
