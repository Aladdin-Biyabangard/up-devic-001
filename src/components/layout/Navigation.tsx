import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  User, 
  Settings, 
  Heart,
  CreditCard,
  BarChart3,
  Users
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

const navigationItems: NavigationItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Teachers", href: "/teachers", icon: GraduationCap },
  { label: "Dashboard", href: "/dashboard", icon: User },
  { label: "My Courses", href: "/my-courses", icon: BookOpen, role: 'STUDENT' },
  { label: "Wishlist", href: "/wishlist", icon: Heart, role: 'STUDENT' },
  { label: "Teacher Portal", href: "/teacher", icon: GraduationCap, role: 'TEACHER' },
  { label: "Analytics", href: "/teacher/analytics", icon: BarChart3, role: 'TEACHER' },
  { label: "Payments", href: "/teacher/payments", icon: CreditCard, role: 'TEACHER' },
  { label: "Admin Panel", href: "/admin", icon: Settings, role: 'ADMIN' },
  { label: "User Management", href: "/admin/users", icon: Users, role: 'ADMIN' },
];

interface NavigationProps {
  vertical?: boolean;
  className?: string;
  onItemClick?: () => void;
}

export function Navigation({ vertical = false, className, onItemClick }: NavigationProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const filteredItems = navigationItems.filter(item => {
    if (!item.role) return true;
    return user?.role === item.role;
  });

  const containerClasses = vertical 
    ? "flex flex-col space-y-1" 
    : "flex items-center space-x-1";

  return (
    <nav className={cn(containerClasses, className)}>
      {filteredItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            size={vertical ? "sm" : "sm"}
            className={cn(
              "justify-start",
              vertical ? "w-full" : "",
              isActive && "bg-primary text-primary-foreground"
            )}
            asChild
            onClick={onItemClick}
          >
            <Link to={item.href}>
              <Icon className={cn("h-4 w-4", vertical ? "mr-2" : "mr-1")} />
              {vertical && <span>{item.label}</span>}
              {!vertical && <span className="hidden sm:inline ml-1">{item.label}</span>}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

interface SidebarNavigationProps {
  onClose?: () => void;
}

export function SidebarNavigation({ onClose }: SidebarNavigationProps) {
  const { user } = useAuth();
  
  return (
    <div className="p-4 space-y-4">
      <div className="text-sm font-medium text-muted-foreground px-2">
        Navigation
      </div>
      <Navigation vertical onItemClick={onClose} />
      
      {user && (
        <>
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-muted-foreground px-2 mb-2">
              Account
            </div>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={onClose}>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={onClose}>
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}