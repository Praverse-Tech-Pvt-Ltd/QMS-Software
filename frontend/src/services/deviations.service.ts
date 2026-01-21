import { deviationsMock } from "../mock/deviations.mock";

export const deviationsService = {
  async list() {
    return deviationsMock;
  },
};
