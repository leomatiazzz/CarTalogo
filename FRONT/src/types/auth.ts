export type ProfileRole = 'Admin' | 'Editor';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  profile: ProfileRole;
  token: string;
}

export interface UserSession {
  email: string;
  profile: ProfileRole;
  token: string;
}
