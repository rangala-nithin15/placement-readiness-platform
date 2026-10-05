from datetime import datetime
from typing import Dict, List, Optional, Tuple

from bson import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from pydantic import BaseModel, Field, field_validator

from app.core.security import get_current_user
from app.repositories.chat_repository import (
    create_chat_message,
    get_assigned_mentor_for_student,
    get_chat_messages,
    get_mentor_group_info,
)
from app.repositories.user_repository import find_user_by_id
from app.services.jwt_service import decode_access_token

router = APIRouter(prefix="/chat", tags=["Chat"])


class SendChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be blank.")
        return stripped


class ChatConnectionManager:
    def __init__(self):
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
        self.active_rooms[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_rooms:
            if websocket in self.active_rooms[room_id]:
                self.active_rooms[room_id].remove(websocket)
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]

    async def broadcast(self, room_id: str, payload: dict):
        if room_id in self.active_rooms:
            dead_connections = []
            for conn in self.active_rooms[room_id]:
                try:
                    await conn.send_json(payload)
                except Exception:
                    dead_connections.append(conn)
            for dead in dead_connections:
                if dead in self.active_rooms[room_id]:
                    self.active_rooms[room_id].remove(dead)


manager = ChatConnectionManager()


def authenticate_ws_token(token: str) -> Optional[dict]:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return find_user_by_id(ObjectId(user_id))
    except Exception:
        return None


def resolve_user_group(current_user: dict) -> Tuple[str, dict]:
    role = current_user.get("role")
    if role == "MENTOR":
        mentor_id = str(current_user["_id"])
        group_info = get_mentor_group_info(mentor_id)
        if not group_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentor profile not found.",
            )
        return mentor_id, group_info

    elif role == "STUDENT":
        mentor = get_assigned_mentor_for_student(current_user["_id"])
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You do not have an assigned mentor yet. Please wait for an administrator to assign you to a mentor.",
            )
        mentor_id = str(mentor["_id"])
        group_info = get_mentor_group_info(mentor_id)
        if not group_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned mentor group not found.",
            )
        return mentor_id, group_info

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chat is restricted to mentors and students.",
        )


@router.get("/group")
def get_user_chat_group(
    current_user: dict = Depends(get_current_user),
):
    """
    Get the mentorship group room metadata and recent messages
    enforcing mentor-student isolation.
    """
    mentor_id, group_info = resolve_user_group(current_user)
    messages = get_chat_messages(mentor_id, limit=100)
    return {
        "group": group_info,
        "messages": messages,
        "current_user_id": str(current_user["_id"]),
    }


@router.get("/messages")
def get_messages(
    since: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """
    Get messages for the user's authorized mentorship group.
    Supports polling fallback with `since` ISO timestamp.
    """
    mentor_id, _ = resolve_user_group(current_user)
    since_dt = None
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
        except Exception:
            pass

    messages = get_chat_messages(mentor_id, limit=100, since=since_dt)
    return {"messages": messages}


@router.post("/messages")
async def send_message(
    body: SendChatMessageRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Post a new message to the user's authorized mentorship group.
    Broadcasts in real-time to active WebSocket listeners.
    """
    mentor_id, _ = resolve_user_group(current_user)
    msg_obj = create_chat_message(
        mentor_id=mentor_id,
        sender_id=str(current_user["_id"]),
        sender_name=current_user.get("name", "User"),
        sender_role=current_user.get("role", "STUDENT"),
        sender_register_number=current_user.get("register_number"),
        sender_mentor_id=current_user.get("mentor_id"),
        message=body.message,
    )

    # Broadcast via WebSocket
    await manager.broadcast(
        mentor_id,
        {"type": "chat_message", "message": msg_obj},
    )

    return {"message": msg_obj}


@router.websocket("/ws/{room_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: Optional[str] = Query(None),
):
    """
    WebSocket endpoint for real-time messaging in a mentorship group.
    Authenticates token and strictly validates room authorization.
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user = authenticate_ws_token(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Check isolation
    role = user.get("role")
    if role == "MENTOR":
        if str(user["_id"]) != room_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    elif role == "STUDENT":
        mentor = get_assigned_mentor_for_student(user["_id"])
        if not mentor or str(mentor["_id"]) != room_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    else:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(room_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            raw_msg = data.get("message", "")
            if not isinstance(raw_msg, str) or not raw_msg.strip():
                continue

            msg_obj = create_chat_message(
                mentor_id=room_id,
                sender_id=str(user["_id"]),
                sender_name=user.get("name", "User"),
                sender_role=user.get("role", "STUDENT"),
                sender_register_number=user.get("register_number"),
                sender_mentor_id=user.get("mentor_id"),
                message=raw_msg.strip()[:2000],
            )

            await manager.broadcast(
                room_id,
                {"type": "chat_message", "message": msg_obj},
            )
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
    except Exception:
        manager.disconnect(room_id, websocket)
