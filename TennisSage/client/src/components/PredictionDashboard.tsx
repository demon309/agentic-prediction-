import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTennisData } from "@/hooks/useTennisData";
import { Match, Player, Prediction } from "@/types/tennis";

interface PredictionDashboardProps {
  recentPredictions?: Prediction[];
  upcomingMatches?: Match[];
  isLoading?: boolean;
}

export default function PredictionDashboard({ 
  recentPredictions, 
  upcomingMatches, 
  isLoading 
}: PredictionDashboardProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { players, analyzeMatch, isAnalyzing } = useTennisData();

  const getPlayerById = (id: string): Player | undefined => {
    return players?.find((p: Player) => p.id === id);
  };

  const handleAnalyze = async (match: Match) => {
    setSelectedMatchId(match.id);
    await analyzeMatch(match.id);
    setSelectedMatchId(null);
  };

  // Get the latest prediction for featured display
  const featuredPrediction = recentPredictions?.[0];
  const featuredMatch = featuredPrediction ? 
    upcomingMatches?.find(m => m.id === featuredPrediction.matchId) : 
    upcomingMatches?.[0];

  if (isLoading) {
    return (
      <Card className="bg-card-gradient border border-divine-gold/30 divine-shadow animate-pulse">
        <CardContent className="p-8">
          <div className="h-8 bg-divine-gray-light rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="h-32 bg-divine-gray-light rounded"></div>
            <div className="h-32 bg-divine-gray-light rounded"></div>
            <div className="h-32 bg-divine-gray-light rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-48 bg-divine-gray-light rounded"></div>
            <div className="h-48 bg-divine-gray-light rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!featuredMatch) {
    return (
      <Card className="bg-card-gradient border border-divine-gold/30 divine-shadow">
        <CardContent className="p-12 text-center">
          <i className="fas fa-tennis-ball text-6xl text-divine-gold mb-6 animate-float"></i>
          <h3 className="text-2xl font-bold gradient-text mb-4">No Matches Available</h3>
          <p className="text-gray-300 text-lg mb-6">
            Check back soon for upcoming matches to analyze with our divine AI oracle.
          </p>
          <Button className="bg-gold-gradient text-divine-black hover:gold-glow font-bold">
            <i className="fas fa-refresh mr-2"></i>Refresh Matches
          </Button>
        </CardContent>
      </Card>
    );
  }

  const player1 = getPlayerById(featuredMatch.player1Id);
  const player2 = getPlayerById(featuredMatch.player2Id);

  return (
    <Card className="bg-card-gradient rounded-3xl border border-divine-gold/30 divine-shadow fade-in">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold gradient-text mb-2">Divine Match Prediction</h3>
          <p className="text-gray-300">
            {featuredMatch.tournamentId ? `Tournament Match` : "Exhibition Match"} - {featuredMatch.surface.toUpperCase()} Court
          </p>
        </div>

        {/* Match Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Player 1 */}
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-divine-gold gold-glow bg-gradient-to-br from-divine-gold/20 to-divine-gold/5 flex items-center justify-center">
                <span className="text-4xl font-bold text-divine-gold">
                  {player1?.name?.split(' ').map(n => n[0]).join('') || "P1"}
                </span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">{player1?.name || "Player 1"}</h4>
            <p className="text-divine-gold mb-1">World #{player1?.ranking || "NR"}</p>
            <p className="text-gray-400 text-sm">{player1?.playingStyle || "Unknown Style"}</p>
            {featuredPrediction && (
              <div className="mt-4 bg-divine-black rounded-lg p-3">
                <div className="text-divine-gold font-bold text-lg">
                  {featuredPrediction.predictedWinnerId === player1?.id ? 
                    `${(parseFloat(featuredPrediction.winProbability) * 100).toFixed(1)}%` : 
                    `${((1 - parseFloat(featuredPrediction.winProbability)) * 100).toFixed(1)}%`
                  }
                </div>
                <div className="text-xs text-gray-400">Win Probability</div>
              </div>
            )}
          </div>

          {/* VS Section */}
          <div className="flex flex-col justify-center items-center">
            <div className="text-6xl font-bold gradient-text mb-4 animate-pulse-gold">VS</div>
            <div className="bg-divine-black rounded-full p-4 border border-divine-gold/30 mb-4">
              <i className="fas fa-tennis-ball text-divine-gold text-2xl"></i>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">
                {featuredMatch.scheduledTime ? "Match Time" : "Status"}
              </div>
              <div className="text-divine-gold font-bold">
                {featuredMatch.scheduledTime ? 
                  new Date(featuredMatch.scheduledTime).toLocaleTimeString() : 
                  featuredMatch.status.toUpperCase()
                }
              </div>
            </div>
          </div>

          {/* Player 2 */}
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-400/5 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-400">
                  {player2?.name?.split(' ').map(n => n[0]).join('') || "P2"}
                </span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">{player2?.name || "Player 2"}</h4>
            <p className="text-gray-400 mb-1">World #{player2?.ranking || "NR"}</p>
            <p className="text-gray-400 text-sm">{player2?.playingStyle || "Unknown Style"}</p>
            {featuredPrediction && (
              <div className="mt-4 bg-divine-black rounded-lg p-3">
                <div className="text-gray-400 font-bold text-lg">
                  {featuredPrediction.predictedWinnerId === player2?.id ? 
                    `${(parseFloat(featuredPrediction.winProbability) * 100).toFixed(1)}%` : 
                    `${((1 - parseFloat(featuredPrediction.winProbability)) * 100).toFixed(1)}%`
                  }
                </div>
                <div className="text-xs text-gray-400">Win Probability</div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis or Generate Button */}
        {featuredPrediction ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Factor Analysis */}
            <div className="bg-divine-black rounded-2xl p-6">
              <h5 className="text-xl font-bold text-divine-gold mb-6">Factor Analysis</h5>
              <div className="space-y-4">
                {featuredPrediction.factorAnalysis?.slice(0, 5).map((factor, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{factor.factor}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-divine-gray rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            factor.advantage.includes('player1') ? 'bg-divine-gold' :
                            factor.advantage.includes('player2') ? 'bg-red-400' : 'bg-gray-400'
                          }`}
                          style={{ width: `${factor.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-divine-gold font-bold text-sm">
                        {factor.advantage === "none" ? "Neutral" : 
                         factor.advantage.includes('player1') ? "P1" : "P2"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Confidence & Reasoning */}
            <div className="bg-divine-black rounded-2xl p-6">
              <h5 className="text-xl font-bold text-divine-gold mb-6">Divine Oracle Reasoning</h5>
              <div className="space-y-4">
                <div className="p-4 bg-divine-gray rounded-lg border-l-4 border-divine-gold">
                  <div className="flex items-center mb-2">
                    <i className="fas fa-check-circle text-divine-gold mr-2"></i>
                    <span className="text-divine-gold font-bold">AI Analysis</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {featuredPrediction.reasoning?.substring(0, 150)}...
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">
                    {(parseFloat(featuredPrediction.confidenceLevel) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">AI Confidence Level</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button 
              onClick={() => handleAnalyze(featuredMatch)}
              disabled={isAnalyzing && selectedMatchId === featuredMatch.id}
              className="bg-gold-gradient text-divine-black px-8 py-4 rounded-xl font-bold text-lg hover:gold-glow transition-all transform hover:scale-105"
            >
              {isAnalyzing && selectedMatchId === featuredMatch.id ? (
                <>
                  <i className="fas fa-magic mr-3 animate-spin"></i>
                  Consulting Oracle...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-3"></i>
                  Generate Divine Prediction
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
