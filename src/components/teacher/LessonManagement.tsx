import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  PlayCircle, 
  Clock,
  Upload,
  FileVideo,
  FileText,
  Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration?: string;
  courseId: string;
  courseName: string;
  order?: number;
  photoUrl?: string;
}

interface Course { courseId: string; title: string }

export function LessonManagement() {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);
  const [mutating, setMutating] = useState<boolean>(false);

  const courseListQuery = useQuery({
    queryKey: ["teacher-courses-simple"],
    queryFn: async (): Promise<any[]> => (await api.getTeacherCourses()) as any[],
    staleTime: 60_000,
  });
  const courseList = courseListQuery.data as any[] | undefined;

  // Load lessons for teacher courses
  useEffect(() => {
    const load = async () => {
      if (!courseList || courseList.length === 0) return;
      setLoadingLessons(true);
      try {
        const all: Lesson[] = [];
        for (const c of courseList) {
          try {
            const items = await api.getLessonsByCourse(String(c.courseId));
            const mapped = (items || []).map((li: any) => ({
              id: String(li.lessonId ?? li.id ?? ""),
              title: li.title,
              description: li.description,
              duration: li.duration,
              order: li.order,
              photoUrl: li.photoUrl,
              courseId: String(c.courseId),
              courseName: c.title,
            })) as Lesson[];
            all.push(...mapped);
          } catch {}
        }
        setLessons(all);
      } catch (e: any) {
        toast({ title: "Failed to load lessons", description: e?.message, variant: "destructive" as any });
      } finally {
        setLoadingLessons(false);
      }
    };
    load();
  }, [courseList]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    duration: "",
    courseId: "",
    videoFile: null as File | null,
    materials: [] as File[]
  });
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const groupedLessons = lessons.reduce((groups, lesson) => {
    const courseName = lesson.courseName;
    if (!groups[courseName]) {
      groups[courseName] = [];
    }
    groups[courseName].push(lesson);
    return groups;
  }, {} as Record<string, Lesson[]>);

  const handleCreateLesson = async () => {
    try {
      const selected = (courseList || []).find((c: any) => String(c.courseId) === newLesson.courseId);
      if (!selected) return;
      setMutating(true);
      await api.createLesson(String(selected.courseId), {
        title: newLesson.title,
        description: newLesson.description,
        videoFile: newLesson.videoFile,
      });
      toast({ title: "Lesson created" });
      setNewLesson({ title: "", description: "", duration: "", courseId: "", videoFile: null, materials: [] });
      setIsCreateModalOpen(false);
      // Refresh lessons for this course only
      const items = await api.getLessonsByCourse(String(selected.courseId));
      const mapped = (items || []).map((li: any) => ({
        id: String(li.lessonId ?? li.id ?? ""),
        title: li.title,
        description: li.description,
        duration: li.duration,
        order: li.order,
        photoUrl: li.photoUrl,
        courseId: String(selected.courseId),
        courseName: selected.title,
      })) as Lesson[];
      setLessons((prev) => [...prev.filter(l => l.courseId !== String(selected.courseId)), ...mapped]);
    } catch (e: any) {
      toast({ title: "Failed to create lesson", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    try {
      setMutating(true);
      const token = localStorage.getItem('auth_token');
      const res = await axios.delete(`${API_BASE_URL}/v1/lessons/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Accept': 'application/json, text/plain, */*'
        }
      });
      if (res.status === 204 || res.status === 200) {
        toast({ title: "Lesson deleted" });
        setLessons((prev) => prev.filter(lesson => lesson.id !== id));
      } else {
        throw new Error(`Unexpected status ${res.status}`);
      }
    } catch (e: any) {
      toast({ title: "Failed to delete", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;
    try {
      setMutating(true);
      await api.updateLesson(String(editingLesson.id), {
        title: editingLesson.title,
        description: editingLesson.description,
      });
      toast({ title: "Lesson updated" });
      setEditingLesson(null);
      setLessons((prev) => prev.map(l => l.id === editingLesson.id ? { ...l, title: editingLesson.title, description: editingLesson.description } : l));
    } catch (e: any) {
      toast({ title: "Failed to update", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
    }
  };

  // Photo upload handling
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUploadLessonId, setPhotoUploadLessonId] = useState<string | null>(null);
  const triggerPhotoUpload = (lessonId: string) => {
    setPhotoUploadLessonId(lessonId);
    photoInputRef.current?.click();
  };
  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoUploadLessonId) return;
    try {
      setMutating(true);
      const token = localStorage.getItem('auth_token');
      const form = new FormData();
      form.append('multipartFile', file);
      const res = await axios.patch(`${API_BASE_URL}/v1/lessons/${photoUploadLessonId}/photo`, form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Accept': 'application/json, text/plain, */*'
        }
      });
      if (res.status === 204 || res.status === 200) {
        toast({ title: "Lesson photo updated" });
        const previewUrl = URL.createObjectURL(file);
        setLessons((prev) => prev.map(l => l.id === photoUploadLessonId ? { ...l, photoUrl: previewUrl } : l));
        setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
      } else {
        throw new Error(`Unexpected status ${res.status}`);
      }
    } catch (e: any) {
      toast({ title: "Failed to upload photo", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
      setPhotoUploadLessonId(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lesson Management</h2>
          <p className="text-muted-foreground">Create and organize lessons for your courses</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lesson</DialogTitle>
              <DialogDescription>
                Add a new lesson to your course
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="course-select">Course</Label>
                <Select onValueChange={(value) => setNewLesson({...newLesson, courseId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {(courseList || []).map((course: any) => (
                      <SelectItem key={course.courseId} value={String(course.courseId)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson Title</Label>
                <Input
                  id="lesson-title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  placeholder="Enter lesson title"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="lesson-description">Description</Label>
                <Textarea
                  id="lesson-description"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                  placeholder="Describe what students will learn"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (mm:ss)</Label>
                <Input
                  id="duration"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                  placeholder="15:30"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Video Upload</Label>
                <div
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) setNewLesson({ ...newLesson, videoFile: f });
                  }}
                >
                  <FileVideo className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => setNewLesson({ ...newLesson, videoFile: e.target.files?.[0] || null })} />
                  <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2 break-words">
                    MP4, MOV up to 500MB {newLesson.videoFile ? `• Selected: ${newLesson.videoFile.name}` : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Course Materials</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Materials
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    PDF, ZIP, DOC files
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLesson} disabled={mutating}>
                {mutating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Lesson"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lessons by Course */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons by Course</CardTitle>
          <CardDescription>
            Organize and manage lessons for each course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedLessons).map(([courseName, courseLessons]) => (
              <AccordionItem key={courseName} value={courseName}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center justify-between w-full mr-4">
                    <span className="font-medium">{courseName}</span>
                    <Badge variant="outline">
                      {courseLessons.length} lesson{courseLessons.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {courseLessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <PlayCircle className="h-4 w-4 text-primary" />
                              <span className="font-medium">{lesson.title}</span>
                              <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                                {lesson.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {lesson.duration}
                              </span>
                              <span>Order: {lesson.order}</span>
                              {lesson.materials && lesson.materials.length > 0 && (
                                <span className="flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  {lesson.materials.length} file{lesson.materials.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {lesson.materials && lesson.materials.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {lesson.materials.map((material, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    {material}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-28 h-16 bg-muted rounded overflow-hidden">
                              {lesson.photoUrl ? (
                                <img src={lesson.photoUrl} alt={lesson.title} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }} />
                              ) : (
                                <img src="/placeholder.svg" alt="placeholder" className="w-full h-full object-cover opacity-80" />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => triggerPhotoUpload(lesson.id)}
                            >
                              <Upload className="h-4 w-4 mr-1" /> Change Photo
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePublishStatus(lesson.id)}
                            >
                              {lesson.isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this lesson?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Edit Lesson Dialog */}
      {editingLesson && (
        <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Lesson</DialogTitle>
              <DialogDescription>
                Update lesson details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-title">Lesson Title</Label>
                <Input
                  id="edit-lesson-title"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-description">Description</Label>
                <Textarea
                  id="edit-lesson-description"
                  value={editingLesson.description}
                  onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    value={editingLesson.duration}
                    onChange={(e) => setEditingLesson({...editingLesson, duration: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-order">Order</Label>
                  <Input
                    id="edit-order"
                    type="number"
                    value={editingLesson.order}
                    onChange={(e) => setEditingLesson({...editingLesson, order: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingLesson(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateLesson}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}