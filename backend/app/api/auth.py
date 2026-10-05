from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.security import get_current_user
from app.repositories.user_repository import (
    create_user,
    find_user_by_email,
    find_user_by_register_number,
    find_user_by_mentor_id,
    generate_mentor_id,
    ensure_admin_user,
)
from app.repositories.student_repository import (
    create_student_profile,
)
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    StudentRegisterRequest,
    MentorRegisterRequest,
    AdminRegisterRequest,
    UserResponse,
)
from app.services.jwt_service import create_access_token
from app.services.password_service import (
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def _build_user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        name=user.get("name", ""),
        email=user.get("email", ""),
        role=user.get("role", "STUDENT"),
        register_number=user.get("register_number"),
        mentor_id=user.get("mentor_id"),
        department=user.get("department"),
        batch=user.get("batch"),
        is_active=user.get("is_active", True),
        is_approved=user.get("is_approved", True),
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_student(
    request: StudentRegisterRequest,
):
    email = request.email.lower().strip()
    register_number = request.register_number.strip().upper()

    if not request.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required.",
        )

    if not register_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Register number is required.",
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College email is required.",
        )

    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters.",
        )

    if find_user_by_email(email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    if find_user_by_register_number(register_number) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this register number already exists.",
        )

    user_document = {
        "name": request.name.strip(),
        "email": email,
        "password_hash": hash_password(request.password),
        "role": "STUDENT",
        "register_number": register_number,
        "mentor_id": None,
        "department": request.department.strip().upper(),
        "batch": request.batch.strip(),
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        created_user = create_user(user_document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email or register number is already registered.",
        )

    # Initialize corresponding student profile
    create_student_profile(created_user)

    user_id = str(created_user["_id"])
    access_token = create_access_token(
        user_id=user_id,
        role="STUDENT",
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=_build_user_response(created_user),
    )


@router.post(
    "/register-mentor",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_mentor(
    request: MentorRegisterRequest,
):
    email = request.email.lower().strip()
    department = request.department.strip().upper()

    if not request.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required.",
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required.",
        )

    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters.",
        )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department is required.",
        )

    if find_user_by_email(email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Assign or generate mentor ID
    if request.mentor_id and request.mentor_id.strip():
        mentor_id = request.mentor_id.strip().upper()
        if find_user_by_mentor_id(mentor_id) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Mentor ID '{mentor_id}' is already registered.",
            )
    else:
        mentor_id = generate_mentor_id(department)

    user_document = {
        "name": request.name.strip(),
        "email": email,
        "password_hash": hash_password(request.password),
        "role": "MENTOR",
        "register_number": None,
        "mentor_id": mentor_id,
        "department": department,
        "batch": request.batch.strip(),
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        created_user = create_user(user_document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email or mentor ID is already registered.",
        )

    user_id = str(created_user["_id"])
    access_token = create_access_token(
        user_id=user_id,
        role="MENTOR",
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=_build_user_response(created_user),
    )


@router.post(
    "/register-admin",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_admin(
    request: AdminRegisterRequest,
):
    email = request.email.lower().strip()

    if not request.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin name is required.",
        )

    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters.",
        )

    if find_user_by_email(email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_document = {
        "name": request.name.strip(),
        "email": email,
        "password_hash": hash_password(request.password),
        "role": "ADMIN",
        "register_number": None,
        "mentor_id": None,
        "department": (request.department or "ADMIN").strip().upper(),
        "batch": "ALL",
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        created_user = create_user(user_document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already registered.",
        )

    user_id = str(created_user["_id"])
    access_token = create_access_token(
        user_id=user_id,
        role="ADMIN",
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=_build_user_response(created_user),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    request: LoginRequest,
):
    email = request.email.lower().strip()

    user = find_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    if not user.get("is_approved", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This mentor account is pending admin approval.",
        )

    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_id = str(user["_id"])
    access_token = create_access_token(
        user_id=user_id,
        role=user["role"],
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=_build_user_response(user),
    )


@router.post(
    "/logout",
)
def logout():
    return {
        "status": "ok",
        "message": "Logged out successfully.",
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: dict = Depends(
        get_current_user
    ),
):
    return _build_user_response(current_user)