import { changeMock } from "../mock/change.mock";

export const changeService = {
  async list() {
    return changeMock;
  },
};
