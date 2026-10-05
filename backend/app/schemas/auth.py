from typing import Optional
from pydantic import BaseModel, EmailStr


class StudentRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    register_number: str
    department: str
    batch: str


class MentorRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: str
    batch: str
    mentor_id: Optional[str] = None


class AdminRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: Optional[str] = "ADMIN"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    register_number: Optional[str] = None
    mentor_id: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    is_active: bool = True
    is_approved: bool = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse