import { apiRequest } from "./api";
import { getToken } from "./authStorage";

export type ParameterScore = {
  parameter_id: number;
  name: string;
  max_marks: number;
  earned_marks: number;
  details: string[];
};

export type PlacementCondition = {
  level: string;
  required_score: number;
  coding_assessment_required: number;
  gate_required: number;
  score_satisfied: boolean;
  coding_assessment_satisfied: boolean;
  gate_satisfied: boolean;
  conditions_satisfied: boolean;
};

export type PlacementReadiness = {
  total_score: number;
  maximum_score: number;
  percentage: number;
  current_level: string;
  placement_category: string;
  eligible: boolean;
  next_level: string;
  marks_needed: number;
  parameter_scores: ParameterScore[];
  conditions: PlacementCondition[];
  notes: string[];
};

function getAuthHeaders() {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Authentication token not found."
    );
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getMyPlacementReadiness() {
  return apiRequest<PlacementReadiness>(
    "/student/placement",
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
}