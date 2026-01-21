import { trainingMock } from "../mock/training.mock";

export const trainingService = {
  async list() {
    return trainingMock;
  },
};
