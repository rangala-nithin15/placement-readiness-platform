from typing import List, Optional

from pydantic import BaseModel


class ConnectProfileRequest(BaseModel):

    platform: str

    profile_url: str


class ExternalProfileResponse(BaseModel):

    id: str

    student_id: str

    platform: str

    username: str

    profile_url: str

    verification_status: str

    stats: dict

    last_verified_at: Optional[str] = None


class ExternalProfileListResponse(BaseModel):

    profiles: List[
        ExternalProfileResponse
    ]

    total: int