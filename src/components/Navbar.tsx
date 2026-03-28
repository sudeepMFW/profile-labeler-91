import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const Navbar = ({ onRefresh, isLoading }: NavbarProps) => (
  <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
    <div className="container flex h-16 items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Profile Labeling Dashboard
      </h1>
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
  </header>
);

export default Navbar;
