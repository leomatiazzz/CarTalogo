import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/admins/login', credentials);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<void> {
    await apiClient.post('/admins/register', data);
  },
};
