import * as React from "react";
import { cn } from "@/lib/utils";

type CommentCardProps = {
  author: string;
  content: string;
  date?: string;
  className?: string;
};

export const CommentCard: React.FC<CommentCardProps> = ({ author, content, date, className }) => {
  return (
    <div
      className={cn(
        "group rounded-lg border border-border/60 bg-accent/20 hover:bg-accent/30 transition-colors",
        "shadow-sm hover:shadow-md",
        "p-3 sm:p-4",
        "text-sm"
      , className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-foreground leading-tight truncate">{author}</div>
        {date ? (
          <div className="shrink-0 text-[11px] sm:text-xs text-muted-foreground">{date}</div>
        ) : null}
      </div>
      <p className="mt-2 text-foreground/90 leading-relaxed text-xs sm:text-sm">{content}</p>
    </div>
  );
};

export default CommentCard;


