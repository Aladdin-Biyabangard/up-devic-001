import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { Star, Share2, Heart, Users, GraduationCap, BookOpen, CalendarDays, DollarSign, ArrowLeft, ArrowRight } from "lucide-react";

type CourseDetail = {
  photo_url: string;
  headTeacher: string;
  teachers: string[];
  title: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;
  createdAt: string;
  lessonCount: number;
  studentCount: number;
  teacherCount: number;
  rating: number;
  price: number;
};

type LessonItem = {
  lessonId: string;
  photoUrl?: string;
  title: string;
  description: string;
};

type PagedCommentsResponse = {
  content: Array<{
    commentId: string;
    firstName: string;
    content: string;
    updatedAt: string;
  }>;
};

const RatingStars = ({ value }: { value: number }) => {
  const rounded = Math.round(value * 2) / 2; // 0.5 steps
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = rounded >= idx + 1;
        const half = !filled && rounded >= idx + 0.5;
        return (
          <Star
            key={idx}
            className={`h-4 w-4 ${filled ? "fill-yellow-400 text-yellow-400" : half ? "text-yellow-400" : "text-muted-foreground"}`}
          />
        );
      })}
    </div>
  );
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const initialAvatar = (name?: string) => (name ? name.trim().charAt(0).toUpperCase() : "?");

