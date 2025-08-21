import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GoToWishlistButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function GoToWishlistButton({ 
  variant = "outline", 
  size = "default",
  className,
  showIcon = true,
  children
}: GoToWishlistButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "rounded-full hover:scale-105 transition-all duration-200 hover:shadow-md",
        className
      )}
      asChild
    >
      <Link to="/wishlist">
        {showIcon && <Heart className="h-4 w-4 mr-2" />}
        {children || "Go to Wishlist"}
      </Link>
    </Button>
  );
}

export default GoToWishlistButton;