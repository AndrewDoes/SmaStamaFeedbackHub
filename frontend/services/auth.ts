import api from "./api";

export interface LoginResponse {
  token: string;
  role: string;
  fullName: string;
  mustChangePassword: boolean;
  userId: string;
  code: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<any> => {
    // Note: Backend expects 'Code' and 'Password' (PascalCase)
    const response = await api.post<any>("/auth/login", {
      Code: username,
      Password: password,
    });
    
    console.log("Login Response Data:", response.data);

    // Normalize response data: support both camelCase and PascalCase
    const token = response.data.token || response.data.Token;
    const role = response.data.role || response.data.Role;
    const fullName = response.data.fullName || response.data.FullName;
    const mustChangePassword = response.data.mustChangePassword !== undefined 
      ? response.data.mustChangePassword 
      : response.data.MustChangePassword;
    const userId = response.data.userId || response.data.UserId;
    const code = response.data.code || response.data.Code;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user_role", role || "");
      localStorage.setItem("user_name", fullName || "");
      localStorage.setItem("must_change_password", String(mustChangePassword ?? false));
      localStorage.setItem("user_id", userId || "");
      localStorage.setItem("user_code", code || "");
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_code");
    localStorage.removeItem("must_change_password");
    window.location.href = "/login";
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },

  getRole: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("user_role");
  },

  getUserId: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("user_id");
  },

  getCode: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("user_code");
  }
};
