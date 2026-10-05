from typing import List

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.security import require_role

from app.repositories.mentor_repository import (
    create_assignment,
    get_assigned_student,
    get_mentor_students,
    get_student_by_id,
)

from app.schemas.mentor import (
    AssignmentResponse,
    AssignStudentRequest,
    MentorStudentListResponse,
    MentorStudentResponse,
)


router = APIRouter(
    prefix="/mentor",
    tags=["Mentor"],
)


def student_to_response(
    student: dict,
) -> MentorStudentResponse:

    return MentorStudentResponse(

        id=str(
            student["_id"]
        ),

        name=student.get(
            "name",
            ""
        ),

        email=student.get(
            "email",
            ""
        ),

        register_number=student.get(
            "register_number"
        ),

        department=student.get(
            "department"
        ),

        batch=student.get(
            "batch"
        ),

        profile_completion=student.get(
            "profile_completion",
            0
        ),

    )


@router.get(
    "/students",
    response_model=MentorStudentListResponse,
)
def get_my_students(
    current_user: dict = Depends(
        require_role("MENTOR")
    ),
):

    students = get_mentor_students(
        current_user["_id"]
    )

    student_responses: List[
        MentorStudentResponse
    ] = []

    for student in students:

        student_responses.append(
            student_to_response(
                student
            )
        )

    return MentorStudentListResponse(

        students=student_responses,

        total=len(
            student_responses
        ),

    )


@router.get(
    "/students/{student_id}",
)
def get_my_student_profile(
    student_id: str,

    current_user: dict = Depends(
        require_role("MENTOR")
    ),
):

    try:

        student_object_id = ObjectId(
            student_id
        )

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid student ID.",
        )

    student = get_assigned_student(
        mentor_id=current_user["_id"],
        student_id=student_object_id,
    )

    if student is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Student not found or "
                "student is not assigned to you."
            ),
        )

    return {
        "id": str(
            student["_id"]
        ),

        "name": student.get(
            "name",
            ""
        ),

        "email": student.get(
            "email",
            ""
        ),

        "register_number": student.get(
            "register_number"
        ),

        "department": student.get(
            "department"
        ),

        "batch": student.get(
            "batch"
        ),

        "phone": student.get(
            "phone"
        ),

        "location": student.get(
            "location"
        ),

        "linkedin_url": student.get(
            "linkedin_url"
        ),

        "cgpa": student.get(
            "cgpa"
        ),

        "tenth_percentage": student.get(
            "tenth_percentage"
        ),

        "twelfth_percentage": student.get(
            "twelfth_percentage"
        ),

        "backlogs": student.get(
            "backlogs",
            0
        ),

        "skills": student.get(
            "skills",
            []
        ),

        "career_interests": student.get(
            "career_interests",
            []
        ),

        "profile_completion": student.get(
            "profile_completion",
            0
        ),
    }


@router.post(
    "/students/assign",
    response_model=AssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_student(
    request: AssignStudentRequest,

    current_user: dict = Depends(
        require_role("MENTOR")
    ),
):

    try:

        student_id = ObjectId(
            request.student_id
        )

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid student ID.",
        )

    student = get_student_by_id(
        student_id
    )

    if student is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    assignment = create_assignment(

        mentor_id=current_user["_id"],

        student_id=student_id,

    )

    return AssignmentResponse(

        message="Student assigned successfully.",

        mentor_id=str(
            current_user["_id"]
        ),

        student_id=str(
            assignment["student_id"]
        ),

    )