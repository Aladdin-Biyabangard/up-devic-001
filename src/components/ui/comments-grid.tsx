import * as React from "react";
import { cn } from "@/lib/utils";
import { CommentCard } from "@/components/ui/comment-card";

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
  if (!comments || comments.length === 0) {
    return <div className={cn("text-sm text-muted-foreground", className)}>No comments yet.</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4", className)}>
      {comments.map((c) => (
        <CommentCard
          key={String(c.commentId)}
          author={c.firstName}
          content={c.content}
          date={formatDate ? formatDate(c.updatedAt) : c.updatedAt}
        />
      ))}
    </div>
  );
};

export default CommentsGrid;


