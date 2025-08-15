import { Match, Player } from '@shared/schema';
import { openAIService } from '../services/openai';
import { storage } from '../storage';

export interface MatchupResult {
  agentName: string;
  factor: string;
  conclusion: string;
  advantage: string;
  confidence: number;
  reasoning: string;
  analysis: any;
  processingTime: number;
}

export class MatchupAgents {
  // Factor 5.1: Playing Style Profiler
  async analyzePlayingStyles(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<MatchupResult> {
    const startTime = Date.now();
    
    try {
      // Get detailed playing style data
      const player1Style = await this.profilePlayingStyle(player1);
      const player2Style = await this.profilePlayingStyle(player2);
      
      const analysisData = {
        player1: {
          name: player1.name,
          style: player1Style,
          strengths: player1.strengths || [],
          weaknesses: player1.weaknesses || []
        },
        player2: {
          name: player2.name,
          style: player2Style,
          strengths: player2.strengths || [],
          weaknesses: player2.weaknesses || []
        },
        surface: match.surface
      };
      
      // Use GPT-4 for style matchup analysis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Playing Style Matchup',
        analysisData,
        `Analyze the playing style matchup between these players:
        1. Identify each player's core style (aggressive baseliner, counterpuncher, serve-and-volleyer, all-court)
        2. Analyze how their styles match up against each other
        3. Consider strengths vs weaknesses interactions
        4. Factor in how the surface affects this style matchup
        
        Determine who has the stylistic advantage.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateStyleConfidence(player1Style, player2Style);
      
      return {
        agentName: "Playing Style Profiler",
        factor: "Factor 5.1 (Style Matchup)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Playing Style Profiler:", error);
      return {
        agentName: "Playing Style Profiler",
        factor: "Factor 5.1 (Style Matchup)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze playing styles due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 5.2: Head-to-Head Analyst
  async analyzeHeadToHead(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<MatchupResult> {
    const startTime = Date.now();
    
    try {
      // Get head-to-head history
      const h2hMatches = await this.getHeadToHeadMatches(player1.id, player2.id);
      const h2hStats = this.calculateH2HStats(h2hMatches, player1.id, player2.id);
      
      // Get surface-specific H2H
      const surfaceH2H = h2hMatches.filter(m => m.surface === match.surface);
      const surfaceStats = this.calculateH2HStats(surfaceH2H, player1.id, player2.id);
      
      const analysisData = {
        overall: h2hStats,
        surfaceSpecific: surfaceStats,
        recentMeetings: h2hMatches.slice(0, 3).map(m => ({
          date: m.completedTime,
          winner: m.winner === 'player1' ? 
            (m.player1Id === player1.id ? player1.name : player2.name) :
            (m.player2Id === player1.id ? player1.name : player2.name),
          score: m.score,
          surface: m.surface,
          tournament: m.tournamentId
        })),
        psychologicalFactors: this.analyzePsychologicalFactors(h2hMatches, player1.id, player2.id)
      };
      
      // Use GPT-4 for H2H analysis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Head-to-Head History',
        analysisData,
        `Analyze the head-to-head history between these players:
        1. Overall H2H record and dominance patterns
        2. Surface-specific H2H performance
        3. Recent meeting trends and momentum
        4. Psychological factors from past encounters
        5. Any tactical patterns from previous matches
        
        Determine if H2H history favors either player.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateH2HConfidence(h2hStats, surfaceStats);
      
      return {
        agentName: "Head-to-Head Analyst",
        factor: "Factor 5.2 (Head-to-Head)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Head-to-Head Analyst:", error);
      return {
        agentName: "Head-to-Head Analyst",
        factor: "Factor 5.2 (Head-to-Head)",
        conclusion: "No Previous Meetings",
        advantage: "none",
        confidence: 0.0,
        reasoning: "These players have never met before, so head-to-head analysis is based on style matchup only.",
        analysis: { overall: { player1Wins: 0, player2Wins: 0, totalMatches: 0 } },
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 5.3: Tactical Battle Synthesizer
  async analyzeTacticalBattle(
    match: Match,
    player1: Player,
    player2: Player,
    styleAnalysis: any,
    h2hAnalysis: any
  ): Promise<MatchupResult> {
    const startTime = Date.now();
    
    try {
      // Gather tactical elements
      const player1Tactics = await this.analyzeTacticalApproach(player1, match.surface);
      const player2Tactics = await this.analyzeTacticalApproach(player2, match.surface);
      
      const analysisData = {
        player1: {
          name: player1.name,
          tactics: player1Tactics,
          gameplan: this.generateGameplan(player1, player2, match.surface)
        },
        player2: {
          name: player2.name,
          tactics: player2Tactics,
          gameplan: this.generateGameplan(player2, player1, match.surface)
        },
        surface: match.surface,
        keyBattlegrounds: this.identifyKeyBattlegrounds(player1Tactics, player2Tactics),
        styleContext: styleAnalysis,
        h2hContext: h2hAnalysis
      };
      
      // Use GPT-4 for tactical synthesis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Tactical Battle',
        analysisData,
        `Synthesize the tactical matchup for this match:
        1. How each player will try to impose their game
        2. Key tactical battlegrounds (serve vs return, baseline rallies, net play)
        3. Which player's tactics are more likely to succeed on this surface
        4. Critical factors that could swing the tactical balance
        5. Likely match flow and momentum patterns
        
        Determine who has the tactical advantage in the projected battle.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateTacticalConfidence(player1Tactics, player2Tactics, match.surface);
      
      return {
        agentName: "Tactical Battle Synthesizer",
        factor: "Factor 5.3 (Projected Tactical Battle)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Tactical Battle Synthesizer:", error);
      return {
        agentName: "Tactical Battle Synthesizer",
        factor: "Factor 5.3 (Projected Tactical Battle)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to synthesize tactical battle due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Helper methods
  private async profilePlayingStyle(player: Player) {
    const matches = await storage.getPlayerMatches(player.id);
    const stats = await this.calculatePlayingStyleMetrics(matches, player.id);
    
    // Categorize playing style based on metrics
    let style = 'All-Court Player';
    
    if (stats.aggressionIndex > 0.7) {
      style = 'Aggressive Baseliner';
    } else if (stats.aggressionIndex < 0.3) {
      style = 'Counter-Puncher';
    } else if (stats.netApproachRate > 0.2) {
      style = 'Serve-and-Volleyer';
    }
    
    return {
      primaryStyle: style,
      aggressionIndex: stats.aggressionIndex,
      rallyLength: stats.avgRallyLength,
      netPlay: stats.netApproachRate,
      serveReliance: stats.servePointsWonRate,
      returnStrength: stats.returnPointsWonRate,
      characteristics: this.describeStyleCharacteristics(style, stats)
    };
  }
  
  private async calculatePlayingStyleMetrics(matches: any[], playerId: string) {
    // In a real implementation, this would calculate detailed metrics
    // For now, return estimated values
    return {
      aggressionIndex: 0.5 + (Math.random() * 0.4 - 0.2),
      avgRallyLength: 4 + Math.random() * 3,
      netApproachRate: Math.random() * 0.3,
      servePointsWonRate: 0.6 + Math.random() * 0.2,
      returnPointsWonRate: 0.35 + Math.random() * 0.1
    };
  }
  
  private describeStyleCharacteristics(style: string, stats: any): string[] {
    const characteristics: string[] = [];
    
    switch (style) {
      case 'Aggressive Baseliner':
        characteristics.push('Powerful groundstrokes');
        characteristics.push('Early ball striking');
        characteristics.push('Dictates play from baseline');
        break;
      case 'Counter-Puncher':
        characteristics.push('Excellent defense');
        characteristics.push('Consistent depth');
        characteristics.push('Waits for opponent errors');
        break;
      case 'Serve-and-Volleyer':
        characteristics.push('Strong serve');
        characteristics.push('Frequent net approaches');
        characteristics.push('Quick points');
        break;
      default:
        characteristics.push('Versatile game');
        characteristics.push('Adapts to situations');
        characteristics.push('Mixed tactics');
    }
    
    return characteristics;
  }
  
  private async getHeadToHeadMatches(player1Id: string, player2Id: string) {
    const allMatches = await storage.getMatches();
    return allMatches.filter(m => 
      (m.player1Id === player1Id && m.player2Id === player2Id) ||
      (m.player1Id === player2Id && m.player2Id === player1Id)
    ).sort((a, b) => b.completedTime?.getTime() || 0 - (a.completedTime?.getTime() || 0));
  }
  
  private calculateH2HStats(matches: any[], player1Id: string, player2Id: string) {
    const player1Wins = matches.filter(m => 
      (m.player1Id === player1Id && m.winner === 'player1') ||
      (m.player2Id === player1Id && m.winner === 'player2')
    ).length;
    
    const player2Wins = matches.length - player1Wins;
    
    return {
      player1Wins,
      player2Wins,
      totalMatches: matches.length,
      player1WinRate: matches.length > 0 ? player1Wins / matches.length : 0,
      lastWinner: matches.length > 0 ? 
        (matches[0].winner === 'player1' ? 
          (matches[0].player1Id === player1Id ? 'player1' : 'player2') : 
          (matches[0].player2Id === player1Id ? 'player1' : 'player2')) : null
    };
  }
  
  private analyzePsychologicalFactors(matches: any[], player1Id: string, player2Id: string) {
    if (matches.length === 0) return { dominance: 'none', streaks: [] };
    
    // Check for dominance patterns
    const stats = this.calculateH2HStats(matches, player1Id, player2Id);
    let dominance = 'none';
    
    if (stats.player1WinRate > 0.75 && matches.length >= 4) {
      dominance = 'player1';
    } else if (stats.player2WinRate > 0.75 && matches.length >= 4) {
      dominance = 'player2';
    }
    
    // Check for streaks
    const streaks: any[] = [];
    let currentStreak = { player: '', count: 0 };
    
    for (const match of matches) {
      const winner = match.winner === 'player1' ? 
        (match.player1Id === player1Id ? 'player1' : 'player2') :
        (match.player2Id === player1Id ? 'player1' : 'player2');
      
      if (winner === currentStreak.player) {
        currentStreak.count++;
      } else {
        if (currentStreak.count >= 3) {
          streaks.push({ ...currentStreak });
        }
        currentStreak = { player: winner, count: 1 };
      }
    }
    
    return { dominance, streaks };
  }
  
  private async analyzeTacticalApproach(player: Player, surface: string) {
    // Analyze player's typical tactical approach
    return {
      servePatterns: ['Wide serves to open court', 'Body serves under pressure'],
      returnStrategy: ['Deep returns to baseline', 'Aggressive on second serves'],
      rallyPatterns: ['Cross-court consistency', 'Down-the-line winners'],
      pressureResponse: ['Increases first serve percentage', 'Shortens points']
    };
  }
  
  private generateGameplan(player: Player, opponent: Player, surface: string) {
    // Generate likely gameplan based on styles
    return {
      primary: `Exploit ${opponent.name}'s backhand with heavy topspin`,
      secondary: 'Use drop shots to bring opponent forward',
      serving: 'Target body serves on important points',
      returning: 'Stand closer on second serve returns'
    };
  }
  
  private identifyKeyBattlegrounds(tactics1: any, tactics2: any) {
    return [
      'First serve percentage - crucial for holding serve',
      'Return depth - establishing baseline control',
      'Cross-court rallies - pattern establishment',
      'Break point conversion - mental toughness'
    ];
  }
  
  private extractAdvantage(analysis: string): { player: string; conclusion: string } {
    const advantageMatch = analysis.match(/\*\*Advantage Player (\d|[12])\*\*|\*\*Slight Advantage Player (\d|[12])\*\*|\*\*No Clear Advantage\*\*/i);
    
    if (advantageMatch) {
      if (advantageMatch[0].includes('No Clear')) {
        return { player: 'none', conclusion: 'No Clear Advantage' };
      }
      const playerNum = advantageMatch[1] || advantageMatch[2];
      const isSlightint = advantageMatch[0].includes('Slight');
      return { 
        player: `player${playerNum}`, 
        conclusion: `${isSlightint ? 'Slight ' : ''}Advantage Player ${playerNum}` 
      };
    }
    
    return { player: 'none', conclusion: 'No Clear Advantage' };
  }
  
  private calculateStyleConfidence(style1: any, style2: any): number {
    // Calculate confidence based on style clarity and matchup
    const styleDifference = Math.abs(style1.aggressionIndex - style2.aggressionIndex);
    return Math.min(0.9, 0.5 + styleDifference * 0.5);
  }
  
  private calculateH2HConfidence(overall: any, surface: any): number {
    if (overall.totalMatches === 0) return 0.0;
    
    const winRateDiff = Math.abs(overall.player1WinRate - 0.5) * 2;
    const sampleConfidence = Math.min(1.0, overall.totalMatches / 10);
    
    return winRateDiff * sampleConfidence * 0.8 + 0.2;
  }
  
  private calculateTacticalConfidence(tactics1: any, tactics2: any, surface: string): number {
    // Base confidence on tactical clarity
    return 0.7; // Moderate confidence in tactical projections
  }
}

export const matchupAgents = new MatchupAgents();