import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  BookOpen, 
  PlayCircle, 
  User, 
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { CourseManagement } from "@/components/teacher/CourseManagement";
import { LessonManagement } from "@/components/teacher/LessonManagement";
import { TeacherProfile } from "@/components/teacher/TeacherProfile";

export default function TeacherPanelPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Teacher Panel</h1>
              <p className="text-muted-foreground mt-1">Manage your courses and track your success</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Quick Actions
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <TeacherDashboard />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <LessonManagement />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <TeacherProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}