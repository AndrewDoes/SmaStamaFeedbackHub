import api from "./api";
import { PagedResult } from "./feedbackService";

export interface StudentDto {
  id: string;
  code: string;
  fullName: string;
  batchYear: number | null;
  isActive: boolean;
  feedbackCount: number;
}

export const userService = {
  getStudentList: async (pageNumber: number = 1, pageSize: number = 20, search?: string): Promise<PagedResult<StudentDto>> => {
    const response = await api.get("/AdminUsers/GetStudentList", {
      params: { pageNumber, pageSize, search }
    });
    return response.data;
  }
};
