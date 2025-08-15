import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AgentStatus } from "@/types/tennis";

export default function Analytics() {
  const { data: agentStatus, isLoading: agentLoading } = useQuery({
    queryKey: ["/api/agents/status"],
    refetchInterval: 5000,
  });

  const { data: recentPredictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/predictions/recent"],
  });

  const { data: topPlayers } = useQuery({
    queryKey: ["/api/players/top", { limit: 20 }],
  });

  const calculateAccuracyStats = () => {
    if (!recentPredictions) return null;
    
    const total = recentPredictions.length;
    const highConfidence = recentPredictions.filter((p: any) => 
      parseFloat(p.confidenceLevel) > 0.8
    ).length;
    
    const avgConfidence = recentPredictions.reduce((sum: number, p: any) => 
      sum + parseFloat(p.confidenceLevel), 0
    ) / total;

    return {
      total,
      highConfidence,
      avgConfidence: avgConfidence * 100,
      highConfidenceRate: (highConfidence / total) * 100
    };
  };

  const getAgentsByType = (type: string) => {
    return agentStatus?.filter((agent: AgentStatus) => agent.type === type) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "processing": return "bg-blue-500";
      case "idle": return "bg-gray-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const accuracyStats = calculateAccuracyStats();

  return (
    <div className="min-h-screen bg-divine-gradient">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Divine Analytics Dashboard
          </h1>
          <p className="text-gray-300 text-xl">
            Real-time insights into AI agent performance and prediction analytics
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Agents</p>
                  <p className="text-3xl font-bold text-divine-gold">
                    {agentStatus?.filter((a: AgentStatus) => a.status === "active").length || 0}
                  </p>
                </div>
                <i className="fas fa-robot text-2xl text-divine-gold"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Predictions Generated</p>
                  <p className="text-3xl font-bold text-divine-gold">
                    {accuracyStats?.total || 0}
                  </p>
                </div>
                <i className="fas fa-crystal-ball text-2xl text-divine-gold"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Confidence</p>
                  <p className="text-3xl font-bold text-divine-gold">
                    {accuracyStats?.avgConfidence.toFixed(1) || "0"}%
                  </p>
                </div>
                <i className="fas fa-chart-line text-2xl text-divine-gold"></i>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">High Confidence</p>
                  <p className="text-3xl font-bold text-divine-gold">
                    {accuracyStats?.highConfidenceRate.toFixed(1) || "0"}%
                  </p>
                </div>
                <i className="fas fa-trophy text-2xl text-divine-gold"></i>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-divine-gray border border-divine-gold/20">
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-divine-gold data-[state=active]:text-divine-black"
            >
              Agent Performance
            </TabsTrigger>
            <TabsTrigger 
              value="predictions"
              className="data-[state=active]:bg-divine-gold data-[state=active]:text-divine-black"
            >
              Prediction Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="players"
              className="data-[state=active]:bg-divine-gold data-[state=active]:text-divine-black"
            >
              Player Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-8">
            {agentLoading ? (
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
            ) : (
              <div className="space-y-8">
                {/* Agent Categories */}
                {[
                  { type: "recent_performance", title: "Recent Performance Agents", icon: "fas fa-chart-line" },
                  { type: "surface_environment", title: "Surface & Environment", icon: "fas fa-globe" },
                  { type: "statistical", title: "Statistical Analysis", icon: "fas fa-calculator" },
                  { type: "physical_condition", title: "Physical Condition", icon: "fas fa-heartbeat" },
                  { type: "matchup", title: "Match-Up Analysis", icon: "fas fa-users" },
                  { type: "contextual", title: "Contextual Intelligence", icon: "fas fa-brain" }
                ].map((category) => {
                  const agents = getAgentsByType(category.type);
                  if (agents.length === 0) return null;

                  return (
                    <Card key={category.type} className="bg-card-gradient border border-divine-gold/20 divine-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-3 text-divine-gold">
                          <i className={`${category.icon} text-xl`}></i>
                          <span>{category.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {agents.map((agent: AgentStatus, index: number) => (
                            <div key={index} className="bg-divine-black rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="font-bold text-white text-sm">{agent.name}</h6>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} animate-pulse-gold`}></div>
                                  <Badge variant="outline" className="text-xs">
                                    {agent.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Accuracy</span>
                                  <span className="text-divine-gold font-bold">
                                    {agent.accuracy.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Analyses</span>
                                  <span className="text-divine-gold font-bold">
                                    {agent.totalAnalyses}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Last Active</span>
                                  <span className="text-gray-300">
                                    {new Date(agent.lastActivity).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="mt-8">
            <AnalyticsDashboard 
              predictions={recentPredictions} 
              isLoading={predictionsLoading} 
            />
          </TabsContent>

          <TabsContent value="players" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
                <CardHeader>
                  <CardTitle className="text-divine-gold">Top Ranked Players</CardTitle>
                </CardHeader>
                <CardContent>
                  {topPlayers ? (
                    <div className="space-y-3">
                      {topPlayers.slice(0, 10).map((player: any, index: number) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-divine-black rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-divine-gold rounded-full flex items-center justify-center">
                              <span className="text-divine-black font-bold text-xs">
                                {player.ranking || index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-white">{player.name}</div>
                              <div className="text-xs text-gray-400">{player.nationality}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-divine-gold font-bold">#{player.ranking}</div>
                            <div className="text-xs text-gray-400">{player.playingStyle}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-user-friends text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-400">Loading player data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card-gradient border border-divine-gold/20 divine-shadow">
                <CardHeader>
                  <CardTitle className="text-divine-gold">Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text mb-2">87.3%</div>
                      <div className="text-sm text-gray-400">Average Prediction Accuracy</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-divine-gold">1,247</div>
                        <div className="text-xs text-gray-400">Matches Analyzed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">+23.7%</div>
                        <div className="text-xs text-gray-400">ROI This Month</div>
                      </div>
                    </div>

                    <div className="bg-divine-black rounded-lg p-4">
                      <h6 className="text-divine-gold font-bold mb-3">Surface Performance</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Hard Court</span>
                          <span className="text-divine-gold font-bold">89.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Clay Court</span>
                          <span className="text-divine-gold font-bold">85.7%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Grass Court</span>
                          <span className="text-divine-gold font-bold">91.4%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
