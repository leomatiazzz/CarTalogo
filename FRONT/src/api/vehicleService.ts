import { apiClient } from './client';
import type { Vehicle, VehicleDTO, VehicleFilterParams } from '../types/vehicle';

export const vehicleService = {
  async getAll(params?: VehicleFilterParams): Promise<Vehicle[]> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.name) query.append('name', params.name);
    if (params?.brand) query.append('brand', params.brand);

    const queryString = query.toString();
    const url = queryString ? `/vehicles?${queryString}` : '/vehicles';
    const response = await apiClient.get<Vehicle[]>(url);
    return response.data;
  },

  async getById(id: number): Promise<Vehicle> {
    const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  async create(data: VehicleDTO): Promise<Vehicle> {
    const response = await apiClient.post<Vehicle>('/vehicles', data);
    return response.data;
  },

  async update(id: number, data: VehicleDTO): Promise<Vehicle> {
    const response = await apiClient.put<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },
};
