import { apiRequest } from "./api";

import {
  getToken,
} from "./authStorage";


export type ExternalProfile = {

  id: string;

  student_id: string;

  platform: string;

  username: string;

  profile_url: string;

  verification_status: string;

  stats: Record<string, unknown>;

  last_verified_at: string | null;

};


export type ExternalProfileListResponse = {

  profiles: ExternalProfile[];

  total: number;

};


export type ConnectProfileRequest = {

  platform: string;

  profile_url: string;

};


function getAuthHeaders() {

  const token =
    getToken();

  if (!token) {

    throw new Error(
      "Authentication token not found."
    );

  }

  return {

    Authorization:
      `Bearer ${token}`,

  };

}


export async function getExternalProfiles() {

  return apiRequest<
    ExternalProfileListResponse
  >(

    "/student/profiles",

    {

      method: "GET",

      headers:
        getAuthHeaders(),

    }

  );

}


export async function connectExternalProfile(
  data: ConnectProfileRequest
) {

  return apiRequest<
    ExternalProfile
  >(

    "/student/profiles",

    {

      method: "POST",

      headers:
        getAuthHeaders(),

      body:
        JSON.stringify(data),

    }

  );

}


export async function refreshExternalProfile(
  profileId: string
) {

  return apiRequest<
    ExternalProfile
  >(

    `/student/profiles/${profileId}/refresh`,

    {

      method: "POST",

      headers:
        getAuthHeaders(),

    }

  );

}