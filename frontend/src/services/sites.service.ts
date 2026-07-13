import api from "./api";

export interface Site {
  id: number;
  name: string;
  code: string;
  country: string;
  is_active: boolean;
}

export const sitesService = {
  async list(): Promise<Site[]> {
    const response = await api.get<Site[]>("/v1/accounts/sites/");
    return response.data;
  },

  async create(data: Partial<Site>): Promise<Site> {
    const response = await api.post<Site>("/v1/accounts/sites/", data);
    return response.data;
  },

  async update(id: number, data: Partial<Site>): Promise<Site> {
    const response = await api.patch<Site>(`/v1/accounts/sites/${id}/`, data);
    return response.data;
  },
};
