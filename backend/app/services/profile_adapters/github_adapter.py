from typing import Dict, Any
from app.services.profile_adapters.base_adapter import BaseProfileAdapter
from app.services.github_service import (
    extract_github_username,
    normalize_github_url,
    fetch_github_profile,
)


class GitHubAdapter(BaseProfileAdapter):
    @property
    def platform_name(self) -> str:
        return "github"

    def extract_username(self, profile_url: str) -> str:
        return extract_github_username(profile_url)

    def normalize_url(self, username: str) -> str:
        return normalize_github_url(username)

    def fetch_profile_data(self, username: str) -> Dict[str, Any]:
        data = fetch_github_profile(username)
        return {
            "username": data.get("username", username),
            "stats": data.get("stats", {}),
            "api_available": True,
            "note": None,
        }
