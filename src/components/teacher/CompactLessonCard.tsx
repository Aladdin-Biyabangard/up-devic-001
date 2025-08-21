import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface LessonCardProps {
  lessonId: string;
  title: string;
  photoUrl?: string;
  className?: string;
  onPhotoChange?: (newUrl: string) => void;
}

export default function CompactLessonCard({
  lessonId,
  title,
  photoUrl,
  className,
  onPhotoChange,
}: LessonCardProps) {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(photoUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCurrentPhotoUrl(photoUrl);
  }, [photoUrl]);

  const openPicker = () => fileInputRef.current?.click();

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("auth_token");
      const form = new FormData();
      form.append("multipartFile", file);

      const res = await axios.patch(`${API_BASE_URL}/v1/lessons/${lessonId}/photo`, form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json, text/plain, */*",
        },
      });

      if (res.status === 204 || res.status === 200) {
        const previewUrl = URL.createObjectURL(file);
        setCurrentPhotoUrl(previewUrl);
        onPhotoChange?.(previewUrl);
        setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
      } else {
        throw new Error(`Unexpected status ${res.status}`);
      }
    } catch (err) {
      // Optional: surface error via parent toast if needed
      console.error("Failed to upload lesson photo", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={`w-full max-w-[200px] shadow-sm ${className || ""}`}>
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-semibold line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="aspect-video w-full bg-muted rounded overflow-hidden">
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : (
            <img src="/placeholder.svg" alt="placeholder" className="w-full h-full object-cover opacity-80" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={openPicker} disabled={uploading}>
            <Upload className="h-4 w-4 mr-1" />
            {uploading ? "Uploading..." : "Change Photo"}
          </Button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
      </CardContent>
    </Card>
  );
}


