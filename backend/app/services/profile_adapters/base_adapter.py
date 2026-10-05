from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseProfileAdapter(ABC):
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """The canonical name of the platform, e.g. 'leetcode'."""
        pass

    @abstractmethod
    def extract_username(self, profile_url: str) -> str:
        """Extract and validate the username from a given profile URL."""
        pass

    @abstractmethod
    def normalize_url(self, username: str) -> str:
        """Generate the standard canonical URL for the username."""
        pass

    @abstractmethod
    def fetch_profile_data(self, username: str) -> Dict[str, Any]:
        """
        Fetch public statistics.
        Returns a dict containing:
          - 'username': str
          - 'stats': dict
          - 'api_available': bool
          - 'note': Optional[str]
        NEVER invents statistics.
        """
        pass
