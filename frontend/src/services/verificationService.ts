import { apiRequest } from "./api";
import { getToken } from "./authStorage";

export type VerificationRequestItem = {
  id: string;
  student_id: string;
  external_profile_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_note?: string | null;
};

export type MentorVerificationItem = {
  request: VerificationRequestItem;
  student: {
    id: string;
    name: string;
    email: string;
    register_number: string;
    department?: string;
    batch?: string;
  };
  profile: {
    id: string;
    platform: string;
    username: string;
    profile_url: string;
    verification_status: string;
    stats?: Record<string, unknown>;
  };
};

function getAuthHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getStudentVerificationRequests(): Promise<{
  requests: VerificationRequestItem[];
  total: number;
}> {
  return apiRequest("/verification/student", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function requestVerification(
  externalProfileId: string
): Promise<{ message: string; request: VerificationRequestItem }> {
  return apiRequest("/verification/student", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ external_profile_id: externalProfileId }),
  });
}

export async function getMentorVerificationRequests(): Promise<{
  requests: MentorVerificationItem[];
  total: number;
}> {
  return apiRequest("/verification/mentor", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function reviewVerificationRequest(
  requestId: string,
  action: "APPROVE" | "REJECT",
  reviewNote?: string
): Promise<{ message: string; request: VerificationRequestItem }> {
  return apiRequest(`/verification/mentor/${requestId}/review`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      action,
      review_note: reviewNote || "",
    }),
  });
}
