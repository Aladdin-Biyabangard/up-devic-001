// API Configuration and utilities for UpDevic Course Platform
const API_BASE_URL = "https://up-devic-001.onrender.com/api";

// JWT Token management
interface JWTPayload {
  exp: number;
  sub: string;
  email: string;
  // Some backends provide a single role, others provide an array
  role?: string;
  roles?: Array<"USER" | "STUDENT" | "TEACHER" | "ADMIN" | string>;
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

      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_roles');
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
  async getCourses(searchCriteria?: Record<string, string | number | boolean>): Promise<Course[]> {
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

  async getCourse(courseId: string): Promise<CourseDetail> {
    return this.request(`/v1/course/${courseId}`);
  }

  async getPopularCourses(): Promise<Course[]> {
    return this.request("/v1/course/popular-courses");
  }

  async getCategories(): Promise<CategoryDto[]> {
    return this.request("/v1/course/categories");
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    return this.request(
      `/v1/course/category?categoryType=${category}&page=0&size=100`
    );
  }

  // Wishlist endpoints
  async getWishlist(page: number = 0, size: number = 12): Promise<any> {
    return this.request(`/v1/course/wish?page=${page}&size=${size}`, {
      method: "GET",
    });
  }

  async addCourseToWishlist(courseId: string): Promise<any> {
    return this.request(`/v1/course/${courseId}/wish`, {
      method: "POST",
    });
  }

  async removeCourseFromWishlist(courseId: string): Promise<any> {
    return this.request(`/v1/course/${courseId}/wish`, {
      method: "DELETE",
    });
  }

  async rateCourse(courseId: string, rating: number): Promise<any> {
    return this.request(`/v1/course/${courseId}/rating?rating=${encodeURIComponent(String(rating))}`, {
      method: "PATCH",
    });
  }

  // Lesson endpoints
  async getLessonsByCourse(courseId: string): Promise<LessonItem[]> {
    return this.request(`/v1/lessons/courses/${courseId}`);
  }

  async getLesson(lessonId: string): Promise<any> {
    return this.request(`/v1/lessons/${lessonId}`);
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
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
  }): Promise<any> {
    return this.request("/v1/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return this.request("/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<void> {
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

  async updateUserProfile(profile: { bio?: string; socialLink?: string[]; skill?: string[] }) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  }

  async changeUserPassword(payload: { currentPassword: string; newPassword: string; retryPassword: string }) {
    return this.request("/users/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async uploadUserPhoto(file: File) {
    const form = new FormData();
    form.append("multipartFile", file);
    return this.request("/users/-photo", {
      method: "PATCH",
      body: form,
    });
  }

  // Comment endpoints
  async getCourseComments(courseId: string) {
    return this.request(`/v1/comments/courses/${courseId}?page=0&size=50`);
  }

  async getCourseCommentsPaged(courseId: string, page: number = 0, size: number = 10): Promise<PagedCommentsResponse> {
    return this.request(`/v1/comments/courses/${courseId}?page=${page}&size=${size}`);
  }

  async getLessonComments(lessonId: string): Promise<any> {
    return this.request(`/v1/comments/lessons/${lessonId}`);
  }

  async getLessonCommentsPaged(lessonId: string, page: number = 0, size: number = 10): Promise<PagedCommentsResponse> {
    return this.request(`/v1/comments/lessons/${lessonId}?page=${page}&size=${size}`);
  }

  async addCommentToCourse(courseId: string, comment: string): Promise<any> {
    return this.request(`/v1/comments/courses${courseId}`, {
      method: "POST",
      body: JSON.stringify({ content: comment }),
    });
  }

  // Teacher endpoints
  async getTeacherInfo(): Promise<any> {
    return this.request("/teacher/info");
  }

  async getTeacherCourses(): Promise<Course[]> {
    return this.request("/teacher/courses");
  }

  async searchTeachers(query: string): Promise<any> {
    return this.request(`/teacher/search?query=${query}`);
  }

  // Student endpoints
  async getStudentCourses() {
    return this.request("/students/courses");
  }

  async requestToBecomeTeacher() {
    return this.request("/v1/students/for-teacher");
  }

  // Payment endpoints
  async checkout(courseId: string) {
    return this.request("/payment", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  }

  // Teacher Course Management
  async createCourse(payload: { title: string; description: string; level: string; price: number; }, category: string) {
    const query = `?courseCategoryType=${encodeURIComponent(category)}`;
    return this.request(`/v1/course${query}`, {
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
    form.append("multipartFile", file);
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
    const query = `?title=${encodeURIComponent(payload.title)}&description=${encodeURIComponent(payload.description)}`;
    const form = new FormData();
    if (payload.videoFile) {
      form.append("file", payload.videoFile);
    }
    return this.request(`/v1/lessons/courses/${courseId}${query}`, {
      method: "POST",
      body: form,
    });
  }

  async updateLesson(lessonId: string, payload: { title?: string; description?: string; }) {
    return this.request(`/v1/lessons/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async uploadLessonPhoto(lessonId: string, file: File) {
    const form = new FormData();
    form.append("multipartFile", file);
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

export interface CourseDetail {
  photo_url: string;
  headTeacher: {
    firstName: string;
    lastName: string;
  };
  teachers: Array<{
    firstName: string;
    lastName: string;
  }>;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  duration: string;
  studentsCount: number;
}

export interface LessonItem {
  lessonId: string;
  title: string;
  description: string;
  duration?: string;
  order?: number;
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
  // Keep existing single role for compatibility, but prefer roles[]
  role?: "USER" | "STUDENT" | "TEACHER" | "ADMIN";
  roles?: Array<"USER" | "STUDENT" | "TEACHER" | "ADMIN">;
  profileImageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  updatedAt: string;
  rating?: number;
}

export interface PagedCommentsResponse {
  content: Array<{
    commentId: string | number;
    firstName: string;
    content: string;
    updatedAt: string;
  }>;
  page: number;
  size: number;
}

export interface CategoryDto {
  category: string;
  courseCount: number;
}
