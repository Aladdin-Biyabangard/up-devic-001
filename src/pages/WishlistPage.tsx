import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { CourseCard, CourseCardSkeleton } from "@/components/course/CourseCard";


export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { wishlistCourses, loading } = useWishlist();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-10">
        <Card className="p-8 text-center rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Please sign in to view your wishlist</h2>
          <p className="text-muted-foreground mb-4">Your saved courses appear here once you are logged in.</p>
          <Button asChild>
            <Link to="/auth">Go to Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6 md:py-10">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          My Wishlist
        </h1>
        <p className="text-muted-foreground">
          {wishlistCourses.length} course{wishlistCourses.length !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      {/* Course Grid */}
      {loading ? (
        /* Loading State */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : wishlistCourses.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 animate-scale-in">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">
              Start exploring our courses and save the ones you're interested in.
            </p>
            <Button size="lg" asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {wishlistCourses.map((course, index) => (
            <div
              key={course.courseId}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CourseCard 
                course={course} 
                className="hover-scale"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}