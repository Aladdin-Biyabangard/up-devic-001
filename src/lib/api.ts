// API Configuration and utilities for UpDevic Course Platform
export const API_BASE_URL = "https://up-devic-001.onrender.com/api";

// JWT Token management
interface JWTPayload {
  exp: number;
  sub: string;
  email: string;
  // Some backends provide a single role, others provide an array
  role?: string;
  roles?: Array<"ROLE_USER" | "ROLE_STUDENT" | "ROLE_TEACHER" | "ROLE_ADMIN" | string>;
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
          ? { 'Accept': 'application/json, text/plain, */*' }
          : { "Content-Type": "application/json", 'Accept': 'application/json, text/plain, */*' }
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

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      const text = await response.text();
      return text as T;
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

  async verifyOtp(payload: { email: string; otpCode: number }): Promise<any> {
    return this.request("/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const query = `?email=${encodeURIComponent(email)}`;
    await this.request(`/v1/auth/forgot-password${query}`, {
      method: "POST",
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

  async getUserProfile(): Promise<UserProfile> {
    return this.request("/users/profile");
  }

  async updateUserProfile(profile: { bio?: string; socialLink?: string[]; skill?: string[] }): Promise<{ message: string }> {
    const payload: Record<string, any> = {};
    if (typeof profile.bio === 'string') payload.bio = profile.bio;
    if (Array.isArray(profile.socialLink)) payload.socialLink = profile.socialLink;
    if (Array.isArray(profile.skill)) payload.skill = profile.skill;
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async changeUserPassword(payload: { currentPassword: string; newPassword: string; retryPassword: string }): Promise<{ message: string }> {
    return this.request("/users/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async uploadUserPhoto(file: File): Promise<{ message: string }> {
    const form = new FormData();
    form.append("multipartFile", file);
    return this.request("/users/profile/photo", {
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

  async getTeacherById(teacherId: string): Promise<TeacherInfo> {
    // Base URL already includes "/api"
    return this.request(`/teacher/${teacherId}/info`);
  }

  async getTeacherProfile(teacherId: string): Promise<TeacherProfile> {
    // Base URL already includes "/api"
    return this.request(`/teacher/${teacherId}/profile`);
  }

  async getTeacherCourses(): Promise<Course[]> {
    return this.request("/teacher/courses");
  }

  async searchTeachers(query: string): Promise<any> {
    return this.request(`/teacher/search?query=${query}`);
  }

  // Student endpoints
  async getStudentCourses(): Promise<any> {
    return this.request("/v1/students/courses");
  }

  async getStudentCourseDetails(courseId: string): Promise<any> {
    const query = `?courseId=${encodeURIComponent(courseId)}`;
    return this.request(`/v1/students${query}`);
  }

  async unenrollFromCourse(courseId: string): Promise<void> {
    const query = `?courseId=${encodeURIComponent(courseId)}`;
    await this.request(`/v1/students/unenroll${query}`, { method: "DELETE" });
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

  // New payment flow
  async initiatePayment(payload: { amount: number; courseId: string; description: string }): Promise<PaymentInitResponse> {
    return this.request("/v1/payment", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async verifyPaymentSuccess(courseId: string): Promise<{ status: string; message?: string }> {
    const query = `?courseId=${encodeURIComponent(courseId)}`;
    return this.request(`/v1/payment/success${query}`);
  }

  async paymentCancel(): Promise<{ status: string; message?: string }> {
    return this.request(`/v1/payment/cancel`);
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

  // Admin endpoints (for admin panel functionality)
  async getAllUsers(afterId?: string, limit?: number): Promise<User[]> {
    const params = new URLSearchParams();
    if (afterId) params.append('afterId', afterId);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/v1/admin/users${query}`) as Promise<User[]>;
  }

  async getUsersCount(): Promise<{ count: number }> {
    return this.request('/api/v1/admin/users/count') as Promise<{ count: number }>;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.request(`/api/v1/admin/role?role=${role}`) as Promise<User[]>;
  }

  async removeUserRole(userId: string, role: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${userId}/role?role=${role}`, {
      method: 'PUT'
    }) as Promise<void>;
  }

  async assignUserRole(userId: string, role: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${userId}/assign/role?role=${role}`, {
      method: 'PUT'
    }) as Promise<void>;
  }

  async deactivateUser(userId: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${userId}/deactivate`, {
      method: 'PUT'
    }) as Promise<void>;
  }

  async activateUser(userId: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${userId}/activate`, {
      method: 'PUT'
    }) as Promise<void>;
  }

  async assignTeacherProfile(email: string): Promise<void> {
    return this.request(`/api/v1/admin/assign/${email}`, {
      method: 'POST'
    }) as Promise<void>;
  }

  async deleteUser(userId: string): Promise<void> {
    return this.request(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE'
    }) as Promise<void>;
  }
}

export const api = ApiClient.getInstance();

// Type definitions based on the API
export interface UserProfile {
  firstName: string;
  lastName: string;
  profilePhoto_url?: string;
  bio?: string;
  socialLinks?: string[];
  skills?: string[];
}
export interface Course {
  courseId: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  photo_url?: string;
  teacherId: string;
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
  role?: "ROLE_USER" | "ROLE_STUDENT" | "ROLE_TEACHER" | "ROLE_ADMIN";
  roles?: Array<"ROLE_USER" | "ROLE_STUDENT" | "ROLE_TEACHER" | "ROLE_ADMIN">;
  profileImageUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
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

export interface TeacherInfo {
  id: number;
  firstName: string;
  lastName: string;
}

export interface TeacherProfile {
  firstName: string;
  lastName: string;
  email: string;
  speciality: string;
  experienceYears: number;
  bio: string;
  socialLink: string[];
  skills: string[];
  hireDate: string;
  teacherPhoto?: string;
}

export interface PaymentInitResponse {
  status: string;
  message?: string;
  courseId: string;
  sessionId: string;
  sessionUrl: string;
}
