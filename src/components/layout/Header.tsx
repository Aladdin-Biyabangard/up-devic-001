import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, BookOpen, User, Settings, LogOut, Menu, PanelsTopLeft, Heart } from "lucide-react";
import { GoToWishlistButton } from "@/components/ui/go-to-wishlist-button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onMenuToggle?: () => void;
}

export function Header({ onSearch, onMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const roles: string[] = user?.roles


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Menu */}
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              UpDevic
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses, lessons, teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user && roles?.includes('ROLE_STUDENT') && (
            <Button variant="secondary" className="hidden md:flex" asChild>
              <Link to="/student" className="gap-2">
                <PanelsTopLeft className="h-4 w-4" />
                Student Panel
              </Link>
            </Button>
          )}
          {user && roles?.includes('ROLE_TEACHER') && (
            <Button variant="secondary" className="hidden md:flex" asChild>
              <Link to="/teacher" className="gap-2">
                <PanelsTopLeft className="h-4 w-4" />
                Teacher Panel
              </Link>
            </Button>
          )}
          {user?.roles?.includes?.('ROLE_ADMIN') && (
            <Button variant="secondary" className="hidden md:flex" asChild>
              <Link to="/admin" className="gap-2">
                <PanelsTopLeft className="h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
          
          {user && (
            <GoToWishlistButton 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex"
            />
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {roles?.includes('ROLE_STUDENT') && (
                  <DropdownMenuItem asChild>
                    <Link to="/student" className="cursor-pointer">
                      <PanelsTopLeft className="mr-2 h-4 w-4" />
                      Student Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                {roles?.includes('ROLE_TEACHER') && (
                  <DropdownMenuItem asChild>
                    <Link to="/teacher" className="cursor-pointer">
                      <PanelsTopLeft className="mr-2 h-4 w-4" />
                      Teacher Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role?.includes?.('ROLE_ADMIN') && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <PanelsTopLeft className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button className="btn-hero" asChild>
                <Link to="/auth?mode=register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden border-t p-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>
      </div>
    </header>
  );
}