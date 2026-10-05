from datetime import datetime, timedelta
from typing import Dict, Any

import jwt

from app.core.config import settings


def create_access_token(
    user_id: str,
    role: str,
) -> str:

    expire_time = datetime.utcnow() + timedelta(
        minutes=settings.jwt_expire_minutes
    )

    payload: Dict[str, Any] = {
        "sub": user_id,
        "role": role,
        "exp": expire_time,
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    return token


def decode_access_token(token: str) -> Dict[str, Any]:

    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
    )

    return payload