const CourseDetailPage = () => {
  const { courseId = "cloud-course" } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(false);
  const [commentsPage, setCommentsPage] = useState(0);
  const commentsPageSize = 10;

  // Course details
  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
    error: courseError,
    refetch: refetchCourse,
  } = useQuery<CourseDetail>({
    queryKey: ["course-detail", courseId],
    queryFn: () => api.getCourse(courseId!),
    staleTime: 60_000,
  });

  // Lessons
  const {
    data: lessons,
    isLoading: isLessonsLoading,
    isError: isLessonsError,
    error: lessonsError,
    refetch: refetchLessons,
  } = useQuery<LessonItem[]>({
    queryKey: ["course-lessons", courseId],
    queryFn: () => api.getLessonsByCourse(courseId!),
    staleTime: 60_000,
  });

  // Comments (paged)
  const {
    data: commentsResponse,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery<PagedCommentsResponse>({
    queryKey: ["course-comments", courseId, commentsPage, commentsPageSize],
    queryFn: () => api.getCourseCommentsPaged(courseId!, commentsPage, commentsPageSize),
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const comments = commentsResponse?.content ?? [];
  const canGoNext = comments.length === commentsPageSize; // optimistic pagination

  const handleShare = async () => {
    try {
      const shareData = {
        title: course?.title || "Course",
        text: course?.description || "Check out this course",
        url: window.location.href,
      };
      if ((navigator as any).share) {
        await (navigator as any).share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      }
    } catch {
      // noop
    }
  };

  const handleEnroll = async () => {
    try {
      await api.checkout(courseId!);
      alert("Enrollment started. You'll be redirected to payment if applicable.");
    } catch (e) {
      alert("Failed to start enrollment. Please try again.");
    }
  };

  useEffect(() => {
    // refetch comments when page changes
    refetchComments();
  }, [commentsPage]);

  const bannerUrl = course?.photo_url;

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] overflow-hidden">
        {isCourseLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <LoadingSpinner size="lg" />
          </div>
        ) : bannerUrl ? (
          <img src={bannerUrl} alt={course?.title || "Course banner"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}

        {/* Overlay title */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {course?.level && (
              <Badge variant="secondary" className="bg-white/90 text-black">
                {course.level}
              </Badge>
            )}
            {course?.createdAt && (
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <CalendarDays className="h-4 w-4" />
                {formatDate(course.createdAt)}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow">
            {course?.title || (isCourseError ? "Failed to load course" : "Loading...")}
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-10">
        {/* Actions and summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Course Info Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  <span>About this course</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 /> Share
                    </Button>
                    <Button variant={wishlist ? "secondary" : "outline"} onClick={() => setWishlist((v) => !v)}>
                      <Heart className={wishlist ? "fill-red-500 text-red-500" : ""} />
                      {wishlist ? "Wishlisted" : "Add to Wishlist"}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {isCourseLoading && "Loading course details..."}
                  {isCourseError && (courseError as any)?.message}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base leading-7 text-muted-foreground">
                  {course?.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div className="text-sm"><span className="font-semibold">Lessons:</span> {course?.lessonCount ?? "-"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="text-sm"><span className="font-semibold">Students:</span> {course?.studentCount ?? "-"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <div className="text-sm"><span className="font-semibold">Teachers:</span> {course?.teacherCount ?? "-"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <div className="text-sm flex items-center gap-2">
                      <RatingStars value={course?.rating || 0} />
                      <span className="text-muted-foreground">{(course?.rating ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div className="text-sm"><span className="font-semibold">Price:</span> ${course?.price?.toFixed(2) ?? "0.00"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teachers */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Teachers</CardTitle>
                <CardDescription>Meet the head teacher and instructors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">Head Teacher</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initialAvatar(course?.headTeacher)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{course?.headTeacher}</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(course?.teachers || []).map((t, idx) => (
                    <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initialAvatar(t)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">{t}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lessons */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Lessons</CardTitle>
                <CardDescription>
                  {isLessonsLoading ? "Loading lessons..." : isLessonsError ? (lessonsError as any)?.message : `${lessons?.length ?? 0} lessons`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLessonsLoading ? (
                  <div className="flex justify-center p-6"><LoadingSpinner /></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(lessons || []).map((lesson) => (
                      <Dialog key={lesson.lessonId}>
                        <DialogTrigger asChild>
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            {lesson.photoUrl ? (
                              <img src={lesson.photoUrl} alt={lesson.title} className="w-full h-36 object-cover rounded-t-lg" />
                            ) : (
                              <div className="w-full h-36 bg-accent rounded-t-lg" />
                            )}
                            <div className="p-4">
                              <div className="font-semibold line-clamp-1">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</div>
                            </div>
                          </Card>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{lesson.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            {lesson.photoUrl && (
                              <img src={lesson.photoUrl} alt={lesson.title} className="w-full h-48 object-cover rounded-md" />
                            )}
                            <p className="text-muted-foreground">{lesson.description}</p>
                            <p className="text-sm text-muted-foreground">More details coming soon.</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>
                  {isCommentsLoading ? "Loading comments..." : isCommentsError ? (commentsError as any)?.message : `${comments.length} comments on this page`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCommentsLoading ? (
                  <div className="flex justify-center p-6"><LoadingSpinner /></div>
                ) : comments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No comments yet.</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.commentId} className="p-4 rounded-md border bg-card/50 hover:bg-accent/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{initialAvatar(c.firstName)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{c.firstName}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(c.updatedAt)}</div>
                      </div>
                      <p className="mt-2 text-sm text-foreground/90">{c.content}</p>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" onClick={() => setCommentsPage((p) => Math.max(0, p - 1))} disabled={commentsPage === 0}>
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">Page {commentsPage + 1}</div>
                  <Button variant="outline" onClick={() => setCommentsPage((p) => p + 1)} disabled={!canGoNext}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky enroll card */}
          <div className="lg:col-span-1">
            <Card className="shadow-md lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Get this course</span>
                </CardTitle>
                <CardDescription>Enroll to start learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">${course?.price?.toFixed(2) ?? "0.00"}</div>
                <Button className="w-full" onClick={handleEnroll}>Enroll Now</Button>
                <Button variant="outline" className="w-full" onClick={handleShare}><Share2 /> Share Course</Button>
                <Button variant={wishlist ? "secondary" : "outline"} className="w-full" onClick={() => setWishlist((v) => !v)}>
                  <Heart className={wishlist ? "fill-red-500 text-red-500" : ""} />
                  {wishlist ? "Wishlisted" : "Add to Wishlist"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;


