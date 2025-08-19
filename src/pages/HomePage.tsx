import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseCard, CourseCardSkeleton } from "@/components/course/CourseCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, Course } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, BookOpen, Users, GraduationCap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";

export default function HomePage() {
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const roles: string[] = Array.isArray(user?.role)
    ? (user?.role as string[])
    : ((user as any)?.roles || JSON.parse(localStorage.getItem('auth_roles') || '[]'));

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, categoriesResponse] = await Promise.all([
        api.getPopularCourses(),
        api.getCategories()
      ]);
      setPopularCourses(Array.isArray(coursesResponse) ? coursesResponse : []);
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const stats = [
    { label: "Active Courses", value: "10K+", icon: BookOpen },
    { label: "Students", value: "50K+", icon: Users },
    { label: "Expert Teachers", value: "1K+", icon: GraduationCap },
    { label: "Success Rate", value: "95%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative container mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Learn Without Limits
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto animate-slide-up">
            Access thousands of courses from expert instructors and advance your skills
            at your own pace.
          </p>
          
          {/* Hero Search */}
          <div className="max-w-2xl mx-auto mb-8 animate-scale-in">
            <div className="flex gap-2 bg-white/10 backdrop-blur p-2 rounded-lg">
              <Input
                type="search"
                placeholder="What do you want to learn today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white/90 text-gray-900 border-0 placeholder:text-gray-600"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                className="bg-accent hover:bg-accent-light text-accent-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
            <Button size="lg" className="btn-hero" asChild>
              <Link to="/courses">Explore Courses</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <Link to="/auth?mode=register">Get Started Free</Link>
            </Button>
            
            {/* Role-based Panel Buttons */}
            {user && roles?.includes('STUDENT') && (
              <Button
                size="lg"
                onClick={() => navigate('/student')}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 rounded-full px-6"
              >
                Student Panel
              </Button>
            )}
            
            {user && roles?.includes('TEACHER') && (
              <Button
                size="lg"
                onClick={() => navigate('/teacher')}
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 rounded-full px-6"
              >
                Teacher Panel
              </Button>
            )}
            
            {user?.role?.includes?.('ADMIN') && (
              <Button
                size="lg"
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:from-red-400 hover:via-pink-400 hover:to-rose-400 rounded-full px-6"
              >
                Admin Panel
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Categories</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover courses across diverse subjects and advance your skills
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.slice(0, 8).map((category, index) => (
              <div 
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/courses?category=${encodeURIComponent(category?.category)}`}>
                  <Badge 
                    variant="secondary" 
                    className="text-sm py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {category?.category}
                  </Badge>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link to="/courses">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Courses</h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of learners in our most popular courses
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))
              : popularCourses.slice(0, 8).map((course, index) => (
                  <div 
                    key={course?.courseId}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CourseCard course={course} />
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join millions of learners worldwide and start your journey today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/auth?mode=register">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link to="/teachers">Become an Instructor</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}