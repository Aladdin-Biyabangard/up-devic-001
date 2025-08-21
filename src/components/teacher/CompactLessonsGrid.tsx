import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, Trash2 } from "lucide-react";

export interface CompactLessonItem {
  id: string;
  title: string;
  photoUrl?: string;
}

interface CompactLessonsGridProps {
  lessons: CompactLessonItem[];
  onChange?: (updated: CompactLessonItem[]) => void;
  className?: string;
}

export function CompactLessonsGrid({ lessons, onChange, className }: CompactLessonsGridProps) {
  const [items, setItems] = useState<CompactLessonItem[]>(lessons || []);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [uploadForLessonId, setUploadForLessonId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setItems(lessons || []);
  }, [lessons]);

  const beginUpload = (lessonId: string) => {
    setUploadForLessonId(lessonId);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadForLessonId) return;
    try {
      setMutatingId(uploadForLessonId);
      const token = localStorage.getItem("auth_token");
      const form = new FormData();
      form.append("multipartFile", file);
      const res = await axios.patch(`${API_BASE_URL}/v1/lessons/${uploadForLessonId}/photo`, form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json, text/plain, */*",
        },
      });
      if (res.status === 200 || res.status === 204) {
        const previewUrl = URL.createObjectURL(file);
        setItems((prev) => prev.map((it) => (it.id === uploadForLessonId ? { ...it, photoUrl: previewUrl } : it)));
        onChange?.(items.map((it) => (it.id === uploadForLessonId ? { ...it, photoUrl: previewUrl } : it)));
        setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
      } else {
        throw new Error(`Unexpected status ${res.status}`);
      }
    } catch (err: any) {
      // no-op; caller can handle toast externally if desired
      console.error("Failed to upload lesson photo", err);
    } finally {
      setMutatingId(null);
      setUploadForLessonId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onDeleteLesson = async (lessonId: string) => {
    try {
      setMutatingId(lessonId);
      const token = localStorage.getItem("auth_token");
      const res = await axios.delete(`${API_BASE_URL}/v1/lessons/${lessonId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json, text/plain, */*",
        },
      });
      if (res.status === 200 || res.status === 204) {
        setItems((prev) => prev.filter((it) => it.id !== lessonId));
        onChange?.(items.filter((it) => it.id !== lessonId));
      } else {
        throw new Error(`Unexpected status ${res.status}`);
      }
    } catch (err: any) {
      console.error("Failed to delete lesson", err);
    } finally {
      setMutatingId(null);
    }
  };

  return (
    <div className={"w-full " + (className || "")}> 
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((lesson) => (
          <Card key={lesson.id} className="w-full max-w-[220px] shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-semibold line-clamp-2">{lesson.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="aspect-video w-full bg-muted rounded overflow-hidden">
                {lesson.photoUrl ? (
                  <img
                    src={lesson.photoUrl}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => beginUpload(lesson.id)} disabled={mutatingId === lesson.id}>
                  <Upload className="h-4 w-4 mr-1" />
                  Change Photo
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" disabled={mutatingId === lesson.id}>
                      <Trash2 className="h-4 w-4" />
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
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDeleteLesson(lesson.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
    </div>
  );
}

export default CompactLessonsGrid;


