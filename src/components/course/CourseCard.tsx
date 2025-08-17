import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Clock, Users, Heart } from "lucide-react";
import { Course } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  showWishlist?: boolean;
  onWishlistToggle?: (courseId: string) => void;
  isWishlisted?: boolean;
  className?: string;
}

export function CourseCard({ 
  course, 
  showWishlist = true, 
  onWishlistToggle,
  isWishlisted = false,
  className 
}: CourseCardProps) {
  
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(course?.courseId);
    }
  };

  return (
    <Card className={cn("course-card group", className)}>
      <div className="relative overflow-hidden">
        {/* Course Image */}
        <div className="aspect-video bg-gradient-muted relative">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-semibold">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        {showWishlist && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-card/80 backdrop-blur hover:bg-card"
            onClick={handleWishlistClick}
          >
            <Heart className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )} />
          </Button>
        )}

        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-card/80 backdrop-blur"
        >
          {course.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">by</span>
            <span className="font-medium text-primary">{course.teacherName}</span>
          </div>

          {/* Course Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.studentsCount}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary">
            ${course.price}
          </span>
        </div>
        
        <Button className="btn-hero" asChild>
          <Link to={`/courses/${course?.courseId}`}>
            View Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CourseCardSkeleton() {
  return (
    <Card className="course-card">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-4 bg-muted rounded w-16 animate-pulse" />
            <div className="h-4 bg-muted rounded w-16 animate-pulse" />
            <div className="h-4 bg-muted rounded w-16 animate-pulse" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="h-8 bg-muted rounded w-16 animate-pulse" />
        <div className="h-10 bg-muted rounded w-24 animate-pulse" />
      </CardFooter>
    </Card>
  );
}