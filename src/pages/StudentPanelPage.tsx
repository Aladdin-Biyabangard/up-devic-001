import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type StudentCourse = {
  courseId: string;
  title: string;
  photo_url?: string;
  headTeacher?: { firstName: string; lastName: string };
  category?: string;
  level?: string;
  lessonCount?: number;
  studentsCount?: number;
  rating?: number;
  price?: number;
};

export default function StudentPanelPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [courseDetails, setCourseDetails] = useState<any | null>(null);
  const [confirmUnenrollId, setConfirmUnenrollId] = useState<string | null>(
    null
  );
  const [becomeTeacherLoading, setBecomeTeacherLoading] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await api.getStudentCourses();
        setCourses(Array.isArray(data) ? data : data?.content ?? []);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Failed to load courses",
          description: String(error?.message || error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [toast]);

  // const loadCourseDetails = async (courseId: string) => {
  //   try {
  //     setSelectedCourseId(courseId);
  //     setDetailsLoading(true);
  //     const details = await api.getStudentCourseDetails(courseId);
  //     setCourseDetails(details);
  //   } catch (error: any) {
  //     console.error(error);
  //     toast({ title: "Failed to load course details", description: String(error?.message || error), variant: "destructive" });
  //   } finally {
  //     setDetailsLoading(false);
  //   }
  // };

  const unenroll = async (courseId: string) => {
    try {
      await api.unenrollFromCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
        setCourseDetails(null);
      }
      toast({
        title: "Unenrolled",
        description: "You have been unenrolled from the course.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Failed to unenroll",
        description: String(error?.message || error),
        variant: "destructive",
      });
    } finally {
      setConfirmUnenrollId(null);
    }
  };

  const becomeTeacher = async () => {
    try {
      setBecomeTeacherLoading(true);
      await api.requestToBecomeTeacher();
      toast({
        title: "Request submitted",
        description: "Your request to become a teacher has been sent.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Failed to submit request",
        description: String(error?.message || error),
        variant: "destructive",
      });
    } finally {
      setBecomeTeacherLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Panel</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button
            className="btn-hero"
            disabled={becomeTeacherLoading}
            onClick={becomeTeacher}
          >
            {becomeTeacherLoading ? "Submitting..." : "Become a Teacher"}
          </Button>
        </div>
      </div>

      <div className="gap-6">
        <div className="w-full space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <LoadingSpinner />
                </div>
              ) : courses.length === 0 ? (
                <p className="text-muted-foreground">
                  You are not enrolled in any courses yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <Card key={course.courseId} className="overflow-hidden">
                      {course.photo_url && (
                        <img
                          src={course.photo_url}
                          alt={course.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <CardHeader className="space-y-1">
                        <CardTitle className="text-lg">
                          {course.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {course.headTeacher && (
                            <span>
                              By {course.headTeacher.firstName}{" "}
                              {course.headTeacher.lastName}
                            </span>
                          )}
                          {course.category && (
                            <Badge variant="secondary">{course.category}</Badge>
                          )}
                          {course.level && (
                            <Badge variant="outline">{course.level}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {typeof course.lessonCount !== "undefined" && (
                            <div>
                              Lessons:{" "}
                              <strong className="text-foreground">
                                {course.lessonCount}
                              </strong>
                            </div>
                          )}
                          {typeof course.studentsCount !== "undefined" && (
                            <div>
                              Students:{" "}
                              <strong className="text-foreground">
                                {course.studentsCount}
                              </strong>
                            </div>
                          )}
                          {typeof course.rating !== "undefined" && (
                            <div>
                              Rating:{" "}
                              <strong className="text-foreground">
                                {course.rating}
                              </strong>
                            </div>
                          )}
                          {typeof course.price !== "undefined" && (
                            <div>
                              Price:{" "}
                              <strong className="text-foreground">
                                ${course.price}
                              </strong>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button className="btn-hero" asChild>
                            <Link to={`/courses/${course?.courseId}`}>
                              View Course
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              setConfirmUnenrollId(course.courseId)
                            }
                          >
                            Unenroll
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCourseId && <p className="text-muted-foreground">Select a course to view its details.</p>}
              {selectedCourseId && detailsLoading && (
                <div className="flex items-center justify-center py-6"><LoadingSpinner /></div>
              )}
              {selectedCourseId && !detailsLoading && courseDetails && (
                <div className="space-y-3">
                  {courseDetails.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{courseDetails.description}</p>
                  )}
                  {/* Placeholder fields if available */}
        {/* {typeof courseDetails.progress !== 'undefined' && (
                    <div className="text-sm">Progress: <strong>{courseDetails.progress}%</strong></div>
                  )}
                  {Array.isArray(courseDetails.schedule) && courseDetails.schedule.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Upcoming Lessons</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {courseDetails.schedule.map((item: any, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}
      </div>

      <Dialog
        open={!!confirmUnenrollId}
        onOpenChange={() => setConfirmUnenrollId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unenroll from course</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll? You might lose access to course
              materials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmUnenrollId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmUnenrollId && unenroll(confirmUnenrollId)}
            >
              Unenroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
