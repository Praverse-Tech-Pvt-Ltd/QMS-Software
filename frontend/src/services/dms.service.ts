import { dmsMock } from "../mock/dms.mock";

export const dmsService = {
  async list() {
    return dmsMock;
  },
};
