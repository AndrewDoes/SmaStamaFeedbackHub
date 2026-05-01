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
  },

  importStudents: async (file: File): Promise<{ 
    importedCount: number; 
    skippedCount: number; 
    errors: string[];
    importedStudents: { code: string; fullName: string; initialPassword: string }[] 
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/AdminUsers/ImportStudents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  createStudent: async (code: string, fullName: string, batchYear: number): Promise<string> => {
    const response = await api.post("/AdminUsers/CreateStudent", {
      code,
      fullName,
      batchYear,
    });
    return response.data;
  }
};
