from typing import Optional

from pydantic import BaseModel


class StudentRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    register_number: str
    department: str
    batch: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    register_number: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse