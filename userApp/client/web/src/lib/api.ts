const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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

export async function deleteAccountApi(): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/auth/account`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete account");
  }
  
  return response.json();
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  sourceUrl: string | null;
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  hasLiked: boolean;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchNewsList(cursor?: string): Promise<ApiResponse<{ news: NewsItem[]; nextCursor: string | null }>> {
  const url = cursor ? `${API_BASE_URL}/news?cursor=${encodeURIComponent(cursor)}` : `${API_BASE_URL}/news`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
}

export async function fetchNewsById(id: string): Promise<ApiResponse<{ news: NewsItem }>> {
  const response = await fetch(`${API_BASE_URL}/news/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch news article");
  }
  return response.json();
}

export async function fetchBlogsList(cursor?: string): Promise<ApiResponse<{ blogs: BlogItem[]; nextCursor: string | null }>> {
  const url = cursor ? `${API_BASE_URL}/blogs?cursor=${encodeURIComponent(cursor)}` : `${API_BASE_URL}/blogs`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }
  return response.json();
}

export async function fetchBlogById(id: string): Promise<ApiResponse<{ blog: BlogItem }>> {
  const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch blog post");
  }
  return response.json();
}

export async function searchNewsList(query: string, priority?: string): Promise<ApiResponse<{ news: NewsItem[] }>> {
  let url = `${API_BASE_URL}/news/search?q=${encodeURIComponent(query)}`;
  if (priority) {
    url += `&priority=${encodeURIComponent(priority)}`;
  }
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to search news");
  }
  return response.json();
}

export async function searchBlogsList(query: string): Promise<ApiResponse<{ blogs: BlogItem[] }>> {
  const url = `${API_BASE_URL}/blogs/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to search blogs");
  }
  return response.json();
}

export async function likeNewsApi(id: string): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/news/${id}/like`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to like news article");
  }
  return response.json();
}

export async function unlikeNewsApi(id: string): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/news/${id}/like`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to unlike news article");
  }
  return response.json();
}

export async function fetchLikedNewsList(): Promise<ApiResponse<{ news: NewsItem[] }>> {
  const response = await fetch(`${API_BASE_URL}/news/liked`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch liked news list");
  }
  return response.json();
}

export interface FeedbackItem {
  id: string;
  userId: string;
  email: string;
  category: string;
  message: string;
  createdAt: string;
}

export async function submitFeedbackApi(category: string, message: string): Promise<ApiResponse<{ feedback: FeedbackItem }>> {
  const response = await fetch(`${API_BASE_URL}/feedbacks`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category, message }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to submit feedback");
  }
  return response.json();
}

export interface DigestTrend {
  trend: string;
  description: string;
}

export interface DigestSource {
  name: string;
  url: string;
}

export interface DigestArticle {
  type: string;
  emoji: string;
  confidence: string;
  title: string;
  impact: number;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  score: number;
  scoringBreakdown: Record<string, number>;
  sources: DigestSource[];
}

export interface DigestCategory {
  name: string;
  emoji: string;
  articles: DigestArticle[];
}

export interface DigestStats {
  totalItemsVerified?: string;
  highConfidence?: string;
  mediumConfidence?: string;
  lowConfidence?: string;
  crossReferenced?: string;
  freshnessWindow?: string;
  generatedAt?: string;
  [key: string]: string | undefined;
}

export interface DigestData {
  title: string;
  subtitle: string;
  lastUpdated: string;
  executiveSummary: string;
  trends: DigestTrend[];
  categories: DigestCategory[];
  stats: DigestStats;
}

export async function fetchDigest(): Promise<ApiResponse<DigestData>> {
  const response = await fetch(`${API_BASE_URL}/digest`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch digest");
  }
  return response.json();
}

export interface DocItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId: string | null;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchDocsList(cursor?: string, parentId?: string): Promise<ApiResponse<{ docs: DocItem[]; nextCursor: string | null }>> {
  let url = `${API_BASE_URL}/docs`;
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (parentId) params.append("parentId", parentId);
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();
}

export async function fetchDocBySlug(slug: string): Promise<ApiResponse<{ doc: DocItem }>> {
  const response = await fetch(`${API_BASE_URL}/docs/${encodeURIComponent(slug)}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch document");
  }
  return response.json();
}

export async function searchDocsList(query: string): Promise<ApiResponse<{ docs: DocItem[] }>> {
  const url = `${API_BASE_URL}/docs/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to search documents");
  }
  return response.json();
}

