import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CommentEditorProps = {
  commentId: string;
  initialContent: string;
  author: string;
  date?: string;
  className?: string;
  onUpdate?: (newContent: string) => void;
};

export const CommentEditor: React.FC<CommentEditorProps> = ({ 
  commentId, 
  initialContent, 
  author, 
  date, 
  className,
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setContent(initialContent);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(initialContent);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.updateComment(commentId, content.trim());
      setIsEditing(false);
      onUpdate?.(content.trim());
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          "group rounded-lg border border-border/60 bg-accent/20",
          "shadow-sm",
          "p-3 sm:p-4",
          "text-sm",
          className
        )}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="font-semibold text-foreground leading-tight truncate">{author}</div>
          {date && (
            <div className="shrink-0 text-[11px] sm:text-xs text-muted-foreground">{date}</div>
          )}
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-3 min-h-[80px] resize-none"
          placeholder="Edit your comment..."
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || !content.trim()}
            className="flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group rounded-lg border border-border/60 bg-accent/20 hover:bg-accent/30 transition-colors",
        "shadow-sm hover:shadow-md",
        "p-3 sm:p-4",
        "text-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-foreground leading-tight truncate">{author}</div>
        <div className="flex items-center gap-2">
          {date && (
            <div className="shrink-0 text-[11px] sm:text-xs text-muted-foreground">{date}</div>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <p className="mt-2 text-foreground/90 leading-relaxed text-xs sm:text-sm">{content}</p>
    </div>
  );
};

export default CommentEditor;