import { apiRequest } from "./api";
import { getToken } from "./authStorage";

export type Task = {
  id: string;
  student_id: string;
  mentor_id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  due_date?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
};

export type CreateTaskPayload = {
  student_id?: string;
  broadcast_to_all?: boolean;
  title: string;
  description: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  due_date?: string | null;
};

function getAuthHeaders() {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  return { Authorization: `Bearer ${token}` };
}

export async function getStudentTasks(): Promise<{ tasks: Task[]; total: number }> {
  return apiRequest("/tasks/student", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function updateStudentTaskStatus(
  taskId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
): Promise<{ message: string; task: Task }> {
  return apiRequest(`/tasks/student/${taskId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function getMentorTasks(): Promise<{ tasks: Task[]; total: number }> {
  return apiRequest("/tasks/mentor", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function createMentorTask(
  payload: CreateTaskPayload
): Promise<{ message: string; tasks: Task[] }> {
  return apiRequest("/tasks/mentor", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function deleteMentorTask(
  taskId: string
): Promise<{ message: string }> {
  return apiRequest(`/tasks/mentor/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}
