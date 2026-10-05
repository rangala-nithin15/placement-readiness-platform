import { apiRequest } from "./api";
import { getToken } from "./authStorage";


export type StudentProfile = {

  id: string;

  user_id: string;

  name: string;

  email: string;

  register_number?: string;

  department?: string;

  batch?: string;

  phone?: string | null;

  location?: string | null;

  linkedin_url?: string | null;

  cgpa?: number | null;

  tenth_percentage?: number | null;

  twelfth_percentage?: number | null;

  backlogs: number;

  skills: string[];

  career_interests: string[];

  profile_completion: number;

};


export type StudentProfileUpdate = {

  phone?: string;

  location?: string;

  linkedin_url?: string;

  cgpa?: number;

  tenth_percentage?: number;

  twelfth_percentage?: number;

  backlogs?: number;

  skills?: string[];

  career_interests?: string[];

};


export async function getStudentProfile(): Promise<StudentProfile> {

  const token = getToken();

  if (!token) {

    throw new Error(
      "Authentication token not found."
    );

  }


  return apiRequest<StudentProfile>(
    "/student/profile",
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

}


export async function updateStudentProfile(
  data: StudentProfileUpdate
): Promise<StudentProfile> {

  const token = getToken();

  if (!token) {

    throw new Error(
      "Authentication token not found."
    );

  }


  return apiRequest<StudentProfile>(
    "/student/profile",
    {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    }
  );

}