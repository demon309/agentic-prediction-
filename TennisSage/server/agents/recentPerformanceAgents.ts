import { Match, Player } from "@shared/schema";
import { storage } from "../storage";

interface AgentResult {
  agentName: string;
  factor: string;
  conclusion: string;
  advantage: "player1" | "player2" | "none" | "slight_player1" | "slight_player2";
  confidence: number;
  reasoning: string;
  analysis: Record<string, any>;
  processingTime: number;
}

class RecentPerformanceAgents {
  async analyzeRecentMatches(match: Match, player1: Player, player2: Player): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Get recent matches for both players
      const [player1RecentMatches, player2RecentMatches] = await Promise.all([
        storage.getRecentMatches(player1.id, match.surface, 15),
        storage.getRecentMatches(player2.id, match.surface, 15)
      ]);

      // Analyze overall recent form
      const player1Stats = this.calculateRecentStats(player1RecentMatches, player1.id);
      const player2Stats = this.calculateRecentStats(player2RecentMatches, player2.id);
      
      // Analyze surface-specific form
      const player1SurfaceStats = this.calculateSurfaceStats(player1RecentMatches, player1.id, match.surface);
      const player2SurfaceStats = this.calculateSurfaceStats(player2RecentMatches, player2.id, match.surface);
      
      // Calculate opponent quality
      const player1OpponentQuality = await this.calculateOpponentQuality(player1RecentMatches, player1.id);
      const player2OpponentQuality = await this.calculateOpponentQuality(player2RecentMatches, player2.id);

      // Determine advantage
      const formAdvantage = this.determineFormAdvantage(player1Stats, player2Stats, player1SurfaceStats, player2SurfaceStats);
      
      const analysis = {
        player1: {
          overall: player1Stats,
          surface: player1SurfaceStats,
          opponentQuality: player1OpponentQuality
        },
        player2: {
          overall: player2Stats,
          surface: player2SurfaceStats,
          opponentQuality: player2OpponentQuality
        }
      };

      const reasoning = this.generateRecentFormReasoning(player1, player2, analysis, formAdvantage, match);
      
