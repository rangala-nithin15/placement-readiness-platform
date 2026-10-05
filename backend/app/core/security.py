from typing import Dict, Any

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.repositories.user_repository import find_user_by_id
from app.services.jwt_service import decode_access_token


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> dict:

    token = credentials.credentials

    try:

        payload: Dict[str, Any] = decode_access_token(
            token
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token.",
            )

        user = find_user_by_id(
            ObjectId(user_id)
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found.",
            )

        return user

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )


def require_role(
    required_role: str,
):

    def role_checker(
        current_user: dict = Depends(
            get_current_user
        ),
    ) -> dict:

        if current_user.get("role") != required_role:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )

        return current_user

    return role_checker