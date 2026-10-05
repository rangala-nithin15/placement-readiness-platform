from typing import Dict, List, Tuple

from app.schemas.placement import (
    PlacementCalculationRequest,
    ParameterScore,
    PlacementCondition,
)


# ============================================================
# OFFICIAL PARAMETER DEFINITIONS
# ============================================================

PARAMETERS = [
    {
        "id": 1,
        "name": "Coding Problems Solved",
        "max_marks": 25,
    },
    {
        "id": 2,
        "name": "Open-Source Contribution",
        "max_marks": 20,
    },
    {
        "id": 3,
        "name": "Competition Achievement",
        "max_marks": 20,
    },
    {
        "id": 4,
        "name": "Certification Achievement",
        "max_marks": 20,
    },
    {
        "id": 5,
        "name": "Competitive Programming Rating",
        "max_marks": 20,
    },
    {
        "id": 6,
        "name": "Project/Product, Publication & Patent Achievement",
        "max_marks": 30,
    },
    {
        "id": 7,
        "name": "External Aptitude, Communication",
        "max_marks": 20,
    },
    {
        "id": 8,
        "name": "Monthly Coding Assessment",
        "max_marks": 20,
    },
    {
        "id": 9,
        "name": "GATE & Optional Higher-Studies Examinations",
        "max_marks": 25,
    },
    {
        "id": 10,
        "name": "Internship, Startup, Industry & Off-Campus Achievement",
        "max_marks": 20,
    },
    {
        "id": 11,
        "name": "Foreign Language Proficiency Certification",
        "max_marks": 15,
    },
    {
        "id": 12,
        "name": "Hundred Days Training Programme",
        "max_marks": 15,
    },
]


# ============================================================
# PARAMETER 1
# CODING PROBLEMS
# ============================================================

def calculate_coding_marks(
    approved_problems: int,
    sql_problems: int,
) -> Tuple[int, List[str]]:

    milestones = [
        (1000, 75, 25),
        (750, 60, 20),
        (550, 45, 15),
        (350, 30, 10),
        (200, 20, 5),
    ]

    for problems, required_sql, marks in milestones:

        if (
            approved_problems >= problems
            and sql_problems >= required_sql
        ):
            return marks, [
                "{} approved problems and {} SQL problems requirement achieved.".format(
                    problems,
                    required_sql,
                )
            ]

    return 0, [
        "No Coding Problems milestone achieved."
    ]


# ============================================================
# PARAMETER 2
# OPEN SOURCE
# ============================================================

def calculate_open_source_marks(
    merged_prs: int,
    program_stage: int,
) -> Tuple[int, List[str]]:

    marks = 0
    details = []

    if merged_prs >= 5:
        marks = 15
        details.append(
            "5 or more merged PRs."
        )

    elif merged_prs >= 3:
        marks = 10
        details.append(
            "3 merged PRs."
        )

    elif merged_prs >= 1:
        marks = 5
        details.append(
            "1 PR merged by an external maintainer."
        )

    if program_stage >= 20:
        marks = max(
            marks,
            20,
        )

        details.append(
            "Recognised contributor/maintainer status and successful programme completion."
        )

    elif program_stage >= 17:
        marks = max(
            marks,
            17,
        )

        details.append(
            "Selected contributor in an approved open-source programme."
        )

    if marks == 0:
        details.append(
            "No Open-Source milestone achieved."
        )

    return min(marks, 20), details


# ============================================================
# PARAMETER 3
# COMPETITION
# ============================================================

COMPETITION_STAGE_MARKS = {
    2: 2,
    4: 4,
    6: 6,
    10: 10,
    15: 15,
    20: 20,
}


def calculate_competition_marks(
    achievements,
) -> Tuple[int, List[str]]:

    event_highest: Dict[str, int] = {}

    for achievement in achievements:

        current_stage = event_highest.get(
            achievement.event_id,
            0,
        )

        event_highest[
            achievement.event_id
        ] = max(
            current_stage,
            achievement.stage,
        )

    total = 0
    details = []

    for event_id, stage in event_highest.items():

        event_marks = COMPETITION_STAGE_MARKS.get(
            stage,
            0,
        )

        total += event_marks

        if event_marks > 0:
            details.append(
                "Event {} achieved {} marks.".format(
                    event_id,
                    event_marks,
                )
            )

    total = min(
        total,
        20,
    )

    return total, details


