import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, TeacherProfile, Course } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Briefcase,
  CalendarDays,
  Award,
  Link2,
  Star,
} from "lucide-react";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

function courseHasLevel(course: Course): course is Course & { level?: string } {
  return Object.prototype.hasOwnProperty.call(course, "level");
}

export default function TeacherProfilePage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const teacherIdNum = Number(teacherId);
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery<TeacherProfile, Error>({
    queryKey: ["teacher-profile", teacherIdNum],
    queryFn: () => api.getTeacherProfile(teacherIdNum),
    enabled: Number.isFinite(teacherIdNum),
    staleTime: 60_000,
  });

  const { data: teacherCourses, isLoading: isCoursesLoading } = useQuery<Course[], Error>({
    queryKey: ["teacher-courses", teacherIdNum],
    queryFn: () => api.getTeacherCourses(),
    enabled: Number.isFinite(teacherIdNum),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Teacher Profile</CardTitle>
            <CardDescription>Unknown Teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {error?.message || "Please try again later."}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${data.firstName} ${data.lastName}`.trim();

  return (
    <>
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <Card className="shadow-xl">
          <CardHeader className="pb-0">
            <div className="relative">
              <div className="h-32 w-full rounded-lg bg-gradient-to-r from-primary/25 via-secondary/25 to-accent/25" />
              <div className="absolute -bottom-8 left-6 flex items-end gap-4">
                <Avatar className="h-20 w-20 ring-2 ring-background shadow-md">
                  {data.teacherPhoto ? (
                    <AvatarImage src={data.teacherPhoto} alt={fullName} />
                  ) : null}
                  <AvatarFallback className="text-lg font-semibold">
                    {fullName
                      .split(" ")
                      .map((p) => p.charAt(0))
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-2">
                  <CardTitle className="text-2xl md:text-3xl">
                    {fullName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {data.email}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 rounded-md border bg-card/50 p-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <span className="font-semibold">Speciality:</span>{" "}
                  {data.speciality}
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border bg-card/50 p-3">
                <Award className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <span className="font-semibold">Experience:</span>{" "}
                  {data.experienceYears} years
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border bg-card/50 p-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <span className="font-semibold">Hire date:</span>{" "}
                  {formatDate(data.hireDate)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Bio</div>
              <p className="text-sm leading-7 text-muted-foreground whitespace-pre-line bg-muted/30 rounded-md p-4">
                {data.bio}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold mb-2">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {(data.skills || []).length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No skills listed
                    </span>
                  ) : (
                    data.skills.map((s, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {s}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Social Links</div>
                <div className="flex flex-col gap-2">
                  {(data.socialLink || []).length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No social links
                    </span>
                  ) : (
                    data.socialLink.map((link, i) => {
                      const safe = String(link || "");
                      return (
                        <a
                          key={i}
                          href={safe}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-primary underline break-all"
                        >
                          <Link2 className="h-4 w-4" />
                          {safe}
                        </a>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Courses */}
      <div className="container mx-auto max-w-5xl px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Courses by {data.firstName}</h3>
        </div>

        {isCoursesLoading ? (
          <div className="py-6 text-center text-muted-foreground">
            Loading courses...
          </div>
        ) : (teacherCourses || []).length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No courses to display.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(teacherCourses || []).map((course) => (
              <button
                key={course.courseId}
                onClick={() => navigate(`/courses/${course.courseId}`)}
                className="text-left group rounded-lg border bg-card hover:shadow-md transition-all overflow-hidden"
              >
                {course.photo_url ? (
                  <img
                    src={course.photo_url}
                    alt={course.title}
                    className="w-full h-24 object-cover group-hover:scale-[1.02] transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="w-full h-24 bg-muted flex items-center justify-center text-lg font-semibold">
                    {course.title?.charAt(0) || "?"}
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="text-sm font-semibold line-clamp-1">
                    {course.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-[2px] rounded-full bg-muted">
                      {course.category || "Uncategorized"}
                    </span>
                    <span className="text-[11px] px-2 py-[2px] rounded-full border">
                      {courseHasLevel(course) && course.level ? course.level : "LEVEL -"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span>{Number(course.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      ${Number(course.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
