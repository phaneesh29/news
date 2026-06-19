const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export async function fetchHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("Failed to fetch health status");
  }
  return response.json();
}

export async function fetchProfile(headers?: HeadersInit): Promise<ApiResponse<UserProfile>> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch profile");
  }
  
  return response.json();
}

export interface SessionInfo {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchSessionsList(): Promise<ApiResponse<SessionInfo[]>> {
  const response = await fetch(`${API_BASE_URL}/auth/sessions`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch sessions");
  }
  
  return response.json();
}

export async function revokeSessionApi(token: string): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/auth/sessions/revoke`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to revoke session");
  }
  
  return response.json();
}

export async function revokeOtherSessionsApi(): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/auth/sessions/revoke-others`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to revoke other sessions");
  }
  
  return response.json();
}
