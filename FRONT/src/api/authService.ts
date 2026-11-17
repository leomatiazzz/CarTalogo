import { apiClient } from './client';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/admins/login', credentials);
    return response.data;
  },
};
