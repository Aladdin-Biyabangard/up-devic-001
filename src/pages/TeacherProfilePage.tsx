import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, TeacherProfile } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Briefcase, CalendarDays, Award, Link2 } from "lucide-react";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

export default function TeacherProfilePage() {
  const { teacherId = "" } = useParams();

  const { data, isLoading, isError, error } = useQuery<TeacherProfile>({
    queryKey: ["teacher-profile", teacherId],
    queryFn: () => api.getTeacherProfile(teacherId!),
    enabled: Boolean(teacherId),
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
              {(error as any)?.message || "Please try again later."}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${data.firstName} ${data.lastName}`.trim();

  return (
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
                  {fullName.split(" ").map((p) => p.charAt(0)).join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <CardTitle className="text-2xl md:text-3xl">{fullName}</CardTitle>
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
              <div className="text-sm"><span className="font-semibold">Speciality:</span> {data.speciality}</div>
            </div>
            <div className="flex items-center gap-3 rounded-md border bg-card/50 p-3">
              <Award className="h-5 w-5 text-primary" />
              <div className="text-sm"><span className="font-semibold">Experience:</span> {data.experienceYears} years</div>
            </div>
            <div className="flex items-center gap-3 rounded-md border bg-card/50 p-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div className="text-sm"><span className="font-semibold">Hire date:</span> {formatDate(data.hireDate)}</div>
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
                  <span className="text-sm text-muted-foreground">No skills listed</span>
                ) : (
                  data.skills.map((s, i) => (
                    <Badge key={i} variant="secondary" className="rounded-full">{s}</Badge>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Social Links</div>
              <div className="flex flex-col gap-2">
                {(data.socialLink || []).length === 0 ? (
                  <span className="text-sm text-muted-foreground">No social links</span>
                ) : (
                  data.socialLink.map((link, i) => {
                    const safe = String(link || "");
                    return (
                      <a key={i} href={safe} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary underline break-all">
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
  );
}


