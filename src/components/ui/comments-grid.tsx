import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CommentEditor } from "@/components/ui/comment-editor";

type CommentItem = {
  commentId: string | number;
  firstName: string;
  content: string;
  updatedAt?: string;
};

type CommentsGridProps = {
  comments: CommentItem[];
  formatDate?: (iso?: string) => string;
  className?: string;
};

export const CommentsGrid: React.FC<CommentsGridProps> = ({ comments, formatDate, className }) => {
  const [localComments, setLocalComments] = useState(comments || []);

  React.useEffect(() => {
    setLocalComments(comments || []);
  }, [comments]);

  const handleCommentUpdate = (commentId: string | number, newContent: string) => {
    setLocalComments(prev => 
      prev.map(comment => 
        comment.commentId === commentId 
          ? { ...comment, content: newContent }
          : comment
      )
    );
  };

  if (!localComments || localComments.length === 0) {
    return <div className={cn("text-sm text-muted-foreground", className)}>No comments yet.</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4", className)}>
      {localComments.map((c) => (
        <CommentEditor
          key={String(c.commentId)}
          commentId={String(c.commentId)}
          initialContent={c.content}
          author={c.firstName}
          date={formatDate ? formatDate(c.updatedAt) : c.updatedAt}
          onUpdate={(newContent) => handleCommentUpdate(c.commentId, newContent)}
        />
      ))}
    </div>
  );
};

export default CommentsGrid;


