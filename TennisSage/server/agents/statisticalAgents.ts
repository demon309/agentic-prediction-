import { Match, Player } from '@shared/schema';
import { openAIService } from '../services/openai';
import { storage } from '../storage';

export interface StatisticalResult {
  agentName: string;
  factor: string;
  conclusion: string;
  advantage: string;
  confidence: number;
  reasoning: string;
  analysis: any;
  processingTime: number;
}

export class StatisticalAgents {
  // Factor 3.1: Service Performance Analyst
  async analyzeServePerformance(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<StatisticalResult> {
    const startTime = Date.now();
    
    try {
      // Gather serving statistics
      const player1ServeStats = await this.getPlayerServeStats(player1.id, match.surface);
      const player2ServeStats = await this.getPlayerServeStats(player2.id, match.surface);
      
      const analysisData = {
        player1: {
          name: player1.name,
          firstServePercentage: player1ServeStats.firstServePercentage,
          firstServeWinRate: player1ServeStats.firstServeWinRate,
          secondServeWinRate: player1ServeStats.secondServeWinRate,
          aceRate: player1ServeStats.aceRate,
          doubleFaultRate: player1ServeStats.doubleFaultRate,
          serviceGamesHeld: player1ServeStats.serviceGamesHeld,
          breakPointsSaved: player1ServeStats.breakPointsSaved
        },
        player2: {
          name: player2.name,
          firstServePercentage: player2ServeStats.firstServePercentage,
          firstServeWinRate: player2ServeStats.firstServeWinRate,
          secondServeWinRate: player2ServeStats.secondServeWinRate,
          aceRate: player2ServeStats.aceRate,
          doubleFaultRate: player2ServeStats.doubleFaultRate,
          serviceGamesHeld: player2ServeStats.serviceGamesHeld,
          breakPointsSaved: player2ServeStats.breakPointsSaved
        },
        surface: match.surface
      };
      
      // Use GPT-4 for serve analysis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Serve Performance',
        analysisData,
        `Analyze the serving statistics of both players:
        1. Compare first serve effectiveness (percentage and win rate)
        2. Evaluate second serve reliability and pressure handling
        3. Assess ace production and double fault risk
        4. Review service game hold rates and break point saving ability
        5. Consider surface-specific serving advantages
        
        Determine who has the serving advantage.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateServeConfidence(player1ServeStats, player2ServeStats);
      
      return {
        agentName: "Service Performance Analyst",
        factor: "Factor 3.1 (Serve Performance)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Service Performance Analyst:", error);
      return {
        agentName: "Service Performance Analyst",
        factor: "Factor 3.1 (Serve Performance)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze serve performance due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 3.2: Return Performance Analyst
  async analyzeReturnPerformance(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<StatisticalResult> {
    const startTime = Date.now();
    
    try {
      const player1ReturnStats = await this.getPlayerReturnStats(player1.id, match.surface);
      const player2ReturnStats = await this.getPlayerReturnStats(player2.id, match.surface);
      
      const analysisData = {
        player1: {
          name: player1.name,
          firstServeReturnWinRate: player1ReturnStats.firstServeReturnWinRate,
          secondServeReturnWinRate: player1ReturnStats.secondServeReturnWinRate,
          breakPointsConverted: player1ReturnStats.breakPointsConverted,
          returnGamesWon: player1ReturnStats.returnGamesWon,
          averageBreaksPerMatch: player1ReturnStats.averageBreaksPerMatch
        },
        player2: {
          name: player2.name,
          firstServeReturnWinRate: player2ReturnStats.firstServeReturnWinRate,
          secondServeReturnWinRate: player2ReturnStats.secondServeReturnWinRate,
          breakPointsConverted: player2ReturnStats.breakPointsConverted,
          returnGamesWon: player2ReturnStats.returnGamesWon,
          averageBreaksPerMatch: player2ReturnStats.averageBreaksPerMatch
        },
        surface: match.surface
      };
      
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Return Performance',
        analysisData,
        `Analyze the return statistics of both players:
        1. Compare first serve return effectiveness
        2. Evaluate second serve return aggression and success
        3. Assess break point conversion rates
        4. Review return game winning percentages
        5. Consider surface impact on return effectiveness
        
        Determine who has the return advantage.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateReturnConfidence(player1ReturnStats, player2ReturnStats);
      
      return {
        agentName: "Return Performance Analyst",
        factor: "Factor 3.2 (Return Performance)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Return Performance Analyst:", error);
      return {
        agentName: "Return Performance Analyst",
        factor: "Factor 3.2 (Return Performance)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze return performance due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 3.3: Rally & Point Construction Analyst
  async analyzeRallyPatterns(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<StatisticalResult> {
    const startTime = Date.now();
    
    try {
      const player1RallyStats = await this.getPlayerRallyStats(player1.id);
      const player2RallyStats = await this.getPlayerRallyStats(player2.id);
      
      const analysisData = {
        player1: {
          name: player1.name,
          avgRallyLength: player1RallyStats.avgRallyLength,
          shortRallyWinRate: player1RallyStats.shortRallyWinRate,
          longRallyWinRate: player1RallyStats.longRallyWinRate,
          winnersToErrors: player1RallyStats.winnersToErrors,
          netApproachSuccess: player1RallyStats.netApproachSuccess
        },
        player2: {
          name: player2.name,
          avgRallyLength: player2RallyStats.avgRallyLength,
          shortRallyWinRate: player2RallyStats.shortRallyWinRate,
          longRallyWinRate: player2RallyStats.longRallyWinRate,
          winnersToErrors: player2RallyStats.winnersToErrors,
          netApproachSuccess: player2RallyStats.netApproachSuccess
        },
        surface: match.surface
      };
      
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Rally Patterns',
        analysisData,
        `Analyze rally patterns and point construction:
        1. Compare performance in short vs long rallies
        2. Evaluate winners to unforced errors ratio
        3. Assess net play effectiveness
        4. Consider rally length preferences and success rates
        5. Factor in surface impact on rally dynamics
        
        Determine who has the advantage in rally patterns.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateRallyConfidence(player1RallyStats, player2RallyStats);
      
      return {
        agentName: "Rally & Point Construction Analyst",
        factor: "Factor 3.3 (Rally Patterns)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Rally Pattern Analyst:", error);
      return {
        agentName: "Rally & Point Construction Analyst",
        factor: "Factor 3.3 (Rally Patterns)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze rally patterns due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 3.4: Pressure Statistics Analyst (Long-term clutch)
  async analyzePressurePerformance(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<StatisticalResult> {
    const startTime = Date.now();
    
    try {
      const player1PressureStats = await this.getPlayerPressureStats(player1.id);
      const player2PressureStats = await this.getPlayerPressureStats(player2.id);
      
      const analysisData = {
        player1: {
          name: player1.name,
          tiebreakWinRate: player1PressureStats.tiebreakWinRate,
          decidingSetWinRate: player1PressureStats.decidingSetWinRate,
          breakPointSaveRate: player1PressureStats.breakPointSaveRate,
          breakPointConversionRate: player1PressureStats.breakPointConversionRate,
          fifthSetRecord: player1PressureStats.fifthSetRecord
        },
        player2: {
          name: player2.name,
          tiebreakWinRate: player2PressureStats.tiebreakWinRate,
          decidingSetWinRate: player2PressureStats.decidingSetWinRate,
          breakPointSaveRate: player2PressureStats.breakPointSaveRate,
          breakPointConversionRate: player2PressureStats.breakPointConversionRate,
          fifthSetRecord: player2PressureStats.fifthSetRecord
        }
      };
      
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Pressure Performance',
        analysisData,
        `Analyze long-term clutch performance statistics:
        1. Compare tie-break winning percentages
        2. Evaluate deciding set performance
        3. Assess break point saving and conversion rates
        4. Review fifth set records (for men's Grand Slams)
        5. Identify patterns of mental toughness or fragility
        
        Determine who has the advantage in pressure situations.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculatePressureConfidence(player1PressureStats, player2PressureStats);
      
      return {
        agentName: "Pressure Statistics Analyst",
        factor: "Factor 3.4 (Clutch Performance 52-week)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Pressure Statistics Analyst:", error);
      return {
        agentName: "Pressure Statistics Analyst",
        factor: "Factor 3.4 (Clutch Performance 52-week)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze pressure performance due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 3.5: Statistical Trend Analyst
  async analyzeStatisticalTrends(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<StatisticalResult> {
    const startTime = Date.now();
    
    try {
      const player1Trends = await this.analyzePlayerTrends(player1.id);
      const player2Trends = await this.analyzePlayerTrends(player2.id);
      
      const analysisData = {
        player1: {
          name: player1.name,
          recentTrends: player1Trends.recent,
          seasonComparison: player1Trends.seasonComparison,
          improvingMetrics: player1Trends.improving,
          decliningMetrics: player1Trends.declining
        },
        player2: {
          name: player2.name,
          recentTrends: player2Trends.recent,
          seasonComparison: player2Trends.seasonComparison,
          improvingMetrics: player2Trends.improving,
          decliningMetrics: player2Trends.declining
        }
      };
      
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Statistical Trends',
        analysisData,
        `Analyze recent statistical trends for both players:
        1. Compare last 3 months vs 52-week averages
        2. Identify improving or declining metrics
        3. Assess trajectory of key performance indicators
        4. Consider if trends suggest peaking or struggling form
        5. Evaluate sustainability of recent improvements
        
        Determine if trends favor either player.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateTrendConfidence(player1Trends, player2Trends);
      
      return {
        agentName: "Statistical Trend Analyst",
        factor: "Factor 3.5 (Recent Stat Trends)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Statistical Trend Analyst:", error);
      return {
        agentName: "Statistical Trend Analyst",
        factor: "Factor 3.5 (Recent Stat Trends)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze statistical trends due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Helper methods
  private async getPlayerServeStats(playerId: string, surface: string) {
    // In a real implementation, this would calculate from match data
    return {
      firstServePercentage: 0.60 + Math.random() * 0.15,
      firstServeWinRate: 0.70 + Math.random() * 0.15,
      secondServeWinRate: 0.45 + Math.random() * 0.15,
      aceRate: 0.08 + Math.random() * 0.10,
      doubleFaultRate: 0.03 + Math.random() * 0.04,
      serviceGamesHeld: 0.80 + Math.random() * 0.15,
      breakPointsSaved: 0.60 + Math.random() * 0.20
    };
  }
  
  private async getPlayerReturnStats(playerId: string, surface: string) {
    return {
      firstServeReturnWinRate: 0.25 + Math.random() * 0.15,
      secondServeReturnWinRate: 0.50 + Math.random() * 0.15,
      breakPointsConverted: 0.40 + Math.random() * 0.20,
      returnGamesWon: 0.20 + Math.random() * 0.15,
      averageBreaksPerMatch: 2 + Math.random() * 2
    };
  }
  
  private async getPlayerRallyStats(playerId: string) {
    return {
      avgRallyLength: 3 + Math.random() * 4,
      shortRallyWinRate: 0.45 + Math.random() * 0.20,
      longRallyWinRate: 0.45 + Math.random() * 0.20,
      winnersToErrors: 0.8 + Math.random() * 0.6,
      netApproachSuccess: 0.60 + Math.random() * 0.20
    };
  }
  
  private async getPlayerPressureStats(playerId: string) {
    return {
      tiebreakWinRate: 0.45 + Math.random() * 0.20,
      decidingSetWinRate: 0.45 + Math.random() * 0.20,
      breakPointSaveRate: 0.60 + Math.random() * 0.20,
      breakPointConversionRate: 0.35 + Math.random() * 0.20,
      fifthSetRecord: { wins: Math.floor(Math.random() * 10), losses: Math.floor(Math.random() * 10) }
    };
  }
  
  private async analyzePlayerTrends(playerId: string) {
    return {
      recent: {
        serveImprovement: (Math.random() - 0.5) * 0.2,
        returnImprovement: (Math.random() - 0.5) * 0.2,
        winRateChange: (Math.random() - 0.5) * 0.3
      },
      seasonComparison: {
        currentWinRate: 0.5 + Math.random() * 0.3,
        previousWinRate: 0.5 + Math.random() * 0.3
      },
      improving: ['First serve percentage', 'Break point conversion'],
      declining: ['Double fault rate']
    };
  }
  
  private extractAdvantage(analysis: string): { player: string; conclusion: string } {
    const advantageMatch = analysis.match(/\*\*Advantage Player (\d|[12])\*\*|\*\*Slight Advantage Player (\d|[12])\*\*|\*\*No Clear Advantage\*\*/i);
    
    if (advantageMatch) {
      if (advantageMatch[0].includes('No Clear')) {
        return { player: 'none', conclusion: 'No Clear Advantage' };
      }
      const playerNum = advantageMatch[1] || advantageMatch[2];
      const isSlight = advantageMatch[0].includes('Slight');
      return { 
        player: `player${playerNum}`, 
        conclusion: `${isSlight ? 'Slight ' : ''}Advantage Player ${playerNum}` 
      };
    }
    
    return { player: 'none', conclusion: 'No Clear Advantage' };
  }
  
  private calculateServeConfidence(stats1: any, stats2: any): number {
    const metrics = ['firstServeWinRate', 'serviceGamesHeld', 'aceRate'];
    let advantages = 0;
    
    metrics.forEach(metric => {
      if (Math.abs(stats1[metric] - stats2[metric]) > 0.1) {
        advantages++;
      }
    });
    
    return Math.min(0.9, 0.5 + advantages * 0.15);
  }
  
  private calculateReturnConfidence(stats1: any, stats2: any): number {
    const diff = Math.abs(stats1.breakPointsConverted - stats2.breakPointsConverted);
    return Math.min(0.85, 0.5 + diff);
  }
  
  private calculateRallyConfidence(stats1: any, stats2: any): number {
    const w2eDiff = Math.abs(stats1.winnersToErrors - stats2.winnersToErrors);
    return Math.min(0.8, 0.5 + w2eDiff * 0.3);
  }
  
  private calculatePressureConfidence(stats1: any, stats2: any): number {
    const tiebreakDiff = Math.abs(stats1.tiebreakWinRate - stats2.tiebreakWinRate);
    return Math.min(0.85, 0.5 + tiebreakDiff * 1.5);
  }
  
  private calculateTrendConfidence(trends1: any, trends2: any): number {
    // Higher confidence if clear opposing trends
    const trend1 = trends1.recent.winRateChange;
    const trend2 = trends2.recent.winRateChange;
    
    if ((trend1 > 0.1 && trend2 < -0.1) || (trend1 < -0.1 && trend2 > 0.1)) {
      return 0.8; // High confidence in diverging trends
    }
    
    return 0.6; // Moderate confidence
  }
}

export const statisticalAgents = new StatisticalAgents();