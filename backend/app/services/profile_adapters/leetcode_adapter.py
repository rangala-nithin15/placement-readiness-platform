from typing import Dict, Any
from app.services.profile_adapters.base_adapter import BaseProfileAdapter
from app.services.leetcode_service import (
    extract_leetcode_username,
    normalize_leetcode_url,
    fetch_leetcode_profile,
)


class LeetCodeAdapter(BaseProfileAdapter):
    @property
    def platform_name(self) -> str:
        return "leetcode"

    def extract_username(self, profile_url: str) -> str:
        return extract_leetcode_username(profile_url)

    def normalize_url(self, username: str) -> str:
        return normalize_leetcode_url(username)

    def fetch_profile_data(self, username: str) -> Dict[str, Any]:
        data = fetch_leetcode_profile(username)
        return {
            "username": data.get("username", username),
            "stats": data.get("stats", {}),
            "api_available": True,
            "note": None,
        }
