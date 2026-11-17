import type { ProfileRole } from './auth';

export interface Admin {
  id: number;
  email: string;
  profile: ProfileRole;
}

export interface AdminDTO {
  email: string;
  password: string;
  profile: ProfileRole;
}
