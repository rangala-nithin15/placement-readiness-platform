import type { User } from "./authService";


const TOKEN_KEY =
  "placement_access_token";

const USER_KEY =
  "placement_user";


export function saveAuth(
  token: string,
  user: User
) {

  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

}


export function getToken(): string | null {

  return localStorage.getItem(
    TOKEN_KEY
  );

}


export function getStoredUser(): User | null {

  const user =
    localStorage.getItem(
      USER_KEY
    );


  if (!user) {

    return null;

  }


  try {

    return JSON.parse(
      user
    ) as User;

  } catch {

    return null;

  }

}


export function clearAuth() {

  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );

}