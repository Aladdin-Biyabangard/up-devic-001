import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Eye, 
  Users, 
  DollarSign,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Course = {
  courseId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  students?: number;
  status?: 'published' | 'draft';
  createdAt?: string;
  level?: string;
  photo_url?: string;
};

export function CourseManagement() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    level: "BEGINNER" as string,
    price: "",
    category: "",
    image: null as File | null
  });
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; courseId?: string; userId: string }>({ open: false, userId: "" });

  type CategoryDto = { category: string; courseCount: number };
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<CategoryDto[]>({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    staleTime: 5 * 60_000,
  });

  const { isLoading: isCoursesLoading, refetch: refetchCourses } = useQuery<Course[]>({
    queryKey: ["teacher-courses"],
    queryFn: () => api.getTeacherCourses(),
    onSuccess: (data) => setCourses(data as unknown as Course[]),
    staleTime: 30_000,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreateCourse = async () => {
    try {
      const created = await api.createCourse({
        title: newCourse.title,
        description: newCourse.description,
        level: newCourse.level,
        price: parseFloat(newCourse.price || "0"),
      }, newCourse.category);
      if (newCourse.image) {
        await api.uploadCoursePhoto(created.courseId ?? created.id ?? created?.course?.courseId ?? created, newCourse.image);
      }
      toast({ title: "Course created" });
      setIsCreateModalOpen(false);
      setNewCourse({ title: "", description: "", price: "", category: "", image: null, level: "BEGINNER" });
      await refetchCourses();
    } catch (e: any) {
      toast({ title: "Failed to create course", description: e?.message, variant: "destructive" as any });
    }
  };

  const handleUploadCoursePhoto = async (courseId: string, file: File) => {
    try {
      await api.uploadCoursePhoto(courseId, file);
      toast({ title: "Photo updated" });
      await refetchCourses();
    } catch (e: any) {
      toast({ title: "Failed to upload photo", description: e?.message, variant: "destructive" as any });
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    try {
      await api.updateCourse(editingCourse.courseId, {
        title: editingCourse.title,
        description: editingCourse.description,
        price: editingCourse.price,
        category: editingCourse.category,
        level: editingCourse.level,
      });
      toast({ title: "Course updated" });
      setEditingCourse(null);
      await refetchCourses();
    } catch (e: any) {
      toast({ title: "Failed to update course", description: e?.message, variant: "destructive" as any });
    }
  };

  const onDropCourseImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setNewCourse({ ...newCourse, image: file });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create and manage your courses</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new course
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="Enter course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="Describe your course"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={newCourse.level} onValueChange={(v) => setNewCourse({ ...newCourse, level: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {['BEGINNER','INTERMEDIATE','ADVANCED'].map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                    placeholder="99"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newCourse.category} onValueChange={(value) => setNewCourse({...newCourse, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map(c => (
                        <SelectItem key={c.category} value={c.category}>
                          {c.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Course Image</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropCourseImage}
                >
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setNewCourse({ ...newCourse, image: e.target.files?.[0] || null })} />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG up to 5MB {newCourse.image ? `• Selected: ${newCourse.image.name}` : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse} disabled={isCategoriesLoading}>
                Create Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Manage all your created courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.courseId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {course.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <input id={`upload-${course.courseId}`} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUploadCoursePhoto(course.courseId, e.target.files![0])} />
                      <Button variant="ghost" size="sm" onClick={() => document.getElementById(`upload-${course.courseId}`)?.click()}>
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Dialog open={assignDialog.open && assignDialog.courseId === course.courseId} onOpenChange={(o) => setAssignDialog((s) => ({ ...s, open: o, courseId: o ? course.courseId : undefined }))}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Assign Teacher</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Teacher to {course.title}</DialogTitle>
                            <DialogDescription>Enter the User ID of the teacher to assign</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Label htmlFor="teacher-id">User ID</Label>
                            <Input id="teacher-id" value={assignDialog.userId} onChange={(e) => setAssignDialog((s) => ({ ...s, userId: e.target.value }))} placeholder="teacher user id" />
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setAssignDialog({ open: false, userId: "" })}>Cancel</Button>
                            <Button onClick={async () => {
                              try {
                                if (!assignDialog.userId) return;
                                await api.assignTeacherToCourse(course.courseId, assignDialog.userId);
                                toast({ title: "Teacher assigned" });
                                setAssignDialog({ open: false, userId: "" });
                              } catch (e: any) {
                                toast({ title: "Failed to assign", description: e?.message, variant: "destructive" as any });
                              }
                            }}>Assign</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Course Dialog */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update course details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Select value={editingCourse.level} onValueChange={(v) => setEditingCourse({ ...editingCourse, level: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['BEGINNER','INTERMEDIATE','ADVANCED'].map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingCourse.category}
                    onValueChange={(value) => setEditingCourse({...editingCourse, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map(c => (
                        <SelectItem key={c.category} value={c.category}>
                          {c.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingCourse(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCourse}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}