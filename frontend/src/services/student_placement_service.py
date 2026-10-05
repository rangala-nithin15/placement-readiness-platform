from typing import Dict, Any, Optional

from bson import ObjectId

from app.repositories.student_repository import (
    get_student_profile,
)

from app.repositories.external_profile_repository import (
    get_student_external_profiles,
)

from app.schemas.placement import (
    PlacementCalculationRequest,
    CodingProblemsInput,
    OpenSourceInput,
    CompetitionInput,
    CertificationInput,
    CompetitiveProgrammingInput,
    ProjectInput,
    AptitudeCommunicationInput,
    MonthlyCodingAssessmentInput,
    GateInput,
    CareerAchievementInput,
    ForeignLanguageInput,
    HundredDaysTrainingInput,
)

from app.services.placement_engine import (
    calculate_placement,
)


def get_github_profile(
    external_profiles: list,
) -> Optional[dict]:

    for profile in external_profiles:

        if profile.get("platform") == "github":
            return profile

    return None


def build_student_placement_request(
    user_id: ObjectId,
) -> PlacementCalculationRequest:

    student = get_student_profile(
        user_id
    )

    if student is None:

        raise ValueError(
            "Student profile not found."
        )

    external_profiles = (
        get_student_external_profiles(
            user_id
        )
    )

    github_profile = get_github_profile(
        external_profiles
    )

    github_stats = {}

    if github_profile is not None:

        github_stats = github_profile.get(
            "stats",
            {}
        )

    # --------------------------------------------------
    # PARAMETER 1
    # CODING PROBLEMS
    #
    # Temporary values until student achievement
    # data is connected to the placement system.
    # --------------------------------------------------

    coding_problems = CodingProblemsInput(
        approved_problems=0,
        sql_problems=0,
    )

    # --------------------------------------------------
    # PARAMETER 2
    # OPEN SOURCE
    #
    # GitHub data can be connected here when the
    # GitHub integration is enabled.
    # --------------------------------------------------

    open_source = OpenSourceInput(
        merged_prs=github_stats.get(
            "merged_pull_requests",
            0
        ),
        program_stage=0,
    )

    # --------------------------------------------------
    # PARAMETER 3
    # COMPETITION ACHIEVEMENT
    # --------------------------------------------------

    competition = CompetitionInput(
        achievements=[],
    )

    # --------------------------------------------------
    # PARAMETER 4
    # CERTIFICATION ACHIEVEMENT
    # --------------------------------------------------

    certification = CertificationInput(
        certifications=[],
    )

    # --------------------------------------------------
    # PARAMETER 5
    # COMPETITIVE PROGRAMMING
    # --------------------------------------------------

    competitive_programming = (
        CompetitiveProgrammingInput(
            rating_milestone=0,
        )
    )

    # --------------------------------------------------
    # PARAMETER 6
    # PROJECT / PRODUCT / PUBLICATION / PATENT
    # --------------------------------------------------

    project = ProjectInput(
        achievements=[],
    )

    # --------------------------------------------------
    # PARAMETER 7
    # APTITUDE / COMMUNICATION
    # --------------------------------------------------

    aptitude_communication = (
        AptitudeCommunicationInput(
            aptitude_percentile=0,
            communication_stage=0,
        )
    )

    # --------------------------------------------------
    # PARAMETER 8
    # MONTHLY CODING ASSESSMENT
    # --------------------------------------------------

    monthly_assessment = (
        MonthlyCodingAssessmentInput(
            semester=1,
            raw_scores=[],
        )
    )

    # --------------------------------------------------
    # PARAMETER 9
    # GATE / HIGHER STUDIES
    # --------------------------------------------------

    gate = GateInput(
        diagnostic_completed=False,
        ga_engineering_math_tests=0,
        gate_tests_taken=0,
        gate_test_average=0,
        tests_at_or_above_55=0,
        official_gate_stage=0,
        optional_higher_studies_stage=0,
    )

    # --------------------------------------------------
    # PARAMETER 10
    # INTERNSHIP / STARTUP / INDUSTRY /
    # OFF-CAMPUS ACHIEVEMENT
    # --------------------------------------------------

    career_achievement = (
        CareerAchievementInput(
            achievements=[],
        )
    )

    # --------------------------------------------------
    # PARAMETER 11
    # FOREIGN LANGUAGE
    # --------------------------------------------------

    foreign_language = ForeignLanguageInput(
        language="",
        level=0,
    )

    # --------------------------------------------------
    # PARAMETER 12
    # HUNDRED DAYS TRAINING
    # --------------------------------------------------

    hundred_days_training = (
        HundredDaysTrainingInput(
            category="",
        )
    )

    # --------------------------------------------------
    # BUILD FINAL REQUEST
    # --------------------------------------------------

    request = PlacementCalculationRequest(

        batch=student.get(
            "batch"
        ),

        coding_problems=(
            coding_problems
        ),

        open_source=(
            open_source
        ),

        competition=(
            competition
        ),

        certification=(
            certification
        ),

        competitive_programming=(
            competitive_programming
        ),

        project=(
            project
        ),

        aptitude_communication=(
            aptitude_communication
        ),

        monthly_coding_assessment=(
            monthly_assessment
        ),

        gate=(
            gate
        ),

        career_achievement=(
            career_achievement
        ),

        foreign_language=(
            foreign_language
        ),

        hundred_days_training=(
            hundred_days_training
        ),
    )

    return request


def calculate_student_placement(
    user_id: ObjectId,
) -> Dict[str, Any]:

    request = build_student_placement_request(
        user_id
    )

    result = calculate_placement(
        request
    )

    return result