# ============================================================
# PARAMETER 4
# CERTIFICATIONS
# ============================================================

ACADEMIC_CERTIFICATION_MARKS = {
    3: 3,
    5: 5,
    10: 10,
    15: 15,
}


INDUSTRY_CERTIFICATION_MARKS = {
    5: 5,
    10: 10,
    15: 15,
}


def calculate_certification_marks(
    certifications,
) -> Tuple[int, List[str]]:

    academic_total = 0
    industry_total = 0
    foundation_total = 0

    details = []

    for certification in certifications:

        credential_type = (
            certification.credential_type
            .strip()
            .lower()
        )

        if credential_type == "academic":

            marks = ACADEMIC_CERTIFICATION_MARKS.get(
                certification.stage,
                0,
            )

            academic_total += marks

        elif credential_type == "industry":

            marks = INDUSTRY_CERTIFICATION_MARKS.get(
                certification.stage,
                0,
            )

            if certification.is_foundation:

                foundation_total += marks

            else:

                industry_total += marks

        else:

            marks = 0

        if marks > 0:

            details.append(
                "{} certification contributed {} marks.".format(
                    certification.credential_id,
                    marks,
                )
            )

    foundation_total = min(
        foundation_total,
        10,
    )

    total = (
        academic_total
        + industry_total
        + foundation_total
    )

    total = min(
        total,
        20,
    )

    return total, details


# ============================================================
# PARAMETER 5
# COMPETITIVE PROGRAMMING RATING
# ============================================================

def calculate_competitive_programming_marks(
    rating_milestone: int,
) -> Tuple[int, List[str]]:

    allowed = {
        5: 5,
        10: 10,
        15: 15,
        20: 20,
    }

    marks = allowed.get(
        rating_milestone,
        0,
    )

    if marks == 0:

        return 0, [
            "No Competitive Programming rating milestone achieved."
        ]

    return marks, [
        "Competitive Programming rating milestone: {} marks.".format(
            marks
        )
    ]


# ============================================================
# PARAMETER 6
# PROJECT / PUBLICATION / PATENT
# ============================================================

PROJECT_STAGE_MARKS = {
    3: 3,
    5: 5,
    10: 10,
    15: 15,
    20: 20,
    30: 30,
}


def calculate_project_marks(
    achievements,
) -> Tuple[int, List[str]]:

    project_highest: Dict[str, int] = {}

    for achievement in achievements:

        current_stage = project_highest.get(
            achievement.project_id,
            0,
        )

        project_highest[
            achievement.project_id
        ] = max(
            current_stage,
            achievement.stage,
        )

    total = 0
    details = []

    for project_id, stage in project_highest.items():

        marks = PROJECT_STAGE_MARKS.get(
            stage,
            0,
        )

        total += marks

        if marks > 0:

            details.append(
                "Project {} contributed {} marks.".format(
                    project_id,
                    marks,
                )
            )

    total = min(
        total,
        30,
    )

    return total, details


# ============================================================
# PARAMETER 7
# APTITUDE + COMMUNICATION
# ============================================================

def calculate_aptitude_marks(
    percentile,
) -> int:

    if percentile is None:
        return 0

    if percentile >= 90:
        return 15

    if percentile >= 80:
        return 9

    if percentile >= 70:
        return 6

    if percentile >= 60:
        return 3

    return 0


def calculate_communication_marks(
    stage: int,
) -> int:

    if stage in (3, 5):
        return stage

    return 0


def calculate_aptitude_communication_marks(
    aptitude_percentile,
    communication_stage,
) -> Tuple[int, List[str]]:

    aptitude_marks = calculate_aptitude_marks(
        aptitude_percentile
    )

    communication_marks = (
        calculate_communication_marks(
            communication_stage
        )
    )

    total = min(
        aptitude_marks
        + communication_marks,
        20,
    )

    details = []

    if aptitude_marks > 0:

        details.append(
            "Aptitude contributed {} marks.".format(
                aptitude_marks
            )
        )

    if communication_marks > 0:

        details.append(
            "Communication contributed {} marks.".format(
                communication_marks
            )
        )

    return total, details


# ============================================================
# PARAMETER 8
# MONTHLY CODING ASSESSMENT
# ============================================================

