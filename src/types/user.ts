// User-related TypeScript interfaces and types

export type UserRole = 'ROLE_USER' | 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  roles?: UserRole[];
  role?: UserRole | UserRole[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  roles?: UserRole[];
}

export interface UserProfile extends User {
  bio?: string;
  socialLink?: string[];
  skill?: string[];
}

export interface ProfileDto {
  bio: string;
  socialLink: string[];
  skill: string[];
}

export interface JWTPayload {
  exp: number;
  sub: string;
  email: string;
  role?: string;
  roles?: UserRole[];
  authorities?: UserRole[];
}