import type { Stats } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsBarProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

const items = [
  { key: "total" as const, label: "Total", color: "bg-primary" },
  { key: "completed" as const, label: "Completed", color: "bg-accent" },
  { key: "pending" as const, label: "Pending", color: "bg-[hsl(var(--stat-pending))]" },
  { key: "percent" as const, label: "Progress", color: "bg-[hsl(var(--stat-percent))]" },
];

const StatsBar = ({ stats, isLoading }: StatsBarProps) => (
  <div className="container py-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ key, label, color }) => (
        <div key={key} className="rounded-lg bg-card p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground">
              {stats ? (key === "percent" ? `${stats[key]}%` : stats[key]) : "—"}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default StatsBar;
