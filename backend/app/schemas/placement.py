from typing import List, Optional

from pydantic import BaseModel, Field


# ============================================================
# PARAMETER 1
# CODING PROBLEMS SOLVED
# ============================================================

class CodingProblemsInput(BaseModel):
    approved_problems: int = Field(
        default=0,
        ge=0,
    )

    sql_problems: int = Field(
        default=0,
        ge=0,
    )


# ============================================================
# PARAMETER 2
# OPEN-SOURCE CONTRIBUTION
# ============================================================

class OpenSourceInput(BaseModel):
    merged_prs: int = Field(
        default=0,
        ge=0,
    )

    program_stage: int = Field(
        default=0,
        ge=0,
    )


# ============================================================
# PARAMETER 3
# COMPETITION ACHIEVEMENT
# ============================================================

class CompetitionAchievement(BaseModel):
    event_id: str

    stage: int = Field(
        ge=0,
    )


class CompetitionInput(BaseModel):
    achievements: List[CompetitionAchievement] = Field(
        default_factory=list
    )


# ============================================================
# PARAMETER 4
# CERTIFICATION ACHIEVEMENT
# ============================================================

class Certification(BaseModel):
    credential_id: str

    credential_type: str

    stage: int = Field(
        ge=0,
    )

    is_foundation: bool = False


class CertificationInput(BaseModel):
    certifications: List[Certification] = Field(
        default_factory=list
    )


# ============================================================
# PARAMETER 5
# COMPETITIVE PROGRAMMING RATING
# ============================================================

class CompetitiveProgrammingInput(BaseModel):
    rating_milestone: int = Field(
        default=0,
        ge=0,
        le=20,
    )


# ============================================================
# PARAMETER 6
# PROJECT / PRODUCT / PUBLICATION / PATENT
# ============================================================

class ProjectAchievement(BaseModel):
    project_id: str

    stage: int = Field(
        ge=0,
    )


class ProjectInput(BaseModel):
    achievements: List[ProjectAchievement] = Field(
        default_factory=list
    )


# ============================================================
# PARAMETER 7
# EXTERNAL APTITUDE + COMMUNICATION
# ============================================================

class AptitudeCommunicationInput(BaseModel):
    aptitude_percentile: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
    )

    communication_stage: int = Field(
        default=0,
        ge=0,
        le=5,
    )


# ============================================================
# PARAMETER 8
# MONTHLY CODING ASSESSMENT
# ============================================================

class MonthlyCodingAssessmentInput(BaseModel):
    semester: int = Field(
        default=1,
        ge=1,
        le=6,
    )

    raw_scores: List[float] = Field(
        default_factory=list
    )


# ============================================================
# PARAMETER 9
# GATE + OPTIONAL HIGHER STUDIES
# ============================================================

class GateInput(BaseModel):

    diagnostic_completed: bool = False

    ga_engineering_math_tests: int = Field(
        default=0,
        ge=0,
    )

    gate_tests_taken: int = Field(
        default=0,
        ge=0,
    )

    gate_test_average: float = Field(
        default=0,
        ge=0,
    )

    tests_at_or_above_55: int = Field(
        default=0,
        ge=0,
    )

    official_gate_stage: int = Field(
        default=0,
        ge=0,
    )

    optional_higher_studies_stage: int = Field(
        default=0,
        ge=0,
    )


# ============================================================
# PARAMETER 10
# INTERNSHIP / STARTUP / INDUSTRY / OFF-CAMPUS
# ============================================================

class CareerAchievement(BaseModel):
    achievement_id: str

    achievement_type: str

    group_id: str

    stage: int = Field(
        ge=0,
    )


class CareerAchievementInput(BaseModel):
    achievements: List[CareerAchievement] = Field(
        default_factory=list
    )


# ============================================================
# PARAMETER 11
# FOREIGN LANGUAGE
# ============================================================

class ForeignLanguageInput(BaseModel):

    language: Optional[str] = None

    level: int = Field(
        default=0,
        ge=0,
        le=15,
    )


# ============================================================
# PARAMETER 12
# HUNDRED DAYS TRAINING
# ============================================================

class HundredDaysTrainingInput(BaseModel):

    category: str = "NOT_SELECTED"


# ============================================================
# COMPLETE PLACEMENT INPUT
# ============================================================

class PlacementCalculationRequest(BaseModel):

    coding: CodingProblemsInput = Field(
        default_factory=CodingProblemsInput
    )

    open_source: OpenSourceInput = Field(
        default_factory=OpenSourceInput
    )

    competition: CompetitionInput = Field(
        default_factory=CompetitionInput
    )

    certification: CertificationInput = Field(
        default_factory=CertificationInput
    )

    competitive_programming: CompetitiveProgrammingInput = Field(
        default_factory=CompetitiveProgrammingInput
    )

    project: ProjectInput = Field(
        default_factory=ProjectInput
    )

    aptitude_communication: AptitudeCommunicationInput = Field(
        default_factory=AptitudeCommunicationInput
    )

    monthly_coding_assessment: MonthlyCodingAssessmentInput = Field(
        default_factory=MonthlyCodingAssessmentInput
    )

    gate: GateInput = Field(
        default_factory=GateInput
    )

    career_achievement: CareerAchievementInput = Field(
        default_factory=CareerAchievementInput
    )

    foreign_language: ForeignLanguageInput = Field(
        default_factory=ForeignLanguageInput
    )

    hundred_days_training: HundredDaysTrainingInput = Field(
        default_factory=HundredDaysTrainingInput
    )

    batch: str = "2024-28"


# ============================================================
# RESPONSE MODELS
# ============================================================

class ParameterScore(BaseModel):

    parameter_id: int

    name: str

    max_marks: int

    earned_marks: int

    details: List[str] = Field(
        default_factory=list
    )


class PlacementCondition(BaseModel):

    level: str

    required_score: int

    coding_assessment_required: int

    gate_required: int

    score_satisfied: bool

    coding_assessment_satisfied: bool

    gate_satisfied: bool

    conditions_satisfied: bool


class PlacementCalculationResponse(BaseModel):

    total_score: int

    maximum_score: int

    percentage: float

    current_level: str

    placement_category: str

    eligible: bool

    next_level: Optional[str] = None

    marks_needed: int = 0

    parameter_scores: List[ParameterScore]

    conditions: List[PlacementCondition]

    notes: List[str] = Field(
        default_factory=list
    )