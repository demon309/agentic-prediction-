import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Match, Player, Prediction } from "@/types/tennis";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function Predictions() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();

  const { data: upcomingMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches/upcoming"],
    refetchInterval: 60000,
  });

  const { data: recentPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions/recent"],
    refetchInterval: 30000,
  });

  const { data: players } = useQuery({
    queryKey: ["/api/players/top"],
  });

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
        title: "Analysis Complete",
        description: `Divine prediction generated with ${(parseFloat(prediction.confidenceLevel) * 100).toFixed(1)}% confidence`,
      });
      setAnalysisProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to generate prediction. Please try again.",
        variant: "destructive",
      });
      setAnalysisProgress(0);
    },
  });

  const getPlayerById = (id: string): Player | undefined => {
    return players?.find((p: Player) => p.id === id);
  };

  const handleAnalyzeMatch = async (match: Match) => {
    setSelectedMatch(match);
    setAnalysisProgress(10);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    await analyzeMatchMutation.mutateAsync(match.id);
    clearInterval(progressInterval);
  };

  const getAdvantageColor = (advantage: string) => {
    switch (advantage) {
      case "player1":
      case "slight_player1":
        return "text-blue-400";
      case "player2":
      case "slight_player2":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const formatWinProbability = (probability: string) => {
    return (parseFloat(probability) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-divine-gradient">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Divine Match Predictions
          </h1>
          <p className="text-gray-300 text-xl">
            Harness the power of 15+ specialized AI agents for unparalleled tennis insights
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-divine-gray border border-divine-gold/20">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-divine-gold data-[state=active]:text-divine-black"
            >
              Upcoming Matches
            </TabsTrigger>
            <TabsTrigger 
              value="recent"
              className="data-[state=active]:bg-divine-gold data-[state=active]:text-divine-black"
            >
              Recent Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-8">
            {matchesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-card-gradient border border-divine-gold/20 divine-shadow animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-divine-gray-light rounded mb-4"></div>
                      <div className="h-4 bg-divine-gray-light rounded mb-2"></div>
                      <div className="h-4 bg-divine-gray-light rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingMatches?.length === 0 ? (
              <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
                <CardContent className="p-12 text-center">
                  <i className="fas fa-tennis-ball text-4xl text-divine-gold mb-4"></i>
                  <h3 className="text-xl font-bold text-white mb-2">No Upcoming Matches</h3>
                  <p className="text-gray-400">Check back soon for new matches to analyze.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMatches?.map((match: Match) => {
                  const player1 = getPlayerById(match.player1Id);
                  const player2 = getPlayerById(match.player2Id);
                  
                  return (
                    <Card key={match.id} className="bg-card-gradient border border-divine-gold/20 divine-shadow hover:gold-glow transition-all">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <Badge variant="outline" className="border-divine-gold text-divine-gold">
                            {match.surface.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary">
                            {match.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-divine-gold rounded-full flex items-center justify-center">
                              <span className="text-divine-black font-bold text-sm">
                                {player1?.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-white">{player1?.name || "Unknown Player"}</div>
                              <div className="text-sm text-gray-400">#{player1?.ranking || "NR"}</div>
                            </div>
                          </div>
                          
                          <div className="text-center text-divine-gold font-bold">VS</div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                              <span className="text-divine-black font-bold text-sm">
                                {player2?.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-white">{player2?.name || "Unknown Player"}</div>
                              <div className="text-sm text-gray-400">#{player2?.ranking || "NR"}</div>
                            </div>
                          </div>
                        </div>

                        {match.scheduledTime && (
                          <div className="text-sm text-gray-400 mb-4">
                            <i className="fas fa-clock mr-2"></i>
                            {new Date(match.scheduledTime).toLocaleString()}
                          </div>
                        )}

                        <Button 
                          onClick={() => handleAnalyzeMatch(match)}
                          disabled={analyzeMatchMutation.isPending}
                          className="w-full bg-gold-gradient text-divine-black hover:gold-glow font-bold"
                        >
                          {analyzeMatchMutation.isPending && selectedMatch?.id === match.id ? (
                            <>
                              <i className="fas fa-magic mr-2 animate-spin"></i>
                              Analyzing... {analysisProgress.toFixed(0)}%
                            </>
                          ) : (
                            <>
                              <i className="fas fa-magic mr-2"></i>
                              Generate Prediction
                            </>
                          )}
                        </Button>

                        {analyzeMatchMutation.isPending && selectedMatch?.id === match.id && (
                          <Progress 
                            value={analysisProgress} 
                            className="mt-3 bg-divine-gray"
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-8">
            {predictionsLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-card-gradient border border-divine-gold/20 divine-shadow animate-pulse">
                    <CardContent className="p-8">
                      <div className="h-24 bg-divine-gray-light rounded mb-4"></div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-32 bg-divine-gray-light rounded"></div>
                        <div className="h-32 bg-divine-gray-light rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentPredictions?.length === 0 ? (
              <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
                <CardContent className="p-12 text-center">
                  <i className="fas fa-crystal-ball text-4xl text-divine-gold mb-4"></i>
                  <h3 className="text-xl font-bold text-white mb-2">No Recent Predictions</h3>
                  <p className="text-gray-400">Generate your first prediction from the upcoming matches.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {recentPredictions?.map((prediction: Prediction) => (
                  <Card key={prediction.id} className="bg-card-gradient border border-divine-gold/20 divine-shadow">
                    <CardContent className="p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold gradient-text">Divine Prediction</h3>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-divine-gold">
                            {formatWinProbability(prediction.winProbability)}%
                          </div>
                          <div className="text-sm text-gray-400">Win Probability</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Factor Analysis */}
                        <div className="bg-divine-black rounded-2xl p-6">
                          <h5 className="text-xl font-bold text-divine-gold mb-6">Factor Analysis</h5>
                          <div className="space-y-4">
                            {prediction.factorAnalysis?.slice(0, 6).map((factor, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm">{factor.factor}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-divine-gray rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        factor.advantage.includes('player1') ? 'bg-blue-400' :
                                        factor.advantage.includes('player2') ? 'bg-red-400' : 'bg-gray-400'
                                      }`}
                                      style={{ width: `${factor.confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className={`font-bold text-xs ${getAdvantageColor(factor.advantage)}`}>
                                    {factor.conclusion}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="bg-divine-black rounded-2xl p-6">
                          <h5 className="text-xl font-bold text-divine-gold mb-6">Divine Oracle Reasoning</h5>
                          <div className="space-y-4">
                            <div className="p-4 bg-divine-gray rounded-lg border-l-4 border-divine-gold">
                              <div className="flex items-center mb-2">
                                <i className="fas fa-check-circle text-divine-gold mr-2"></i>
                                <span className="text-divine-gold font-bold">AI Analysis</span>
                              </div>
                              <p className="text-gray-300 text-sm">
                                {prediction.reasoning?.substring(0, 200)}
                                {prediction.reasoning?.length > 200 && "..."}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-3xl font-bold gradient-text mb-2">
                                {(parseFloat(prediction.confidenceLevel) * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-400">AI Confidence Level</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 text-xs text-gray-500">
                        Generated: {new Date(prediction.createdAt).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