EXPECTED_ASSESSMENTS = {
    1: 3,
    2: 6,
    3: 9,
    4: 12,
    5: 15,
    6: 18,
}


def calculate_monthly_assessment_marks(
    semester: int,
    raw_scores: List[float],
) -> Tuple[int, List[str]]:

    required_count = EXPECTED_ASSESSMENTS.get(
        semester,
        3,
    )

    if len(raw_scores) < required_count:

        return 0, [
            "Not enough assessment scores for the selected semester."
        ]

    scores = raw_scores[:required_count]

    average = sum(scores) / len(scores)

    if average >= 80:
        marks = 20

    elif average >= 70:
        marks = 15

    elif average >= 60:
        marks = 10

    elif average >= 50:
        marks = 5

    else:
        marks = 0

    return marks, [
        "Semester {} cumulative average: {:.2f}".format(
            semester,
            average,
        )
    ]


# ============================================================
# PARAMETER 9
# GATE
# ============================================================

def calculate_gate_marks(
    gate,
) -> Tuple[int, List[str], int]:

    diagnostic_marks = 0
    official_marks = 0

    details = []

    if (
        gate.diagnostic_completed
        and gate.ga_engineering_math_tests >= 3
    ):

        diagnostic_marks = 3

        details.append(
            "Approved GATE diagnostic and required GA/Engineering Mathematics tests completed."
        )

    if (
        gate.gate_tests_taken >= 5
        and gate.gate_test_average >= 40
    ):

        diagnostic_marks = max(
            diagnostic_marks,
            5,
        )

        details.append(
            "At least 5 GATE tests with 40+ average."
        )

    if (
        gate.gate_tests_taken >= 10
        and gate.tests_at_or_above_55 >= 3
    ):

        diagnostic_marks = max(
            diagnostic_marks,
            15,
        )

        details.append(
            "At least 10 GATE tests including 3 with 55+."
        )

    official_mapping = {
        15: 15,
        20: 20,
        25: 25,
    }

    official_marks = official_mapping.get(
        gate.official_gate_stage,
        0,
    )

    if official_marks > 0:

        details.append(
            "Official GATE stage contributed {} marks.".format(
                official_marks
            )
        )

    core_marks = max(
        diagnostic_marks,
        official_marks,
    )

    optional_marks = 0

    if core_marks >= 5:

        if gate.optional_higher_studies_stage in (3, 5):

            optional_marks = (
                gate.optional_higher_studies_stage
            )

            details.append(
                "Optional higher-studies examination contributed {} marks.".format(
                    optional_marks
                )
            )

    total = min(
        core_marks + optional_marks,
        25,
    )

    return total, details, core_marks


# ============================================================
# PARAMETER 10
# INTERNSHIP / STARTUP / INDUSTRY
# ============================================================

CAREER_STAGE_MARKS = {
    "recruitment": {
        2: 2,
        4: 4,
        6: 6,
    },
    "internship": {
        10: 10,
        15: 15,
    },
    "startup": {
        3: 3,
        5: 5,
        8: 8,
    },
    "founder": {
        10: 10,
        15: 15,
        20: 20,
    },
}


def calculate_career_marks(
    achievements,
) -> Tuple[int, List[str]]:

    grouped: Dict[Tuple[str, str], int] = {}

    for achievement in achievements:

        key = (
            achievement.achievement_type
            .strip()
            .lower(),
            achievement.group_id,
        )

        current_stage = grouped.get(
            key,
            0,
        )

        grouped[key] = max(
            current_stage,
            achievement.stage,
        )

    total = 0
    details = []

    for key, stage in grouped.items():

        achievement_type = key[0]

        stage_map = CAREER_STAGE_MARKS.get(
            achievement_type,
            {},
        )

        marks = stage_map.get(
            stage,
            0,
        )

        total += marks

        if marks > 0:

            details.append(
                "{} {} contributed {} marks.".format(
                    achievement_type,
                    key[1],
                    marks,
                )
            )

    total = min(
        total,
        20,
    )

    return total, details


# ============================================================
# PARAMETER 11
# FOREIGN LANGUAGE
# ============================================================

