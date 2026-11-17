import { apiClient } from './client';
import type { Admin, AdminDTO } from '../types/admin';

export const adminService = {
  async getAll(page?: number): Promise<Admin[]> {
    const url = page ? `/admins?page=${page}` : '/admins';
    const response = await apiClient.get<Admin[]>(url);
    return response.data;
  },

  async getById(id: number): Promise<Admin> {
    const response = await apiClient.get<Admin>(`/admins/${id}`);
    return response.data;
  },

  async create(data: AdminDTO): Promise<Admin> {
    const response = await apiClient.post<Admin>('/admins', data);
    return response.data;
  },
};
