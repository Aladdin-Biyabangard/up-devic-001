import * as React from "react";
import { useState } from "react";
import { CommentForm } from "@/components/ui/comment-form";
import { CommentsGrid } from "@/components/ui/comments-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CommentItem = {
  commentId: string | number;
  firstName: string;
  content: string;
  updatedAt?: string;
};

type CommentListProps = {
  comments: CommentItem[];
  onAddComment: (content: string) => Promise<void>;
  formatDate?: (iso?: string) => string;
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  // Pagination props
  currentPage?: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  canGoNext?: boolean;
  className?: string;
};

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  onAddComment,
  formatDate,
  isLoading = false,
  isError = false,
  error,
  currentPage = 0,
  onPreviousPage,
  onNextPage,
  canGoNext = false,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Comment Form */}
      <div className="border-b border-border pb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Add a comment</h3>
        <CommentForm onSubmit={onAddComment} />
      </div>

      {/* Comments Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {isLoading 
              ? "Loading comments..." 
              : isError 
                ? error?.message || "Failed to load comments"
                : `${comments.length} comments on this page`
            }
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <CommentsGrid comments={comments} formatDate={formatDate} />
        )}

        {/* Pagination */}
        {(onPreviousPage || onNextPage) && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={onPreviousPage} 
              disabled={currentPage === 0 || !onPreviousPage}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <div className="text-sm text-muted-foreground">Page {currentPage + 1}</div>
            <Button 
              variant="outline" 
              onClick={onNextPage} 
              disabled={!canGoNext || !onNextPage}
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;