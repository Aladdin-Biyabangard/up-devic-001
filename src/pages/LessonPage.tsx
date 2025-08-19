import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock } from "lucide-react";

type LessonDetail = {
  lessonId: string;
  photoUrl?: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration?: string;
};

type PagedLessonComments = {
  content: Array<{
    commentId: string | number;
    firstName: string;
    content: string;
    updatedAt: string;
  }>;
  page: number;
  size: number;
};

const initialAvatar = (name?: string) => (name ? name.trim().charAt(0).toUpperCase() : "?");
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "");

const LessonPage = () => {
  const { lessonId = "" } = useParams();
  const navigate = useNavigate();
  const [commentsPage, setCommentsPage] = useState(0);
  const pageSize = 10;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: lesson,
    isLoading: isLessonLoading,
    isError: isLessonError,
    error: lessonError,
    refetch: refetchLesson,
  } = useQuery<LessonDetail>({
    queryKey: ["lesson-detail", lessonId],
    queryFn: () => api.getLesson(lessonId),
    enabled: !!lessonId,
    staleTime: 60_000,
  });

  const {
    data: commentsResp,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["lesson-comments", lessonId, commentsPage, pageSize],
    queryFn: () => api.getLessonCommentsPaged(lessonId, commentsPage, pageSize) as Promise<any>,
    staleTime: 30_000,
  }) as any;

  const comments = commentsResp?.content ?? [];
  const canGoNext = (comments?.length ?? 0) === pageSize;

  useEffect(() => {
    refetchComments();
  }, [commentsPage]);

  // Set up 5-minute interval for lesson access verification
  useEffect(() => {
    if (!lessonId) return;

    const verifyLessonAccess = async () => {
      try {
        await api.getLesson(lessonId);
      } catch (error: any) {
        // Check if it's an authentication error
        if (error?.message?.includes('Authentication failed') || 
            error?.status === 401 || 
            error?.status === 403) {
          // Clear interval and redirect to login
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          navigate('/auth');
        }
      }
    };

    // Set up interval for every 5 minutes (300000 ms)
    intervalRef.current = setInterval(verifyLessonAccess, 300000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [lessonId, navigate]);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[360px] overflow-hidden">
        {isLessonLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <LoadingSpinner size="lg" />
          </div>
        ) : lesson?.photoUrl ? (
          <img src={lesson.photoUrl} alt={lesson?.title || "Lesson"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow">{lesson?.title || (isLessonError ? "Failed to load lesson" : "Loading...")}</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-6 md:py-10">
        <div className="mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
                <CardDescription>{isLessonLoading ? "Loading details..." : isLessonError ? (lessonError as any)?.message : "Watch the video and read the description"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLessonLoading ? (
                  <div className="flex items-center justify-center p-8"><LoadingSpinner /></div>
                ) : isLessonError ? (
                  <div className="text-sm text-destructive">{(lessonError as any)?.message || "Failed to load lesson."}</div>
                ) : (
                  <>
                    {lesson?.videoUrl ? (
                      <video src={lesson.videoUrl} controls className="w-full h-64 md:h-80 rounded-md bg-black" />
                    ) : lesson?.photoUrl ? (
                      <img src={lesson.photoUrl} alt={lesson?.title} className="w-full h-64 md:h-80 object-cover rounded-md" />
                    ) : null}
                    {lesson?.duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" /> Duration: {lesson.duration}
                      </div>
                    )}
                    <p className="text-base leading-7 text-foreground/90">{lesson?.description}</p>
                  </>
                )}
              </CardContent>
            </Card>

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
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">Page {commentsPage + 1}</div>
                  <Button variant="outline" onClick={() => setCommentsPage((p) => p + 1)} disabled={!canGoNext}>
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-md lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle>About this lesson</CardTitle>
                <CardDescription>Overview and duration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lesson?.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" /> {lesson.duration}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {lesson?.description?.slice(0, 160) || "This lesson covers key topics in this course."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;


