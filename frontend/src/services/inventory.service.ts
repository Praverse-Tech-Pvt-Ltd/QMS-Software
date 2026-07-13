import api from "./api";

export interface InventoryCategory {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  category: string;
  category_name: string;
  manufacturer: string;
  catalog_no: string;
  storage_condition: string;
  unit: string;
  minimum_stock: string | null;
  created_at: string;
  updated_at: string;
}

export interface LowStockItem extends InventoryItem {
  total_in_use: number | string;
}

export interface InventoryLot {
  id: string;
  item: string;
  item_name: string;
  item_code: string;
  lot_number: string;
  received_date: string;
  expiry_date: string | null;
  initial_quantity: string;
  current_quantity: string;
  purity_percent: string | null;
  status: "in_use" | "quarantine" | "expired" | "consumed";
  status_display: string;
  linked_coa: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryUsageLog {
  id: string;
  lot: string;
  lot_number: string;
  quantity_used: string;
  used_by: string;
  used_by_name: string;
  used_date: string;
  purpose: string;
  linked_sample: string | null;
  created_at: string;
  updated_at: string;
}

export const inventoryService = {
  // Categories
  async listCategories(): Promise<InventoryCategory[]> {
    const response = await api.get<InventoryCategory[]>("/v1/inventory/categories/");
    return response.data;
  },

  async createCategory(data: Partial<InventoryCategory>): Promise<InventoryCategory> {
    const response = await api.post<InventoryCategory>("/v1/inventory/categories/", data);
    return response.data;
  },

  // Items
  async listItems(): Promise<InventoryItem[]> {
    const response = await api.get<InventoryItem[]>("/v1/inventory/items/");
    return response.data;
  },

  async createItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.post<InventoryItem>("/v1/inventory/items/", data);
    return response.data;
  },

  async lowStockItems(): Promise<LowStockItem[]> {
    const response = await api.get<LowStockItem[]>("/v1/inventory/items/low-stock/");
    return response.data;
  },

  // Lots
  async listLots(): Promise<InventoryLot[]> {
    const response = await api.get<InventoryLot[]>("/v1/inventory/lots/");
    return response.data;
  },

  async createLot(data: Partial<InventoryLot>): Promise<InventoryLot> {
    const response = await api.post<InventoryLot>("/v1/inventory/lots/", data);
    return response.data;
  },

  async expiringLots(): Promise<InventoryLot[]> {
    const response = await api.get<InventoryLot[]>("/v1/inventory/lots/expiring/");
    return response.data;
  },

  // Usage
  async listUsage(lotId: string): Promise<InventoryUsageLog[]> {
    const response = await api.get<InventoryUsageLog[]>(`/v1/inventory/lots/${lotId}/usage/`);
    return response.data;
  },

  async recordUsage(lotId: string, data: Partial<InventoryUsageLog>): Promise<InventoryUsageLog> {
    const response = await api.post<InventoryUsageLog>(`/v1/inventory/lots/${lotId}/usage/`, data);
    return response.data;
  },
};

export default inventoryService;
