import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useTennisData() {
  const { toast } = useToast();

  // Players data
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players/top"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Upcoming matches
  const { data: upcomingMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches/upcoming"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Recent predictions
  const { data: recentPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions/recent"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Agent status
  const { data: agentStatus, isLoading: agentLoading } = useQuery({
    queryKey: ["/api/agents/status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Analyze match mutation
  const analyzeMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await apiRequest("POST", "/api/predictions/analyze", { 
        matchId, 
        forceRefresh: true 
      });
      return response.json();
    },
    onSuccess: (prediction) => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions/recent"] });
      toast({
        title: "Divine Prediction Generated",
        description: `Analysis complete with ${(parseFloat(prediction.confidenceLevel) * 100).toFixed(1)}% confidence`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Prediction Failed",
        description: error.message || "Unable to generate prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get player by ID helper
  const getPlayerById = (id: string) => {
    return players?.find((p: any) => p.id === id);
  };

  // Get prediction by match ID helper
  const getPredictionByMatch = (matchId: string) => {
    return recentPredictions?.find((p: any) => p.matchId === matchId);
  };

  // Sync data mutations
  const syncPlayersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sync/players", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Players Data Synced",
        description: "Player rankings and information updated successfully",
      });
    },
  });

  const syncTournamentsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sync/tournaments", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Tournaments Data Synced",
        description: "Tournament schedules updated successfully",
      });
    },
  });

  const syncMatchesMutation = useMutation({
    mutationFn: async (tournamentId?: string) => {
      const response = await apiRequest("POST", "/api/sync/matches", { tournamentId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "Matches Data Synced",
        description: "Match schedules updated successfully",
      });
    },
  });

  const syncNewsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sync/news", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({
        title: "News Data Synced",
        description: "Latest tennis news and injury reports updated",
      });
    },
  });

  return {
    // Data
    players,
    upcomingMatches,
    recentPredictions,
    agentStatus,

    // Loading states
    playersLoading,
    matchesLoading,
    predictionsLoading,
    agentLoading,

    // Mutations
    analyzeMatch: analyzeMatchMutation.mutateAsync,
    isAnalyzing: analyzeMatchMutation.isPending,

    syncPlayers: syncPlayersMutation.mutateAsync,
    isSyncingPlayers: syncPlayersMutation.isPending,

    syncTournaments: syncTournamentsMutation.mutateAsync,
    isSyncingTournaments: syncTournamentsMutation.isPending,

    syncMatches: syncMatchesMutation.mutateAsync,
    isSyncingMatches: syncMatchesMutation.isPending,

    syncNews: syncNewsMutation.mutateAsync,
    isSyncingNews: syncNewsMutation.isPending,

    // Helpers
    getPlayerById,
    getPredictionByMatch,
  };
}
