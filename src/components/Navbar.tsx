import { RefreshCw, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const Navbar = ({ onRefresh, isLoading }: NavbarProps) => {
  const navigate = useNavigate();
  const username = localStorage.getItem("user") || "Guest";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Profile Labeling Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <User className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {username}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
