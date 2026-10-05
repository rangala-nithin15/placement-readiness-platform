from datetime import datetime
from typing import Any, Optional, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user, require_role
from app.repositories.mentor_repository import (
    get_assigned_student,
    get_mentor_students,
)
from app.repositories.task_repository import (
    create_task,
    get_student_tasks,
    get_mentor_tasks,
    get_task_by_id,
    update_task_status,
    delete_task,
)
from app.repositories.notification_repository import create_notification


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


class CreateTaskRequest(BaseModel):
    student_id: Optional[str] = None
    broadcast_to_all: Optional[bool] = False
    title: str
    description: str
    priority: Optional[str] = "MEDIUM"
    due_date: Optional[str] = None


class UpdateTaskStatusRequest(BaseModel):
    status: str


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


# ============================================================
# STUDENT ENDPOINTS
# ============================================================

@router.get("/student")
def get_my_tasks(current_user: dict = Depends(require_role("STUDENT"))):
    tasks = get_student_tasks(current_user["_id"])
    return {
        "tasks": [serialize_doc(t) for t in tasks],
        "total": len(tasks),
    }


@router.patch("/student/{task_id}/status")
def update_my_task_status(
    task_id: str,
    request: UpdateTaskStatusRequest,
    current_user: dict = Depends(require_role("STUDENT")),
):
    try:
        t_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID.")

    new_status = request.status.strip().upper()
    if new_status not in {"PENDING", "IN_PROGRESS", "COMPLETED"}:
        raise HTTPException(
            status_code=400,
            detail="Status must be PENDING, IN_PROGRESS, or COMPLETED.",
        )

    task = get_task_by_id(t_id)
    if task is None or str(task.get("student_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=404, detail="Task not found.")

    updated = update_task_status(t_id, current_user["_id"], new_status)

    # Notify mentor if completed
    if new_status == "COMPLETED" and task.get("mentor_id"):
        create_notification(
            user_id=task["mentor_id"],
            title="Task Completed",
            message=f"{current_user.get('name', 'A student')} marked task '{task.get('title')}' as COMPLETED.",
            type="TASK",
            link="/mentor/tasks",
        )

    return {"message": "Task status updated.", "task": serialize_doc(updated)}


# ============================================================
# MENTOR ENDPOINTS
# ============================================================

@router.get("/mentor")
def get_my_created_tasks(current_user: dict = Depends(require_role("MENTOR"))):
    tasks = get_mentor_tasks(current_user["_id"])
    return {
        "tasks": [serialize_doc(t) for t in tasks],
        "total": len(tasks),
    }


@router.post("/mentor", status_code=status.HTTP_201_CREATED)
def create_mentee_task(
    request: CreateTaskRequest,
    current_user: dict = Depends(require_role("MENTOR")),
):
    if not request.title.strip():
        raise HTTPException(status_code=400, detail="Task title is required.")

    created_tasks = []

    if request.broadcast_to_all:
        assigned_students = get_mentor_students(current_user["_id"])
        if not assigned_students:
            raise HTTPException(
                status_code=400,
                detail="You have no assigned mentees to assign tasks to.",
            )
        for s in assigned_students:
            t = create_task(
                mentor_id=current_user["_id"],
                student_id=s.get("user_id") or s.get("_id"),
                title=request.title,
                description=request.description,
                priority=request.priority or "MEDIUM",
                due_date=request.due_date,
            )
            create_notification(
                user_id=s.get("user_id") or s.get("_id"),
                title="New Task Assigned",
                message=f"Mentor assigned task: {request.title}",
                type="TASK",
                link="/student/tasks",
            )
            created_tasks.append(t)
    else:
        if not request.student_id:
            raise HTTPException(
                status_code=400,
                detail="student_id is required when not broadcasting.",
            )
        # CRITICAL: Validate mentor-student isolation
        assigned_student = get_assigned_student(current_user["_id"], request.student_id)
        if assigned_student is None:
            raise HTTPException(
                status_code=403,
                detail="Student not assigned to you. Mentor isolation enforced.",
            )

        target_student_id = assigned_student.get("user_id") or assigned_student.get("_id")
        t = create_task(
            mentor_id=current_user["_id"],
            student_id=target_student_id,
            title=request.title,
            description=request.description,
            priority=request.priority or "MEDIUM",
            due_date=request.due_date,
        )
        create_notification(
            user_id=target_student_id,
            title="New Task Assigned",
            message=f"Mentor assigned task: {request.title}",
            type="TASK",
            link="/student/tasks",
        )
        created_tasks.append(t)

    return {
        "message": f"Successfully created {len(created_tasks)} task(s).",
        "tasks": [serialize_doc(item) for item in created_tasks],
    }


@router.delete("/mentor/{task_id}")
def remove_task(
    task_id: str,
    current_user: dict = Depends(require_role("MENTOR")),
):
    try:
        t_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID.")

    task = get_task_by_id(t_id)
    if task is None or str(task.get("mentor_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=404, detail="Task not found or not owned by you.")

    deleted = delete_task(t_id, current_user["_id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found.")

    return {"message": "Task deleted successfully."}
