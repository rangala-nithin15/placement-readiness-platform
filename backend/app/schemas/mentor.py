from typing import List, Optional

from pydantic import BaseModel


class MentorRegisterRequest(BaseModel):

    name: str

    email: str

    password: str

    department: str

    batch: str


class MentorStudentResponse(BaseModel):

    id: str

    name: str

    email: str

    register_number: Optional[str] = None

    department: Optional[str] = None

    batch: Optional[str] = None

    profile_completion: int = 0


class MentorStudentListResponse(BaseModel):

    students: List[MentorStudentResponse]

    total: int


class AssignStudentRequest(BaseModel):

    student_id: str


class AssignmentResponse(BaseModel):

    message: str

    mentor_id: str

    student_id: str