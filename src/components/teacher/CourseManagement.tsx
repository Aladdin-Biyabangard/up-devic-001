import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Edit, Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, Course, CategoryDto, User } from "@/lib/api";

type EditableCourse = Course & { level?: string };

export function CourseManagement() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<EditableCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mutating, setMutating] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    level: "BEGINNER",
    price: "",
    category: "",
  });

  const [editingCourse, setEditingCourse] = useState<EditableCourse | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState<string | null>(null); // courseId or null
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadCourseId, setUploadCourseId] = useState<string | null>(null);

  const loadInitial = async () => {
    try {
      setLoading(true);
      const [courseList, cats] = await Promise.all([
        api.getTeacherCourses(),
        api.getCategories()
      ]);
      setCourses((courseList || []) as EditableCourse[]);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e: any) {
      toast({ title: "Failed to load courses", description: e?.message, variant: "destructive" as any });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const refreshCourses = async () => {
    try {
      const courseList = await api.getTeacherCourses();
      setCourses((courseList || []) as EditableCourse[]);
    } catch {}
  };

  const onCreateCourse = async () => {
    try {
      if (!createForm.title || !createForm.description || !createForm.level || !createForm.price || !createForm.category) {
        toast({ title: "Missing fields", description: "Please fill all fields.", variant: "destructive" as any });
        return;
      }
      setMutating(true);
      await api.createCourse({
        title: createForm.title,
        description: createForm.description,
        level: createForm.level,
        price: Number(createForm.price)
      }, createForm.category);
      toast({ title: "Course created" });
      setIsCreateOpen(false);
      setCreateForm({ title: "", description: "", level: "BEGINNER", price: "", category: "" });
      await refreshCourses();
    } catch (e: any) {
      toast({ title: "Failed to create course", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
    }
  };

  const onUpdateCourse = async () => {
    if (!editingCourse) return;
    try {
      setMutating(true);
      await api.updateCourse(editingCourse.courseId, {
        title: editingCourse.title,
        description: editingCourse.description,
        level: editingCourse.level,
        price: editingCourse.price,
      });
      toast({ title: "Course updated" });
      setEditingCourse(null);
      await refreshCourses();
    } catch (e: any) {
      toast({ title: "Failed to update course", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
    }
  };

  const onUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCourseId) return;
    try {
      setMutating(true);
      await api.uploadCoursePhoto(uploadCourseId, file);
      toast({ title: "Photo updated" });
      await refreshCourses();
    } catch (e: any) {
      toast({ title: "Failed to upload photo", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
      setUploadCourseId(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const openAssignDialog = async (courseId: string) => {
    try {
      setIsAssignOpen(courseId);
      // Prefer admin endpoint to list teachers
      const list = await api.getUsersByRole("ROLE_TEACHER");
      setTeachers(Array.isArray(list) ? list : []);
      setSelectedTeacherId("");
    } catch (e: any) {
      toast({ title: "Failed to load teachers", description: e?.message, variant: "destructive" as any });
    }
  };

  const onAssignTeacher = async () => {
    if (!isAssignOpen || !selectedTeacherId) return;
    try {
      setMutating(true);
      await api.assignTeacherToCourse(isAssignOpen, selectedTeacherId);
      toast({ title: "Teacher assigned" });
      setIsAssignOpen(null);
    } catch (e: any) {
      toast({ title: "Failed to assign teacher", description: e?.message, variant: "destructive" as any });
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create, update, and manage your courses</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>Create Course</DialogTitle>
              <DialogDescription>Enter the course details below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="c-title">Title</Label>
                <Input id="c-title" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-desc">Description</Label>
                <Textarea id="c-desc" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={createForm.level} onValueChange={(v) => setCreateForm({ ...createForm, level: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (USD)</Label>
                  <Input type="number" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={createForm.category} onValueChange={(v) => setCreateForm({ ...createForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={onCreateCourse} disabled={mutating}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading courses...</div>
      ) : courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No courses yet</CardTitle>
            <CardDescription>Create your first course to get started</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {courses.map((course) => (
            <Card key={course.courseId} className="overflow-hidden shadow-sm">
              {course.photo_url ? (
                <img src={course.photo_url} alt={course.title} className="w-full h-28 object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }} />
              ) : (
                <div className="w-full h-28 bg-muted flex items-center justify-center text-xl font-semibold">{course.title?.charAt(0) || '?'}</div>
              )}
              <CardHeader className="py-3">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span className="truncate max-w-[65%]">{course.title}</span>
                  <Button size="sm" variant="outline" onClick={() => { setUploadCourseId(course.courseId); photoInputRef.current?.click(); }} disabled={mutating}>
                    <Upload className="h-4 w-4 mr-1" /> Photo
                  </Button>
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="text-[10px] py-0.5 px-2">{course.category || 'Uncategorized'}</Badge>
                  <Badge variant="outline" className="text-[10px] py-0.5 px-2">{(course as any).level || 'LEVEL -'}</Badge>
                </div>
                <div className="text-base font-semibold">${Number(course.price || 0).toFixed(2)}</div>
                <div className="flex gap-2 flex-wrap">
                  <Dialog open={editingCourse?.courseId === course.courseId} onOpenChange={(open) => !open && setEditingCourse(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setEditingCourse({ ...course })}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[640px]">
                      <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                        <DialogDescription>Update course details</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input value={editingCourse?.title || ''} onChange={(e) => setEditingCourse((c) => c ? { ...c, title: e.target.value } : c)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={editingCourse?.description || ''} rows={3} onChange={(e) => setEditingCourse((c) => c ? { ...c, description: e.target.value } : c)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Level</Label>
                            <Select value={editingCourse?.level || ''} onValueChange={(v) => setEditingCourse((c) => c ? { ...c, level: v } : c)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input type="number" min="0" step="0.01" value={String(editingCourse?.price ?? '')} onChange={(e) => setEditingCourse((c) => c ? { ...c, price: Number(e.target.value) } : c)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={course.category} onValueChange={() => {}}>
                              <SelectTrigger>
                                <SelectValue placeholder={course.category || 'Category'} />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((c) => (
                                  <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingCourse(null)}>Cancel</Button>
                        <Button onClick={onUpdateCourse} disabled={mutating}>Save</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isAssignOpen === course.courseId} onOpenChange={(open) => { if (!open) setIsAssignOpen(null); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => openAssignDialog(course.courseId)}>
                        <Users className="h-4 w-4 mr-1" /> Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                        <DialogTitle>Assign Teacher</DialogTitle>
                        <DialogDescription>Select a teacher to assign to this course</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label>Teacher</Label>
                        <Select value={selectedTeacherId} onValueChange={(v) => setSelectedTeacherId(v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.firstName} {t.lastName} ({t.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAssignOpen(null)}>Cancel</Button>
                        <Button onClick={onAssignTeacher} disabled={mutating || !selectedTeacherId}>Assign</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onUploadPhoto} />
    </div>
  );
}

export default CourseManagement;


