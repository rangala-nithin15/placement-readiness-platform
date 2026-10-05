from datetime import datetime
from typing import Any
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.repositories.notification_repository import (
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    get_unread_count,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


def serialize_doc(doc: Any) -> Any:
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    if isinstance(doc, dict):
        res = {k: serialize_doc(v) for k, v in doc.items()}
        if "_id" in res and "id" not in res:
            res["id"] = res["_id"]
        return res
    if isinstance(doc, list):
        return [serialize_doc(i) for i in doc]
    return doc


@router.get("")
def get_my_notifications(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    notifications = get_user_notifications(user_id)
    unread = get_unread_count(user_id)
    return {
        "notifications": [serialize_doc(n) for n in notifications],
        "unread_count": unread,
        "total": len(notifications),
    }


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        nid = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID.")

    success = mark_notification_as_read(nid, current_user["_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")

    return {"message": "Notification marked as read."}


@router.post("/mark-all-read")
def mark_all_read(current_user: dict = Depends(get_current_user)):
    count = mark_all_notifications_as_read(current_user["_id"])
    return {"message": f"{count} notifications marked as read.", "count": count}
