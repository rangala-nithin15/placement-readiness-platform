from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.core.security import require_role
from app.repositories.user_repository import (
    find_user_by_email,
    find_user_by_id,
    find_user_by_mentor_id,
    generate_mentor_id,
    create_user,
    list_users,
    update_user,
    get_users_collection,
)
from app.repositories.mentor_repository import (
    get_assignments_collection,
    get_students_collection,
    create_assignment,
)
from app.services.password_service import hash_password


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


class AdminCreateMentorRequest(BaseModel):
    name: str
    email: str
    password: str
    department: str
    batch: str
    mentor_id: Optional[str] = None


class AdminAssignStudentRequest(BaseModel):
    mentor_id: str
    student_id: str


def _serialize_id(doc: dict) -> dict:
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
    return doc


@router.get("/overview")
def get_admin_overview(
    current_user: dict = Depends(require_role("ADMIN")),
):
    users_col = get_users_collection()
    assignments_col = get_assignments_collection()

    total_students = users_col.count_documents({"role": "STUDENT"})
    total_mentors = users_col.count_documents({"role": "MENTOR"})
    total_assignments = assignments_col.count_documents({"is_active": True})

    # distinct departments
    departments = users_col.distinct("department")
    batches = users_col.distinct("batch")

    return {
        "total_students": total_students,
        "total_mentors": total_mentors,
        "total_assignments": total_assignments,
        "departments": [d for d in departments if d],
        "batches": [b for b in batches if b and b != "ALL"],
    }


@router.get("/students")
def list_students(
    department: Optional[str] = None,
    batch: Optional[str] = None,
    current_user: dict = Depends(require_role("ADMIN")),
):
    students = list_users(
        role="STUDENT",
        department=department,
        batch=batch,
        limit=500,
    )

    results = []
    assignments_col = get_assignments_collection()
    users_col = get_users_collection()

    for s in students:
        # find assigned mentor
        assignment = assignments_col.find_one({"student_id": s["_id"], "is_active": True})
        mentor_name = None
        mentor_code = None
        if assignment:
            mentor = users_col.find_one({"_id": assignment["mentor_id"]})
            if mentor:
                mentor_name = mentor.get("name")
                mentor_code = mentor.get("mentor_id")

        results.append({
            "id": str(s["_id"]),
            "name": s.get("name"),
            "email": s.get("email"),
            "register_number": s.get("register_number"),
            "department": s.get("department"),
            "batch": s.get("batch"),
            "is_active": s.get("is_active", True),
            "assigned_mentor_name": mentor_name,
            "assigned_mentor_id": mentor_code,
        })

    return {"students": results, "total": len(results)}


@router.get("/mentors")
def list_mentors(
    department: Optional[str] = None,
    current_user: dict = Depends(require_role("ADMIN")),
):
    mentors = list_users(
        role="MENTOR",
        department=department,
        limit=500,
    )

    assignments_col = get_assignments_collection()
    results = []

    for m in mentors:
        count = assignments_col.count_documents({"mentor_id": m["_id"], "is_active": True})
        results.append({
            "id": str(m["_id"]),
            "name": m.get("name"),
            "email": m.get("email"),
            "mentor_id": m.get("mentor_id"),
            "department": m.get("department"),
            "batch": m.get("batch"),
            "is_active": m.get("is_active", True),
            "is_approved": m.get("is_approved", True),
            "assigned_students_count": count,
        })

    return {"mentors": results, "total": len(results)}


@router.post("/mentors", status_code=status.HTTP_201_CREATED)
def create_mentor_by_admin(
    request: AdminCreateMentorRequest,
    current_user: dict = Depends(require_role("ADMIN")),
):
    email = request.email.lower().strip()
    department = request.department.strip().upper()

    if find_user_by_email(email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    if request.mentor_id and request.mentor_id.strip():
        mentor_code = request.mentor_id.strip().upper()
        if find_user_by_mentor_id(mentor_code) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Mentor ID '{mentor_code}' already exists.",
            )
    else:
        mentor_code = generate_mentor_id(department)

    user_document = {
        "name": request.name.strip(),
        "email": email,
        "password_hash": hash_password(request.password),
        "role": "MENTOR",
        "register_number": None,
        "mentor_id": mentor_code,
        "department": department,
        "batch": request.batch.strip(),
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    created = create_user(user_document)
    return {
        "message": "Mentor created successfully.",
        "mentor": {
            "id": str(created["_id"]),
            "name": created["name"],
            "email": created["email"],
            "mentor_id": created["mentor_id"],
            "department": created["department"],
            "batch": created["batch"],
        },
    }


@router.put("/mentors/{user_id}/status")
def toggle_mentor_status(
    user_id: str,
    current_user: dict = Depends(require_role("ADMIN")),
):
    user = find_user_by_id(user_id)
    if user is None or user.get("role") != "MENTOR":
        raise HTTPException(status_code=404, detail="Mentor not found.")

    new_status = not user.get("is_active", True)
    update_user(user["_id"], {"is_active": new_status})
    return {"message": "Mentor status updated.", "is_active": new_status}


@router.get("/assignments")
def list_assignments(
    current_user: dict = Depends(require_role("ADMIN")),
):
    assignments_col = get_assignments_collection()
    users_col = get_users_collection()
    assignments = list(assignments_col.find({"is_active": True}))

    results = []
    for a in assignments:
        mentor = users_col.find_one({"_id": a["mentor_id"]})
        student = users_col.find_one({"_id": a["student_id"]})
        results.append({
            "id": str(a["_id"]),
            "mentor_id": str(a["mentor_id"]),
            "mentor_name": mentor.get("name") if mentor else "Unknown",
            "mentor_code": mentor.get("mentor_id") if mentor else None,
            "student_id": str(a["student_id"]),
            "student_name": student.get("name") if student else "Unknown",
            "register_number": student.get("register_number") if student else None,
            "department": student.get("department") if student else None,
            "assigned_at": a.get("assigned_at").isoformat() if a.get("assigned_at") else None,
        })

    return {"assignments": results, "total": len(results)}


@router.post("/assignments", status_code=status.HTTP_201_CREATED)
def assign_student_admin(
    request: AdminAssignStudentRequest,
    current_user: dict = Depends(require_role("ADMIN")),
):
    try:
        mentor_oid = ObjectId(request.mentor_id)
        student_oid = ObjectId(request.student_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid mentor or student ID format.")

    mentor = find_user_by_id(mentor_oid)
    if not mentor or mentor.get("role") != "MENTOR":
        raise HTTPException(status_code=404, detail="Mentor not found.")

    student = find_user_by_id(student_oid)
    if not student or student.get("role") != "STUDENT":
        raise HTTPException(status_code=404, detail="Student not found.")

    assignments_col = get_assignments_collection()
    # Deactivate existing assignment for this student if any
    assignments_col.update_many(
        {"student_id": student_oid},
        {"$set": {"is_active": False}},
    )

    assignment = create_assignment(mentor_id=mentor_oid, student_id=student_oid)
    return {
        "message": "Student assigned to mentor successfully.",
        "assignment_id": str(assignment["_id"]),
    }


@router.delete("/assignments/{assignment_id}")
def remove_assignment(
    assignment_id: str,
    current_user: dict = Depends(require_role("ADMIN")),
):
    try:
        oid = ObjectId(assignment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID.")

    assignments_col = get_assignments_collection()
    result = assignments_col.update_one(
        {"_id": oid},
        {"$set": {"is_active": False}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    return {"message": "Assignment deactivated successfully."}