      return {
        agentName: "Recent Matches Analyst",
        factor: "Factor 1.1 (Recent Match Results)",
        conclusion: `${formAdvantage.advantage === "none" ? "No Clear Advantage" : `Advantage ${formAdvantage.winner}`}`,
        advantage: formAdvantage.advantage,
        confidence: formAdvantage.confidence,
        reasoning,
        analysis,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Recent Matches Analyst:", error);
      return {
        agentName: "Recent Matches Analyst",
        factor: "Factor 1.1 (Recent Match Results)",
        conclusion: "Analysis Error - Insufficient Data",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze recent form due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }

  async analyzeMomentum(match: Match, player1: Player, player2: Player): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Get recent matches for momentum analysis
      const [player1Recent, player2Recent] = await Promise.all([
        storage.getRecentMatches(player1.id, undefined, 10),
        storage.getRecentMatches(player2.id, undefined, 10)
      ]);

      // Calculate winning streaks and consistency
      const player1Momentum = this.calculateMomentum(player1Recent, player1.id);
      const player2Momentum = this.calculateMomentum(player2Recent, player2.id);
      
      // Determine momentum advantage
      const momentumAdvantage = this.determineMomentumAdvantage(player1Momentum, player2Momentum);
      
      const analysis = {
        player1: player1Momentum,
        player2: player2Momentum
      };

      const reasoning = this.generateMomentumReasoning(player1, player2, analysis, momentumAdvantage);
      
      return {
        agentName: "Momentum Analyst",
        factor: "Factor 1.2 (Momentum & Consistency)",
        conclusion: `${momentumAdvantage.advantage === "none" ? "No Clear Advantage" : `Advantage ${momentumAdvantage.winner}`}`,
        advantage: momentumAdvantage.advantage,
        confidence: momentumAdvantage.confidence,
        reasoning,
        analysis,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Momentum Analyst:", error);
      return {
        agentName: "Momentum Analyst",
        factor: "Factor 1.2 (Momentum & Consistency)",
        conclusion: "Analysis Error - Insufficient Data",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze momentum due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }

  async analyzeClutchPerformance(match: Match, player1: Player, player2: Player): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Get player stats for clutch performance
      const [player1Stats, player2Stats] = await Promise.all([
        storage.getPlayerStats(player1.id, match.surface, "last_52_weeks"),
        storage.getPlayerStats(player2.id, match.surface, "last_52_weeks")
      ]);

      // Analyze recent high-pressure scenarios
      const [player1Recent, player2Recent] = await Promise.all([
        storage.getRecentMatches(player1.id, match.surface, 15),
        storage.getRecentMatches(player2.id, match.surface, 15)
      ]);

      const player1Clutch = this.analyzeClutchStats(player1Stats, player1Recent, player1.id);
      const player2Clutch = this.analyzeClutchStats(player2Stats, player2Recent, player2.id);
      
      const clutchAdvantage = this.determineClutchAdvantage(player1Clutch, player2Clutch);
      
      const analysis = {
        player1: player1Clutch,
        player2: player2Clutch
      };

      const reasoning = this.generateClutchReasoning(player1, player2, analysis, clutchAdvantage);
      
      return {
        agentName: "Clutch Performance Analyst",
        factor: "Factor 1.3 (Clutch Moments Recently)",
        conclusion: `${clutchAdvantage.advantage === "none" ? "No Clear Advantage" : `Advantage ${clutchAdvantage.winner}`}`,
        advantage: clutchAdvantage.advantage,
        confidence: clutchAdvantage.confidence,
        reasoning,
        analysis,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Clutch Performance Analyst:", error);
      return {
        agentName: "Clutch Performance Analyst",
        factor: "Factor 1.3 (Clutch Moments Recently)",
        conclusion: "Analysis Error - Insufficient Data",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze clutch performance due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }

  private calculateRecentStats(matches: Match[], playerId: string) {
    if (matches.length === 0) {
      return { wins: 0, losses: 0, winRate: 0, totalMatches: 0 };
    }

    const wins = matches.filter(match => match.winnerId === playerId).length;
    const losses = matches.length - wins;
    const winRate = wins / matches.length;

    return {
      wins,
      losses,
      winRate,
      totalMatches: matches.length
    };
  }

  private calculateSurfaceStats(matches: Match[], playerId: string, surface: string) {
    const surfaceMatches = matches.filter(match => match.surface === surface);
    return this.calculateRecentStats(surfaceMatches, playerId);
  }

  private async calculateOpponentQuality(matches: Match[], playerId: string): Promise<number> {
    if (matches.length === 0) return 0;

    let totalRanking = 0;
    let validOpponents = 0;

    for (const match of matches) {
      const opponentId = match.player1Id === playerId ? match.player2Id : match.player1Id;
      const opponent = await storage.getPlayer(opponentId);
      
      if (opponent && opponent.ranking) {
        totalRanking += opponent.ranking;
        validOpponents++;
      }
    }

    return validOpponents > 0 ? totalRanking / validOpponents : 0;
  }

  private determineFormAdvantage(player1Stats: any, player2Stats: any, player1Surface: any, player2Surface: any) {
    // Weight overall form and surface-specific form
    const player1Score = (player1Stats.winRate * 0.6) + (player1Surface.winRate * 0.4);
    const player2Score = (player2Stats.winRate * 0.6) + (player2Surface.winRate * 0.4);
    
    const difference = Math.abs(player1Score - player2Score);
    
    if (difference < 0.1) {
      return { advantage: "none" as const, confidence: 0.5, winner: "None" };
    } else if (difference < 0.2) {
      const advantage = player1Score > player2Score ? "slight_player1" as const : "slight_player2" as const;
      const winner = player1Score > player2Score ? "Player 1" : "Player 2";
      return { advantage, confidence: 0.6 + difference, winner };
    } else {
      const advantage = player1Score > player2Score ? "player1" as const : "player2" as const;
      const winner = player1Score > player2Score ? "Player 1" : "Player 2";
      return { advantage, confidence: 0.7 + Math.min(difference, 0.3), winner };
    }
  }

  private calculateMomentum(matches: Match[], playerId: string) {
    if (matches.length === 0) {
      return { currentStreak: 0, streakType: "none", consistency: 0, recentForm: [] };
    }

    // Sort matches by date (most recent first)
    const sortedMatches = matches.sort((a, b) => 
      new Date(b.scheduledTime || 0).getTime() - new Date(a.scheduledTime || 0).getTime()
    );

    // Calculate current streak
    let currentStreak = 0;
    let streakType = "none";
    
    for (const match of sortedMatches) {
      const isWin = match.winnerId === playerId;
      
      if (currentStreak === 0) {
        currentStreak = 1;
        streakType = isWin ? "win" : "loss";
      } else if ((streakType === "win" && isWin) || (streakType === "loss" && !isWin)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate consistency (variance in performance)
    const recentResults = sortedMatches.slice(0, 5).map(match => match.winnerId === playerId ? 1 : 0);
    const wins = recentResults.filter(r => r === 1).length;
    const consistency = wins / recentResults.length;

    return {
      currentStreak,
      streakType,
      consistency,
      recentForm: recentResults
    };
  }

  private determineMomentumAdvantage(player1Momentum: any, player2Momentum: any) {
    // Score momentum based on streak and consistency
    const player1Score = this.scoreMomentum(player1Momentum);
    const player2Score = this.scoreMomentum(player2Momentum);
    
    const difference = Math.abs(player1Score - player2Score);
    
    if (difference < 0.15) {
      return { advantage: "none" as const, confidence: 0.5, winner: "None" };
    } else if (difference < 0.3) {
      const advantage = player1Score > player2Score ? "slight_player1" as const : "slight_player2" as const;
      const winner = player1Score > player2Score ? "Player 1" : "Player 2";
      return { advantage, confidence: 0.6 + difference, winner };
    } else {
      const advantage = player1Score > player2Score ? "player1" as const : "player2" as const;
      const winner = player1Score > player2Score ? "Player 1" : "Player 2";
      return { advantage, confidence: 0.7 + Math.min(difference, 0.3), winner };
    }
  }

  private scoreMomentum(momentum: any): number {
    let score = momentum.consistency * 0.6; // Base consistency score
    
    // Add streak bonus
    if (momentum.streakType === "win") {
      score += Math.min(momentum.currentStreak * 0.1, 0.4);
    } else if (momentum.streakType === "loss") {
      score -= Math.min(momentum.currentStreak * 0.1, 0.4);
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private analyzeClutchStats(stats: any, recentMatches: Match[], playerId: string) {
    if (!stats) {
      return { tiebreakRate: 0, decidingSetRate: 0, breakPointsSaved: 0, clutchScore: 0 };
    }

    const tiebreakRate = stats.tiebreaksPlayed > 0 ? stats.tiebreaksWon / stats.tiebreaksPlayed : 0;
    const decidingSetRate = stats.decidingSetsPlayed > 0 ? stats.decidingSetsWon / stats.decidingSetsPlayed : 0;
    const breakPointsSaved = parseFloat(stats.breakPointsSaved || "0");
    
    // Calculate recent clutch moments from match analysis
    const recentClutchMoments = this.extractClutchMoments(recentMatches, playerId);
    
    const clutchScore = (tiebreakRate * 0.3) + (decidingSetRate * 0.3) + (breakPointsSaved * 0.2) + (recentClutchMoments * 0.2);

    return {
      tiebreakRate,
      decidingSetRate,
      breakPointsSaved,
      recentClutchMoments,
      clutchScore
    };
  }

  private extractClutchMoments(matches: Match[], playerId: string): number {
    // Analyze match scores for tight matches and clutch performance
    let clutchWins = 0;
    let totalClutchSituations = 0;

    matches.forEach(match => {
      if (match.score) {
        const isClutchSituation = this.isClutchMatch(match.score);
        if (isClutchSituation) {
          totalClutchSituations++;
          if (match.winnerId === playerId) {
            clutchWins++;
          }
        }
      }
    });

    return totalClutchSituations > 0 ? clutchWins / totalClutchSituations : 0;
  }

  private isClutchMatch(score: string): boolean {
    // Simple heuristic: match went to 3+ sets or had tie-breaks
    return score.includes("7-6") || score.split(",").length >= 3;
  }

  private determineClutchAdvantage(player1Clutch: any, player2Clutch: any) {
    const difference = Math.abs(player1Clutch.clutchScore - player2Clutch.clutchScore);
    
    if (difference < 0.1) {
      return { advantage: "none" as const, confidence: 0.5, winner: "None" };
    } else if (difference < 0.2) {
      const advantage = player1Clutch.clutchScore > player2Clutch.clutchScore ? "slight_player1" as const : "slight_player2" as const;
      const winner = player1Clutch.clutchScore > player2Clutch.clutchScore ? "Player 1" : "Player 2";
      return { advantage, confidence: 0.6 + difference, winner };
    } else {
      const advantage = player1Clutch.clutchScore > player2Clutch.clutchScore ? "player1" as const : "player2" as const;
      const winner = player1Clutch.clutchScore > player2Clutch.clutchScore ? "Player 1" : "Player 2";
      return { advantage, confidence: 0.7 + Math.min(difference, 0.3), winner };
    }
  }

  private generateRecentFormReasoning(player1: Player, player2: Player, analysis: any, advantage: any, match: Match): string {
    const p1Stats = analysis.player1.overall;
    const p2Stats = analysis.player2.overall;
    const p1Surface = analysis.player1.surface;
    const p2Surface = analysis.player2.surface;

    return `${player1.name} has won ${p1Stats.wins} of their last ${p1Stats.totalMatches} matches (${(p1Stats.winRate * 100).toFixed(1)}% win rate), including ${p1Surface.wins} of ${p1Surface.totalMatches} on ${match.surface} courts. ${player2.name} has won ${p2Stats.wins} of their last ${p2Stats.totalMatches} matches (${(p2Stats.winRate * 100).toFixed(1)}% win rate), with ${p2Surface.wins} of ${p2Surface.totalMatches} on ${match.surface}. Average opponent ranking: ${player1.name} faced opponents ranked ${analysis.player1.opponentQuality.toFixed(0)} on average, while ${player2.name} faced opponents ranked ${analysis.player2.opponentQuality.toFixed(0)} on average.`;
  }

  private generateMomentumReasoning(player1: Player, player2: Player, analysis: any, advantage: any): string {
    const p1Mom = analysis.player1;
    const p2Mom = analysis.player2;

    let reasoning = `${player1.name} is currently on a ${p1Mom.currentStreak}-match ${p1Mom.streakType} streak with ${(p1Mom.consistency * 100).toFixed(1)}% consistency in recent matches. `;
    reasoning += `${player2.name} is on a ${p2Mom.currentStreak}-match ${p2Mom.streakType} streak with ${(p2Mom.consistency * 100).toFixed(1)}% consistency. `;
    
    if (advantage.advantage !== "none") {
      reasoning += `${advantage.winner} shows superior momentum and consistency in recent form.`;
    } else {
      reasoning += `Both players show similar momentum patterns with no clear advantage.`;
    }

    return reasoning;
  }

  private generateClutchReasoning(player1: Player, player2: Player, analysis: any, advantage: any): string {
    const p1Clutch = analysis.player1;
    const p2Clutch = analysis.player2;

    let reasoning = `In high-pressure situations, ${player1.name} has won ${(p1Clutch.tiebreakRate * 100).toFixed(1)}% of tiebreaks and ${(p1Clutch.decidingSetRate * 100).toFixed(1)}% of deciding sets, with ${(p1Clutch.breakPointsSaved * 100).toFixed(1)}% break points saved. `;
    reasoning += `${player2.name} has won ${(p2Clutch.tiebreakRate * 100).toFixed(1)}% of tiebreaks and ${(p2Clutch.decidingSetRate * 100).toFixed(1)}% of deciding sets, saving ${(p2Clutch.breakPointsSaved * 100).toFixed(1)}% of break points. `;
    
    if (advantage.advantage !== "none") {
      reasoning += `${advantage.winner} demonstrates superior performance under pressure in recent matches.`;
    } else {
      reasoning += `Both players show similar clutch performance with no clear pressure advantage.`;
    }

    return reasoning;
  }
}

export const recentPerformanceAgents = new RecentPerformanceAgents();
