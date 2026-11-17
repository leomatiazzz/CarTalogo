export interface Vehicle {
  id: number;
  name: string;
  brand: string;
  year: number;
}

export interface VehicleDTO {
  name: string;
  brand: string;
  year: number;
}

export interface VehicleFilterParams {
  page?: number;
  name?: string;
  brand?: string;
}
