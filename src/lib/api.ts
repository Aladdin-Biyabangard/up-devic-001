// API Configuration and utilities for UpDevic Course Platform
const API_BASE_URL = "https://up-devic-001.onrender.com/api";

// JWT Token management
interface JWTPayload {
  exp: number;
  sub: string;
  email: string;
  role: string;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;

  private constructor() {
    this.baseURL = API_BASE_URL;
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // JWT Token utilities
  public static decodeToken(token: string): JWTPayload | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload;
      return payload;
    } catch {
      return null;
    }
  }

  public static isTokenExpired(token: string): boolean {
    const payload = ApiClient.decodeToken(token);
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
  }

  public static getTokenExpirationTime(token: string): Date | null {
    const payload = ApiClient.decodeToken(token);
    if (!payload) return null;
    return new Date(payload.exp * 1000);
  }

  public static getTokenPayload(token: string): JWTPayload | null {
    return ApiClient.decodeToken(token);
  }

  public static getTokenTimeUntilExpiry(token: string): number | null {
    const payload = ApiClient.decodeToken(token);
    if (!payload) return null;
    return payload.exp * 1000 - Date.now();
  }

  public static shouldRefreshToken(token: string, bufferMinutes: number = 5): boolean {
    const timeUntilExpiry = ApiClient.getTokenTimeUntilExpiry(token);
    if (timeUntilExpiry === null) return true;
    return timeUntilExpiry < bufferMinutes * 60 * 1000; // Convert minutes to milliseconds
  }

  private isTokenExpired(token: string): boolean {
    return ApiClient.isTokenExpired(token);
  }

  private getValidToken(): string | null {
    const token = localStorage.getItem('auth_token');
    if (!token || this.isTokenExpired(token)) {
      localStorage.removeItem('auth_token');
      return null;
    }
    return token;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getValidToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const isFormData = options && options.body instanceof FormData;

    const config: RequestInit = {
      headers: {
        ...(isFormData
          ? { 'Accept': 'application/json' }
          : { "Content-Type": "application/json", 'Accept': 'application/json' }
        ),
        'Access-Control-Allow-Origin': '*',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      mode: "cors",
      credentials: "omit",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or invalid, clear it
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Course endpoints
  async getCourses(searchCriteria?: Record<string, string | number | boolean>) {
    const filtered = Object.fromEntries(
      Object.entries(searchCriteria || {}).filter(([_, v]) => v !== undefined)
    );

    const query = Object.keys(filtered).length
      ? "?" + new URLSearchParams(
          Object.fromEntries(
            Object.entries(filtered).map(([k, v]) => [k, String(v)])
          )
        ).toString()
      : "";

    return this.request(`/v1/course/search${query}`, {
      method: "GET",
    });
  }

  async getCourse(courseId: string) {
    return this.request(`/v1/course/${courseId}`);
  }

  async getPopularCourses() {
    return this.request("/v1/course/popular-courses");
  }

  async getCategories() {
    return this.request("/v1/course/categories");
  }

  async getCoursesByCategory(category: string) {
    return this.request(
      `/v1/course/category?categoryType=${category}&page=0&size=100`
    );
  }

  // Lesson endpoints
  async getLessonsByCourse(courseId: string) {
    return this.request(`/v1/lessons/courses/${courseId}`);
  }

  async getLesson(lessonId: string) {
    return this.request(`/v1/lessons/${lessonId}`);
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/v1/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request("/v1/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request("/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout() {
    try {
      await this.request("/v1/auth/sign-out", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async getUserProfile() {
    return this.request("/users/-profile");
  }

  // Comment endpoints
  async getCourseComments(courseId: string) {
    return this.request(`/v1/comments/courses/${courseId}?page=0&size=50`);
  }

  async getCourseCommentsPaged(courseId: string, page: number = 0, size: number = 10) {
    return this.request(`/v1/comments/courses/${courseId}?page=${page}&size=${size}`);
  }

  async getLessonComments(lessonId: string) {
    return this.request(`/v1/comments/lessons/${lessonId}`);
  }

  async getLessonCommentsPaged(lessonId: string, page: number = 0, size: number = 10) {
    return this.request(`/v1/comments/lessons/${lessonId}?page=${page}&size=${size}`);
  }

  async addCommentToCourse(courseId: string, comment: string) {
    return this.request(`/v1/comments/courses${courseId}`, {
      method: "POST",
      body: JSON.stringify({ content: comment }),
    });
  }

  // Teacher endpoints
  async getTeacherInfo() {
    return this.request("/teacher/info");
  }

  async getTeacherCourses() {
    return this.request("/teacher/courses");
  }

  async searchTeachers(query: string) {
    return this.request(`/teacher/search?query=${query}`);
  }

  // Student endpoints
  async getStudentCourses() {
    return this.request("/students/courses");
  }

  async requestToBecomeTeacher() {
    return this.request("/students/for-teacher");
  }

  // Payment endpoints
  async checkout(courseId: string) {
    return this.request("/payment", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  }

  // Teacher Course Management
  async createCourse(payload: { title: string; description: string; level: string; price: number; category: string; }) {
    return this.request("/v1/course", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateCourse(courseId: string, payload: { title?: string; description?: string; level?: string; price?: number; category?: string; }) {
    return this.request(`/v1/course/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async uploadCoursePhoto(courseId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return this.request(`/v1/course/photo?courseId=${encodeURIComponent(courseId)}`, {
      method: "PATCH",
      body: form,
    });
  }

  async assignTeacherToCourse(courseId: string, userId: string) {
    return this.request(`/v1/course/${courseId}/teachers/${userId}`, {
      method: "POST",
    });
  }

  // Teacher Lesson Management
  async createLesson(courseId: string, payload: { title: string; description: string; videoFile?: File | null; }) {
    // If video file provided, use form-data
    if (payload.videoFile) {
      const form = new FormData();
      form.append("title", payload.title);
      form.append("description", payload.description);
      form.append("video", payload.videoFile);
      return this.request(`/v1/lessons/courses/${courseId}`, {
        method: "POST",
        body: form,
      });
    }
    return this.request(`/v1/lessons/courses/${courseId}`, {
      method: "POST",
      body: JSON.stringify({ title: payload.title, description: payload.description }),
    });
  }

  async updateLesson(lessonId: string, payload: { title?: string; description?: string; duration?: string; videoUrl?: string; }) {
    return this.request(`/v1/lessons/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async uploadLessonPhoto(lessonId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return this.request(`/v1/lessons/${lessonId}/photo`, {
      method: "PATCH",
      body: form,
    });
  }

  async deleteLesson(lessonId: string) {
    return this.request(`/v1/lessons/${lessonId}`, {
      method: "DELETE",
    });
  }

  async getTeacherBalance() {
    return this.request("/payment/balance");
  }

  // Admin endpoints
  async getAllUsers() {
    return this.request("/admin/users");
  }

  async getUsersCount() {
    return this.request("/admin/users/count");
  }
}

export const api = ApiClient.getInstance();

// Type definitions based on the API
export interface Course {
  courseId: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  imageUrl?: string;
  teacherName: string;
  duration: string;
  studentsCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  order: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  profileImageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  updatedAt: string;
  rating?: number;
}
