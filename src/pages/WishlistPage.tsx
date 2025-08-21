import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Dummy data for wishlist courses
const wishlistCourses = [
  {
    courseId: "1",
    category: "FULLSTACK",
    photo_url: "https://placehold.co/600x400",
    headTeacher: 42,
    title: "Fullstack Web Development",
    description: "Learn to build modern web applications from scratch using modern technologies and best practices.",
    level: "BEGINNER",
    lessonCount: 24,
    studentCount: 1200,
    rating: 4.5,
    price: 199,
  },
  {
    courseId: "2",
    category: "FRONTEND",
    photo_url: "https://placehold.co/600x400",
    headTeacher: 56,
    title: "React Mastery",
    description: "Advanced techniques and best practices in React development for professional applications.",
    level: "INTERMEDIATE",
    lessonCount: 18,
    studentCount: 900,
    rating: 4.8,
    price: 149,
  },
  {
    courseId: "3",
    category: "BACKEND",
    photo_url: "https://placehold.co/600x400",
    headTeacher: 31,
    title: "Node.js & Express",
    description: "Build scalable backend applications with Node.js, Express, and modern database technologies.",
    level: "INTERMEDIATE",
    lessonCount: 20,
    studentCount: 750,
    rating: 4.6,
    price: 179,
  },
  {
    courseId: "4",
    category: "MOBILE",
    photo_url: "https://placehold.co/600x400",
    headTeacher: 28,
    title: "React Native Development",
    description: "Create cross-platform mobile applications using React Native and modern mobile development patterns.",
    level: "ADVANCED",
    lessonCount: 16,
    studentCount: 650,
    rating: 4.7,
    price: 229,
  },
];

interface Course {
  courseId: string;
  category: string;
  photo_url: string;
  headTeacher: number;
  title: string;
  description: string;
  level: string;
  lessonCount: number;
  studentCount: number;
  rating: number;
  price: number;
}

interface CourseCardProps {
  course: Course;
  onRemoveFromWishlist: (courseId: string) => void;
}

function WishlistCourseCard({ course, onRemoveFromWishlist }: CourseCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(true);
  
  const handleWishlistToggle = () => {
    setIsWishlisted(false);
    onRemoveFromWishlist(course.courseId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FULLSTACK': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'FRONTEND': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'BACKEND': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'MOBILE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'ADVANCED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="animate-scale-in">
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group hover-scale">
        <div className="relative">
          {/* Course Image */}
          <div className="aspect-video relative overflow-hidden">
            <img
              src={course.photo_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Wishlist Heart Button */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 h-10 w-10 p-0 bg-white/80 backdrop-blur hover:bg-white/90 hover:scale-110 transition-all duration-200"
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`text-xs font-medium ${getCategoryColor(course.category)}`}>
              {course.category}
            </Badge>
            <Badge className={`text-xs font-medium ${getLevelColor(course.level)}`}>
              {course.level}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            
            {/* Teacher */}
            <p className="text-sm text-muted-foreground">
              Teacher #{course.headTeacher}
            </p>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {/* Lessons Count */}
                <span className="text-muted-foreground">
                  {course.lessonCount} lessons
                </span>
                
                {/* Students Count */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{course.studentCount.toLocaleString()} students</span>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">{course.rating}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-primary">
              ${course.price}
            </span>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to={`/courses/${course.courseId}`}>
              View Course
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState(wishlistCourses);

  const handleRemoveFromWishlist = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.courseId !== courseId));
  };

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
          {courses.length} course{courses.length !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
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
          {courses.map((course, index) => (
            <div
              key={course.courseId}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <WishlistCourseCard 
                course={course} 
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}