import { apiRequest } from "./api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  register_number?: string;
  mentor_id?: string;
  department?: string;
  batch?: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  register_number: string;
  department: string;
  batch: string;
};


export async function login(
  credentials: LoginRequest
): Promise<AuthResponse> {

  return apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );
}


export type MentorRegisterRequest = {
  name: string;
  email: string;
  password: string;
  department: string;
  batch: string;
  mentor_id?: string;
};


export async function registerMentor(
  data: MentorRegisterRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    "/auth/register-mentor",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


export async function registerStudent(
  data: RegisterRequest
): Promise<AuthResponse> {

  return apiRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


export async function getCurrentUser(
  token: string
): Promise<User> {

  return apiRequest<User>(
    "/auth/me",
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}