import { deviationsMock } from "../mock/deviations.mock";

// Helper: Simulate network latency (so you can see Loading Spinners)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const deviationsService = {
  // 1. Fetch List (for Dashboard/List Page)
  async list() {
    await delay(800); 
    return deviationsMock;
  },

  // 2. Fetch Single Record (for Detail Page)
  async getById(id: string) {
    await delay(600);
    const item = deviationsMock.find((d: any) => d.id === id);

    if (!item) {
      // Fallback for demo if ID isn't in your static mock file
      return {
        id,
        title: "Demo Deviation Record",
        status: "Investigation",
        severity: "Major",
        batch: "B-2025-DEMO",
        created: "2024-02-10",
        description: "This is a simulated record because the ID was not found in the mock list.",
      };
    }
    return item;
  },

  // 3. Create Record
  async create(data: any) {
    await delay(1000);
    console.log("Creating API Call:", data);
    return { id: `DEV-${Math.floor(Math.random() * 10000)}`, ...data };
  },

  // 4. Update Record (Save button)
  async update(id: string, data: any) {
    await delay(1000);
    console.log(`Updating API Call (${id}):`, data);
    return { id, ...data };
  }
};