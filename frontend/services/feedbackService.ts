import api from "./api";

export interface FeedbackDto {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isFlagged: boolean;
  status: number; // 0: Open, 1: InProgress, 2: Resolved, 3: Closed
  category: number;
  replies: FeedbackDto[];
  attachmentUrls?: string[];
  isStaffResponse: boolean;
  authorName: string;
  isAuthor: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const feedbackService = {
  getFeedbacks: async (options: { pageNumber?: number; pageSize?: number; search?: string; status?: number } = {}): Promise<PagedResult<FeedbackDto>> => {
    const { pageNumber = 1, pageSize = 10, search, status } = options;
    const response = await api.get<PagedResult<FeedbackDto>>("/Feedback/GetFeedbackList", {
      params: { pageNumber, pageSize, search, status }
    });
    return response.data;
  },

  getFeedbackDetail: async (id: string): Promise<FeedbackDto> => {
    const response = await api.get<FeedbackDto>(`/Feedback/GetFeedbackDetail`, {
      params: { id }
    });
    return response.data;
  },

  submitFeedback: async (title: string, content: string, category: number, proofs?: File[]): Promise<{ id: string }> => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category.toString());
    
    if (proofs && proofs.length > 0) {
      proofs.forEach((file) => {
        formData.append("proofs", file);
      });
    }

    const response = await api.post<{ id: string }>("/Feedback/SubmitFeedback", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  submitReply: async (parentId: string, content: string): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>("/Feedback/SubmitReply", {
      parentId,
      content
    });
    return response.data;
  },

  revealIdentity: async (id: string): Promise<any> => {
    const response = await api.get(`/AdminAudit/RevealIdentity/${id}`);
    return response.data;
  },

  updateFeedbackStatus: async (id: string, status: number): Promise<void> => {
    await api.patch("/Feedback/UpdateStatus", { id, status });
  },

  getFlaggedList: async (): Promise<FeedbackDto[]> => {
    const response = await api.get("/Feedback/GetFlaggedList");
    return response.data;
  },

  flagFeedback: async (feedbackId: string, reason: string): Promise<void> => {
    await api.post("/Feedback/FlagFeedback", { feedbackId, reason });
  },

  resolveFeedbackFlag: async (feedbackId: string): Promise<void> => {
    await api.post("/Feedback/ResolveFlag", { feedbackId });
  }
};
