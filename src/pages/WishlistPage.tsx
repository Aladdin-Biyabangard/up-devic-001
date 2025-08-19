import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Course } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { CourseCard, CourseCardSkeleton } from "@/components/course/CourseCard";
import { Heart, LayoutGrid, List } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

type WishlistResponse = {
  content: Course[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export default function WishlistPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [grid, setGrid] = useState(true);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wishlist", page, size],
    queryFn: () => api.getWishlist(page, size) as Promise<any>,
    staleTime: 20_000,
  }) as any;

  const courses = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const wishlistSet = useMemo(() => new Set(courses.map(c => c.courseId)), [courses]);

  const { mutate: toggleWishlist, isPending: isToggling } = useMutation({
    mutationFn: async (courseId: string) => {
      if (wishlistSet.has(courseId)) {
        return api.removeCourseFromWishlist(courseId);
      }
      return api.addCourseToWishlist(courseId);
    },
    onSuccess: async () => {
      toast({ title: "Wishlist updated" });
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (e: any) => {
      toast({ title: "Action failed", description: e?.message, variant: "destructive" as any });
    },
  }) as any;

  const { mutate: rate, isPending: isRating } = useMutation({
    mutationFn: async ({ courseId, rating }: { courseId: string; rating: number }) => {
      return api.rateCourse(courseId, rating);
    },
    onSuccess: async () => {
      toast({ title: "Rating saved" });
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (e: any) => {
      toast({ title: "Rating failed", description: e?.message, variant: "destructive" as any });
    },
  }) as any;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-10">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in to view your wishlist</h2>
          <p className="text-muted-foreground mb-4">Your saved courses appear here once you are logged in.</p>
          <Button asChild>
            <Link to="/auth">Go to Sign In</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <div className="flex gap-2">
          <Button size="sm" variant={grid ? "default" : "outline"} onClick={() => setGrid(true)}>
            <LayoutGrid className="h-4 w-4 mr-2" /> Grid
          </Button>
          <Button size="sm" variant={!grid ? "default" : "outline"} onClick={() => setGrid(false)}>
            <List className="h-4 w-4 mr-2" /> List
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: size }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-destructive">{(error as any)?.message || "Failed to load wishlist"}</div>
      ) : courses.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No items in your wishlist yet.</Card>
      ) : (
        <div className={grid ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {courses.map((course) => (
            <div key={course.courseId} className={grid ? "" : "border rounded-lg p-2"}>
              <CourseCard 
                course={course}
                onWishlistToggle={(id) => toggleWishlist(id)}
                isWishlisted={true}
              />
              {/* Interactive rating stars */}
              <div className="mt-2 flex items-center gap-1 px-1">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const value = idx + 1;
                  const active = value <= Math.round(course.rating || 0);
                  return (
                    <button
                      key={value}
                      className={`p-1 transition-transform hover:scale-110 ${active ? "text-yellow-400" : "text-muted-foreground"}`}
                      aria-label={`Rate ${value}`}
                      onClick={() => rate({ courseId: course.courseId, rating: value })}
                      disabled={isRating}
                    >
                      {/* simple star */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(0, p - 1)); }}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 py-2 text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages - 1, p + 1)); }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}


