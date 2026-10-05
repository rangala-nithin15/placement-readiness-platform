from typing import List, Any

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

from app.repositories.external_profile_repository import (
    get_student_external_profiles,
)

from app.schemas.mentor import (
    AssignmentResponse,
    AssignStudentRequest,
    MentorStudentListResponse,
    MentorStudentResponse,
)

from app.services.student_placement_service import (
    calculate_student_placement,
)


router = APIRouter(
    prefix="/mentor",
    tags=["Mentor"],
)


# --------------------------------------------------
# SERIALIZE VALUES FOR JSON
# --------------------------------------------------

def serialize_value(
    value: Any,
):

    if isinstance(
        value,
        ObjectId,
    ):
        return str(value)

    if isinstance(
        value,
        dict,
    ):

        return {
            key: serialize_value(
                item
            )
            for key, item in value.items()
        }

    if isinstance(
        value,
        list,
    ):

        return [
            serialize_value(item)
            for item in value
        ]

    return value


# --------------------------------------------------
# STUDENT LIST RESPONSE
# --------------------------------------------------

def student_to_response(
    student: dict,
) -> MentorStudentResponse:

    return MentorStudentResponse(

        id=str(
            student["_id"]
        ),

        name=student.get(
            "name",
            "",
        ),

        email=student.get(
            "email",
            "",
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
            0,
        ),
    )


# --------------------------------------------------
# GET ALL ASSIGNED STUDENTS
# --------------------------------------------------

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


# --------------------------------------------------
# GET COMPLETE ASSIGNED STUDENT PROFILE
# --------------------------------------------------

@router.get(
    "/students/{student_id}",
)
def get_my_student_profile(

    student_id: str,

    current_user: dict = Depends(
        require_role("MENTOR")
    ),
):

    # ----------------------------------------------
    # VALIDATE STUDENT OBJECT ID
    # ----------------------------------------------

    try:

        student_object_id = ObjectId(
            student_id
        )

    except Exception:

        raise HTTPException(

            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),

            detail=(
                "Invalid student ID."
            ),
        )

    # ----------------------------------------------
    # IMPORTANT:
    # ONLY RETURN STUDENTS ASSIGNED TO THIS MENTOR
    # ----------------------------------------------

    student = get_assigned_student(

        mentor_id=current_user["_id"],

        student_id=student_object_id,
    )

    if student is None:

        raise HTTPException(

            status_code=(
                status.HTTP_404_NOT_FOUND
            ),

            detail=(
                "Student not found or "
                "student is not assigned to you."
            ),
        )

    # ----------------------------------------------
    # GET CONNECTED EXTERNAL PROFILES
    # ----------------------------------------------

    external_profiles = (
        get_student_external_profiles(
            student_object_id
        )
    )

    # ----------------------------------------------
    # CALCULATE PLACEMENT
    # ----------------------------------------------

    try:

        placement = (
            calculate_student_placement(
                student_object_id
            )
        )

    except Exception as error:

        # Do not make the entire student profile
        # unavailable if placement calculation fails.

        placement = {
            "total_score": 0,
            "maximum_marks": 250,
            "percentage": 0,
            "current_level": None,
            "current_category": None,
            "next_level": None,
            "marks_needed": 0,
            "eligibility": None,
            "parameter_results": [],
            "conditions": [],
            "error": str(error),
        }

    # ----------------------------------------------
    # STUDENT INFORMATION
    # ----------------------------------------------

    student_data = {

        "id": str(
            student["_id"]
        ),

        "name": student.get(
            "name",
            "",
        ),

        "email": student.get(
            "email",
            "",
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
            0,
        ),

        "skills": student.get(
            "skills",
            [],
        ),

        "career_interests": student.get(
            "career_interests",
            [],
        ),

        "profile_completion": student.get(
            "profile_completion",
            0,
        ),
    }

    # ----------------------------------------------
    # SERIALIZE EXTERNAL PROFILES
    # ----------------------------------------------

    serialized_profiles = []

    for profile in external_profiles:

        profile_data = {

            "id": str(
                profile["_id"]
            ),

            "student_id": str(
                profile["student_id"]
            ),

            "platform": profile.get(
                "platform",
                "",
            ),

            "username": profile.get(
                "username",
                "",
            ),

            "profile_url": profile.get(
                "profile_url",
                "",
            ),

            "verification_status": (
                profile.get(
                    "verification_status",
                    "PENDING",
                )
            ),

            "stats": profile.get(
                "stats",
                {},
            ),

            "last_verified_at": (
                profile.get(
                    "last_verified_at"
                )
            ),
        }

        serialized_profiles.append(
            serialize_value(
                profile_data
            )
        )

    # ----------------------------------------------
    # FINAL RESPONSE
    # ----------------------------------------------

    return {

        "student": student_data,

        "placement": serialize_value(
            placement
        ),

        "connected_profiles": (
            serialized_profiles
        ),
    }


# --------------------------------------------------
# ASSIGN STUDENT TO MENTOR
# --------------------------------------------------

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

    # ----------------------------------------------
    # VALIDATE STUDENT ID
    # ----------------------------------------------

    try:

        student_id = ObjectId(
            request.student_id
        )

    except Exception:

        raise HTTPException(

            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),

            detail=(
                "Invalid student ID."
            ),
        )

    # ----------------------------------------------
    # CHECK STUDENT EXISTS
    # ----------------------------------------------

    student = get_student_by_id(
        student_id
    )

    if student is None:

        raise HTTPException(

            status_code=(
                status.HTTP_404_NOT_FOUND
            ),

            detail=(
                "Student not found."
            ),
        )

    # ----------------------------------------------
    # CREATE ASSIGNMENT
    # ----------------------------------------------

    try:

        assignment = create_assignment(

            mentor_id=current_user["_id"],

            student_id=student_id,
        )

    except Exception as error:

        raise HTTPException(

            status_code=(
                status.HTTP_409_CONFLICT
            ),

            detail=(
                f"Unable to assign student: "
                f"{str(error)}"
            ),
        )

    # ----------------------------------------------
    # RESPONSE
    # ----------------------------------------------

    return AssignmentResponse(

        message=(
            "Student assigned successfully."
        ),

        mentor_id=str(
            current_user["_id"]
        ),

        student_id=str(
            assignment["student_id"]
        ),
    )