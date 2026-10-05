from typing import List, Optional

from pydantic import BaseModel


class StudentProfileResponse(BaseModel):

    id: str

    user_id: str

    name: str

    email: str

    register_number: Optional[str] = None

    department: Optional[str] = None

    batch: Optional[str] = None

    phone: Optional[str] = None

    location: Optional[str] = None

    linkedin_url: Optional[str] = None

    cgpa: Optional[float] = None

    tenth_percentage: Optional[float] = None

    twelfth_percentage: Optional[float] = None

    backlogs: int = 0

    skills: List[str] = []

    career_interests: List[str] = []

    profile_completion: int = 0


class StudentProfileUpdateRequest(BaseModel):

    phone: Optional[str] = None

    location: Optional[str] = None

    linkedin_url: Optional[str] = None

    cgpa: Optional[float] = None

    tenth_percentage: Optional[float] = None

    twelfth_percentage: Optional[float] = None

    backlogs: Optional[int] = None

    skills: Optional[List[str]] = None

    career_interests: Optional[List[str]] = None