from typing import Dict, Any, Tuple
from app.services.profile_adapters import (
    BaseProfileAdapter,
    LeetCodeAdapter,
    GitHubAdapter,
    CodeChefAdapter,
    HackerRankAdapter,
    LinkedInAdapter,
)


class ExternalProfileService:
    def __init__(self):
        self._adapters: Dict[str, BaseProfileAdapter] = {
            "leetcode": LeetCodeAdapter(),
            "github": GitHubAdapter(),
            "codechef": CodeChefAdapter(),
            "hackerrank": HackerRankAdapter(),
            "linkedin": LinkedInAdapter(),
        }

    def is_supported(self, platform: str) -> bool:
        return platform.lower().strip() in self._adapters

    def get_adapter(self, platform: str) -> BaseProfileAdapter:
        p = platform.lower().strip()
        if p not in self._adapters:
            supported = ", ".join(self._adapters.keys())
            raise ValueError(f"Unsupported platform '{platform}'. Supported platforms: {supported}")
        return self._adapters[p]

    def validate_and_parse(self, platform: str, profile_url: str) -> Tuple[str, str]:
        adapter = self.get_adapter(platform)
        username = adapter.extract_username(profile_url)
        canonical_url = adapter.normalize_url(username)
        return username, canonical_url

    def fetch_data(self, platform: str, username: str) -> Dict[str, Any]:
        adapter = self.get_adapter(platform)
        return adapter.fetch_profile_data(username)


profile_service = ExternalProfileService()