def calculate_foreign_language_marks(
    level: int,
) -> Tuple[int, List[str]]:

    allowed = {
        7: 7,
        12: 12,
        15: 15,
    }

    marks = allowed.get(
        level,
        0,
    )

    if marks == 0:

        return 0, [
            "No verified foreign-language milestone achieved."
        ]

    return marks, [
        "Verified foreign-language level contributed {} marks.".format(
            marks
        )
    ]


# ============================================================
# PARAMETER 12
# HUNDRED DAYS TRAINING
# ============================================================

TRAINING_MARKS = {
    "PEP": 5,
    "HOPE_NON_ELITE": 10,
    "HOPE_ELITE": 15,
    "NOT_SELECTED": 0,
}


def calculate_training_marks(
    category: str,
) -> Tuple[int, List[str]]:

    normalized = (
        category
        .strip()
        .upper()
    )

    marks = TRAINING_MARKS.get(
        normalized,
        0,
    )

    if marks == 0:

        return 0, [
            "Student is not selected for an applicable Hundred Days Training category."
        ]

    return marks, [
        "{} training category contributed {} marks.".format(
            normalized,
            marks,
        )
    ]


# ============================================================
# PLACEMENT LEVEL CONDITIONS
# ============================================================

LEVELS = [
    {
        "level": "ELITE",
        "required_score": 200,
        "category": "Above ₹20 LPA Companies",
        "coding_assessment_required": 15,
        "gate_required": 15,
    },
    {
        "level": "LEVEL 3",
        "required_score": 160,
        "category": "Up to ₹20 LPA Companies",
        "coding_assessment_required": 15,
        "gate_required": 15,
    },
    {
        "level": "LEVEL 2",
        "required_score": 120,
        "category": "Up to ₹10 LPA Companies",
        "coding_assessment_required": 10,
        "gate_required": 10,
    },
    {
        "level": "LEVEL 1",
        "required_score": 80,
        "category": "Up to ₹5 LPA Companies",
        "coding_assessment_required": 5,
        "gate_required": 5,
    },
]


def build_conditions(
    total_score: int,
    monthly_assessment_marks: int,
    gate_core_marks: int,
) -> List[PlacementCondition]:

    conditions = []

    for level in LEVELS:

        score_satisfied = (
            total_score
            >= level["required_score"]
        )

        coding_satisfied = (
            monthly_assessment_marks
            >= level["coding_assessment_required"]
        )

        gate_satisfied = (
            gate_core_marks
            >= level["gate_required"]
        )

        conditions_satisfied = (
            score_satisfied
            and coding_satisfied
            and gate_satisfied
        )

        conditions.append(
            PlacementCondition(
                level=level["level"],
                required_score=level["required_score"],
                coding_assessment_required=level[
                    "coding_assessment_required"
                ],
                gate_required=level[
                    "gate_required"
                ],
                score_satisfied=score_satisfied,
                coding_assessment_satisfied=coding_satisfied,
                gate_satisfied=gate_satisfied,
                conditions_satisfied=conditions_satisfied,
            )
        )

    return conditions


# ============================================================
# MAIN ENGINE
# ============================================================

