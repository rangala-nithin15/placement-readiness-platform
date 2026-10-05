from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.security import get_current_user
from app.repositories.user_repository import (
    create_user,
    find_user_by_email,
)
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    StudentRegisterRequest,
    UserResponse,
)
from app.schemas.mentor import MentorRegisterRequest
from app.services.jwt_service import create_access_token
from app.services.password_service import (
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
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

    existing_user = find_user_by_email(email)

    if existing_user is not None:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    if len(request.password) < 8:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters.",
        )

    if not request.name.strip():

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required.",
        )

    if not request.register_number.strip():

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Register number is required.",
        )

    user_document = {
        "name": request.name.strip(),
        "email": email,
        "password_hash": hash_password(
            request.password
        ),
        "role": "STUDENT",
        "register_number": request.register_number.strip(),
        "department": request.department.strip(),
        "batch": request.batch.strip(),
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:

        created_user = create_user(
            user_document
        )

    except DuplicateKeyError:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email or register number is already registered.",
        )

    user_id = str(created_user["_id"])

    access_token = create_access_token(
        user_id=user_id,
        role="STUDENT",
    )

    user_response = UserResponse(
        id=user_id,
        name=created_user["name"],
        email=created_user["email"],
        role=created_user["role"],
        register_number=created_user.get(
            "register_number"
        ),
        department=created_user.get(
            "department"
        ),
        batch=created_user.get(
            "batch"
        ),
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
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

    existing_user = find_user_by_email(email)

    if existing_user is not None:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    if len(request.password) < 8:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters.",
        )

    if not request.name.strip():

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required.",
        )

    if not request.department.strip():

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department is required.",
        )

    if not request.batch.strip():

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch is required.",
        )

    user_document = {

        "name": request.name.strip(),

        "email": email,

        "password_hash": hash_password(
            request.password
        ),

        "role": "MENTOR",

        "register_number": None,

        "department": request.department.strip(),

        "batch": request.batch.strip(),

        "is_active": True,

        "created_at": datetime.utcnow(),

        "updated_at": datetime.utcnow(),

    }

    try:

        created_user = create_user(
            user_document
        )

    except DuplicateKeyError:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already registered.",
        )

    user_id = str(created_user["_id"])

    access_token = create_access_token(
        user_id=user_id,
        role="MENTOR",
    )

    user_response = UserResponse(
        id=user_id,
        name=created_user["name"],
        email=created_user["email"],
        role=created_user["role"],
        department=created_user.get(
            "department"
        ),
        batch=created_user.get(
            "batch"
        ),
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
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

    password_valid = verify_password(
        request.password,
        user["password_hash"],
    )

    if not password_valid:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user_id = str(user["_id"])

    access_token = create_access_token(
        user_id=user_id,
        role=user["role"],
    )

    user_response = UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        role=user["role"],
        register_number=user.get(
            "register_number"
        ),
        department=user.get(
            "department"
        ),
        batch=user.get(
            "batch"
        ),
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: dict = Depends(
        get_current_user
    ),
):

    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        register_number=current_user.get(
            "register_number"
        ),
        department=current_user.get(
            "department"
        ),
        batch=current_user.get(
            "batch"
        ),
    )