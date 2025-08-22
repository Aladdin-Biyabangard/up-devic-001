// Authentication and role checking utilities
import { User, UserRole } from '@/types/user';

export class AuthUtils {
  /**
   * Normalize roles from various API response formats
   */
  static normalizeRoles(input: any): UserRole[] {
    if (Array.isArray(input)) {
      return input.filter(role => typeof role === 'string') as UserRole[];
    }
    if (typeof input === 'string') {
      return [input as UserRole];
    }
    return [];
  }

  /**
   * Extract roles from user object or localStorage fallback
   */
  static getUserRoles(user: User | null | undefined): UserRole[] {
    if (!user) return [];
    
    // Try different role formats
    const directRoles = this.normalizeRoles(user.roles);
    if (directRoles.length > 0) return directRoles;
    
    const singleRole = this.normalizeRoles(user.role);
    if (singleRole.length > 0) return singleRole;
    
    // Fallback to localStorage
    try {
      const storedRoles = JSON.parse(localStorage.getItem('auth_roles') || '[]');
      return this.normalizeRoles(storedRoles);
    } catch {
      return [];
    }
  }

  /**
   * Check if user has a specific role
   */
  static hasRole(user: User | null | undefined, role: UserRole): boolean {
    const roles = this.getUserRoles(user);
    return roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(user: User | null | undefined, roles: UserRole[]): boolean {
    const userRoles = this.getUserRoles(user);
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has all specified roles
   */
  static hasAllRoles(user: User | null | undefined, roles: UserRole[]): boolean {
    const userRoles = this.getUserRoles(user);
    return roles.every(role => userRoles.includes(role));
  }

  /**
   * Get user display name
   */
  static getUserDisplayName(user: User | null | undefined): string {
    if (!user) return 'Unknown User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User';
  }

  /**
   * Get user initials for avatar
   */
  static getUserInitials(user: User | null | undefined): string {
    if (!user) return '?';
    const firstName = user.firstName?.[0]?.toUpperCase() || '';
    const lastName = user.lastName?.[0]?.toUpperCase() || '';
    return firstName + lastName || user.email?.[0]?.toUpperCase() || '?';
  }
}