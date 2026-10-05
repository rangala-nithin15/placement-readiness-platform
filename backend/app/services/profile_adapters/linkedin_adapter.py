import re
from typing import Dict, Any
from app.services.profile_adapters.base_adapter import BaseProfileAdapter


class LinkedInAdapter(BaseProfileAdapter):
    @property
    def platform_name(self) -> str:
        return "linkedin"

    def extract_username(self, profile_url: str) -> str:
        url = profile_url.strip()
        pattern = r"^https?://(?:[a-zA-Z]{2,3}\.)?linkedin\.com/in/([a-zA-Z0-9_\-]+)/?$"
        match = re.match(pattern, url, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        raise ValueError(
            "Invalid LinkedIn profile URL. Expected format: https://www.linkedin.com/in/username"
        )

    def normalize_url(self, username: str) -> str:
        return f"https://www.linkedin.com/in/{username}"

    def fetch_profile_data(self, username: str) -> Dict[str, Any]:
        return {
            "username": username,
            "stats": {},
            "api_available": False,
            "note": "Official public API unavailable. Requires mentor verification.",
        }
