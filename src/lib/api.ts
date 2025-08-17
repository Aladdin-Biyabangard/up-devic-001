// API Configuration and utilities for UpDevic Course Platform
const API_BASE_URL = import.meta.env.DEV
  ? "/api" // Use proxy in development
  : "https://up-devic-001.onrender.com/api";

// API client with error handling and loading states
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        // 'Accept': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
        ...options.headers,
      },
      mode: "cors",
      credentials: "omit",
      ...options,
    };

    try {
      const response = await fetch(url, config);

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
  async getCourses(searchCriteria?: Record<string, any>) {
    const filtered = Object.fromEntries(
      Object.entries(searchCriteria || {}).filter(([_, v]) => v !== undefined)
    );
  
    const query = Object.keys(filtered).length
      ? "?" + new URLSearchParams(filtered as Record<string, string>).toString()
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
    return this.request(`/v1/course/category?categoryType=${category}&page=0&size=100`);
  }

  // Lesson endpoints
  async getLessonsByCourse(courseId: string) {
    return this.request(`/v1/lessons/courses/${courseId}`);
  }

  async getLesson(lessonId: string) {
    return this.request(`/v1/lessons/${lessonId}`);
  }

  // User/Auth endpoints
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

  async getUserProfile() {
    return this.request("/v1/users/-profile");
  }

  // Comment endpoints
  async getCourseComments(courseId: string) {
    return this.request(`/v1/comments/courses/${courseId}`);
  }

  async getLessonComments(lessonId: string) {
    return this.request(`/v1/comments/lessons/${lessonId}`);
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
  createdAt: string;
  rating?: number;
}
