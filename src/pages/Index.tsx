import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfiles, fetchStats } from "@/lib/api";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import ProfileCard from "@/components/ProfileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Index = () => {
  const [page, setPage] = useState(1);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const {
    data: profilesData,
    isLoading: profilesLoading,
    refetch: refetchProfiles,
  } = useQuery({
    queryKey: ["profiles", page],
    queryFn: () => fetchProfiles(page, 40),
  });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const handleRefresh = useCallback(() => {
    setPage(1);
    setRemovedIds(new Set());
    refetchProfiles();
    refetchStats();
  }, [refetchProfiles, refetchStats]);

  const handleSaved = useCallback((id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
    // Refresh stats after save
    refetchStats();
  }, [refetchStats]);

  const handleNext = useCallback(() => {
    setPage((p) => p + 1);
    setRemovedIds(new Set());
  }, []);

  const visibleProfiles =
    profilesData?.data.filter((p) => !removedIds.has(p._id)) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onRefresh={handleRefresh} isLoading={profilesLoading} />
      <StatsBar stats={stats} isLoading={statsLoading} />

      <main className="container pb-8">
        {profilesLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-3">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : visibleProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">All profiles completed!</p>
            <p className="text-sm mt-1">Load the next batch to continue.</p>
            <Button onClick={handleNext} className="mt-4 gap-1.5">
              Next Page <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProfiles.map((profile) => (
                <ProfileCard
                  key={profile._id}
                  profile={profile}
                  onSaved={handleSaved}
                />
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={handleNext} className="gap-1.5">
                Next Page <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
