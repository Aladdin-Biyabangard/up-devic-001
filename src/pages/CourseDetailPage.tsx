import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api, Lesson, Comment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Star, Users, Tag, BookOpen, GraduationCap, Calendar } from "lucide-react";

interface ExtendedComment extends Comment {
  firstName?: string;
}

interface CommentsPage {
  content?: ExtendedComment[];
}

interface CourseDetail {
  photo_url: string | null;
  headTeacher: string;
  teachers: string[];
  title: string;
  description: string;
  level: string;
  createdAt: string;
  lessonCount: number;
  studentCount: number;
  teacherCount: number;
  rating: number;
  price: number;
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [comments, setComments] = useState<ExtendedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        setLoading(true);
        const [courseRes,lessonsRes,commentsRes] = await Promise.all([
          api.getCourse(courseId),
          api.getLessonsByCourse(courseId),
          api.getCourseComments(courseId)
        ]);

        // Coerce/normalize response to CourseDetail shape
        const c = courseRes as Partial<CourseDetail>;
        setCourse({
          photo_url: c.photo_url ?? null,
          headTeacher: c.headTeacher ?? "",
          teachers: Array.isArray(c.teachers) ? c.teachers : [],
          title: c.title ?? "",
          description: c.description ?? "",
          level: c.level ?? "BEGINNER",
          createdAt: c.createdAt ?? new Date().toISOString(),
          lessonCount: typeof c.lessonCount === "number" ? c.lessonCount : Array.isArray(lessonsRes) ? lessonsRes.length : 0,
          studentCount: c.studentCount ?? 0,
          teacherCount: c.teacherCount ?? (Array.isArray(c.teachers) ? c.teachers.length : 0),
          rating: typeof c.rating === "number" ? c.rating : 0,
          price: typeof c.price === "number" ? c.price : 0,
        });

        setLessons(Array.isArray(lessonsRes) ? (lessonsRes as Lesson[]) : []);
        const page = commentsRes as CommentsPage;
        const list = Array.isArray(page?.content)
          ? page.content
          : (Array.isArray(commentsRes as unknown as ExtendedComment[])
              ? (commentsRes as unknown as ExtendedComment[])
              : []);
        setComments(list);
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

  const createdDate = new Date(course.createdAt).toLocaleDateString();
  const levelLabel = course.level?.toString().replace(/_/g, " ");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-muted overflow-hidden rounded-lg">
            {course.photo_url ? (
              <img src={course.photo_url} alt={course.title} className="w-full h-full object-cover" />
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
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{levelLabel}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{course.headTeacher}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessonCount} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.studentCount} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{course.teacherCount} teachers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {createdDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>${course.price.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <Button className="w-full btn-hero">Start Learning</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Teacher list */}
      {course.teachers?.length > 0 && (
        <div className="mb-8">
          <div className="text-sm font-medium text-muted-foreground mb-2">Teachers</div>
          <div className="flex flex-wrap gap-2">
            {course.teachers.map((t, idx) => (
              <Badge key={`${t}-${idx}`} variant="outline">{t}</Badge>
            ))}
          </div>
        </div>
      )}

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
                          {/* Duration not available in provided data; hide if missing */}
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
                        <div className="font-medium">{c.firstName ?? c.authorName}</div>
                        {typeof c.rating === "number" && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{c.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{new Date(c.updatedAt).toLocaleDateString()}</div>
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