def calculate_placement(
    request: PlacementCalculationRequest,
):

    parameter_scores = []

    # --------------------------------------------------------
    # PARAMETER 1
    # --------------------------------------------------------

    marks, details = calculate_coding_marks(
        request.coding.approved_problems,
        request.coding.sql_problems,
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=1,
            name=PARAMETERS[0]["name"],
            max_marks=25,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 2
    # --------------------------------------------------------

    marks, details = calculate_open_source_marks(
        request.open_source.merged_prs,
        request.open_source.program_stage,
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=2,
            name=PARAMETERS[1]["name"],
            max_marks=20,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 3
    # --------------------------------------------------------

    marks, details = calculate_competition_marks(
        request.competition.achievements
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=3,
            name=PARAMETERS[2]["name"],
            max_marks=20,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 4
    # --------------------------------------------------------

    marks, details = calculate_certification_marks(
        request.certification.certifications
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=4,
            name=PARAMETERS[3]["name"],
            max_marks=20,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 5
    # --------------------------------------------------------

    marks, details = calculate_competitive_programming_marks(
        request.competitive_programming.rating_milestone
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=5,
            name=PARAMETERS[4]["name"],
            max_marks=20,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 6
    # --------------------------------------------------------

    marks, details = calculate_project_marks(
        request.project.achievements
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=6,
            name=PARAMETERS[5]["name"],
            max_marks=30,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 7
    # --------------------------------------------------------

    marks, details = (
        calculate_aptitude_communication_marks(
            request.aptitude_communication.aptitude_percentile,
            request.aptitude_communication.communication_stage,
        )
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=7,
            name=PARAMETERS[6]["name"],
            max_marks=20,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 8
    # --------------------------------------------------------

    monthly_marks, monthly_details = (
        calculate_monthly_assessment_marks(
            request.monthly_coding_assessment.semester,
            request.monthly_coding_assessment.raw_scores,
        )
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=8,
            name=PARAMETERS[7]["name"],
            max_marks=20,
            earned_marks=monthly_marks,
            details=monthly_details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 9
    # --------------------------------------------------------

    gate_marks, gate_details, gate_core_marks = (
        calculate_gate_marks(
            request.gate
        )
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=9,
            name=PARAMETERS[8]["name"],
            max_marks=25,
            earned_marks=gate_marks,
            details=gate_details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 10
    # --------------------------------------------------------

    marks, details = calculate_career_marks(
        request.career_achievement.achievements
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=10,
            name=PARAMETERS[9]["name"],
            max_marks=20,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 11
    # --------------------------------------------------------

    marks, details = calculate_foreign_language_marks(
        request.foreign_language.level
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=11,
            name=PARAMETERS[10]["name"],
            max_marks=15,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # PARAMETER 12
    # --------------------------------------------------------

    marks, details = calculate_training_marks(
        request.hundred_days_training.category
    )

    parameter_scores.append(
        ParameterScore(
            parameter_id=12,
            name=PARAMETERS[11]["name"],
            max_marks=15,
            earned_marks=marks,
            details=details,
        )
    )

    # --------------------------------------------------------
    # TOTAL
    # --------------------------------------------------------

    total_score = sum(
        parameter.earned_marks
        for parameter in parameter_scores
    )

    maximum_score = 250

    percentage = (
        total_score
        / maximum_score
    ) * 100

    # --------------------------------------------------------
    # CONDITIONS
    # --------------------------------------------------------

    conditions = build_conditions(
        total_score=total_score,
        monthly_assessment_marks=monthly_marks,
        gate_core_marks=gate_core_marks,
    )

    # --------------------------------------------------------
    # DETERMINE HIGHEST ELIGIBLE LEVEL
    # --------------------------------------------------------

    current_level = "NOT ELIGIBLE"
    placement_category = "Not Eligible for Placement"
    eligible = False

    for level, condition in zip(
        LEVELS,
        conditions,
    ):

        if condition.conditions_satisfied:

            current_level = level["level"]
            placement_category = level["category"]
            eligible = True

            break

    # --------------------------------------------------------
    # NEXT LEVEL
    # --------------------------------------------------------

    next_level = None
    marks_needed = 0

    level_order = [
        "LEVEL 1",
        "LEVEL 2",
        "LEVEL 3",
        "ELITE",
    ]

    if current_level == "NOT ELIGIBLE":

        next_level = "LEVEL 1"

        marks_needed = max(
            0,
            80 - total_score,
        )

    else:

        current_index = level_order.index(
            current_level
        )

        if current_index < len(level_order) - 1:

            next_level = level_order[
                current_index + 1
            ]

            next_level_data = next(
                item
                for item in LEVELS
                if item["level"] == next_level
            )

            marks_needed = max(
                0,
                next_level_data["required_score"]
                - total_score,
            )

    # --------------------------------------------------------
    # NOTES
    # --------------------------------------------------------

    notes = [
        "Official placement eligibility is determined by deterministic backend rules.",
        "AI is not used to calculate the official placement score.",
        "The uploaded framework refers to separate Annexures for detailed approved platforms/events/equivalences.",
        "Parameter 12 cannot replace the Coding Assessment or GATE requirements.",
    ]

    return {
        "total_score": total_score,
        "maximum_score": maximum_score,
        "percentage": round(
            percentage,
            2,
        ),
        "current_level": current_level,
        "placement_category": placement_category,
        "eligible": eligible,
        "next_level": next_level,
        "marks_needed": marks_needed,
        "parameter_scores": parameter_scores,
        "conditions": conditions,
        "notes": notes,
    }