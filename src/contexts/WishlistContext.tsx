import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, Course } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlistCourses: Course[];
  wishlistCourseIds: Set<string>;
  isInWishlist: (courseId: string) => boolean;
  addToWishlist: (course: Course) => Promise<void>;
  removeFromWishlist: (courseId: string) => Promise<void>;
  toggleWishlist: (course: Course) => Promise<void>;
  loading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>([]);
  const [wishlistCourseIds, setWishlistCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshWishlist = async () => {
    if (!user) {
      setWishlistCourses([]);
      setWishlistCourseIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const courses = await api.getWishlistCourses();
      setWishlistCourses(courses);
      setWishlistCourseIds(new Set(courses.map(course => course.courseId)));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (courseId: string): boolean => {
    return wishlistCourseIds.has(courseId);
  };

  const addToWishlist = async (course: Course) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add courses to your wishlist",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.addToWishlist(course.courseId);
      setWishlistCourses(prev => [...prev, course]);
      setWishlistCourseIds(prev => new Set(prev).add(course.courseId));
      toast({
        title: "Added to wishlist",
        description: `${course.title} has been added to your wishlist`
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add course to wishlist",
        variant: "destructive"
      });
    }
  };

  const removeFromWishlist = async (courseId: string) => {
    if (!user) return;

    try {
      await api.removeFromWishlist(courseId);
      const course = wishlistCourses.find(c => c.courseId === courseId);
      setWishlistCourses(prev => prev.filter(course => course.courseId !== courseId));
      setWishlistCourseIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      toast({
        title: "Removed from wishlist",
        description: course ? `${course.title} has been removed from your wishlist` : "Course removed from wishlist"
      });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove course from wishlist",
        variant: "destructive"
      });
    }
  };

  const toggleWishlist = async (course: Course) => {
    if (isInWishlist(course.courseId)) {
      await removeFromWishlist(course.courseId);
    } else {
      await addToWishlist(course);
    }
  };

  // Load wishlist when user changes
  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const value: WishlistContextType = {
    wishlistCourses,
    wishlistCourseIds,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    loading,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}