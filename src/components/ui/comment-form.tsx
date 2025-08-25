import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

type CommentFormProps = {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  placeholder = "Write a comment...",
  className,
  disabled = false
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none"
        disabled={disabled || isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting || disabled}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;