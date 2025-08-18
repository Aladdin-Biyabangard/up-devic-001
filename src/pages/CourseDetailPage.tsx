import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api, Course, Lesson, Comment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, Users, Tag } from "lucide-react";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [courseRes, lessonsRes, commentsRes] = await Promise.all([
          api.getCourse(courseId),
          api.getLessonsByCourse(courseId),
          api.getCourseComments(courseId)
        ]);

        setCourse(courseRes as Course);
        setLessons(Array.isArray(lessonsRes) ? (lessonsRes as Lesson[]) : []);
        setComments(Array.isArray(commentsRes) ? (commentsRes as Comment[]) : []);
      } catch (error) {
        console.error("Failed to load course detail:", error);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
        <p className="text-muted-foreground">The course you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-muted overflow-hidden rounded-lg">
            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground text-4xl font-semibold">
                  {course.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{course.category}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{course.teacherName}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>${course.price}</span>
                </div>
              </div>
              <Separator />
              <Button className="w-full btn-hero">Start Learning</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({comments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>About this course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-7 whitespace-pre-line">{course.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-muted-foreground">No lessons available yet.</p>
              ) : (
                <div className="space-y-3">
                  {lessons
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <div key={lesson.id} className="p-3 rounded-md border bg-card flex items-center justify-between">
                        <div>
                          <div className="font-medium">{lesson.order}. {lesson.title}</div>
                          {lesson.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{c.authorName}</div>
                        {typeof c.rating === "number" && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{c.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{new Date(c.createdAt).toLocaleDateString()}</div>
                      <div>{c.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


