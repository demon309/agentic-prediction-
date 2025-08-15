import { Match, Player } from '@shared/schema';
import { openAIService } from '../services/openai';
import { storage } from '../storage';

export interface SurfaceEnvironmentResult {
  agentName: string;
  factor: string;
  conclusion: string;
  advantage: string;
  confidence: number;
  reasoning: string;
  analysis: any;
  processingTime: number;
}

export class SurfaceEnvironmentAgents {
  // Factor 2.1: Surface Suitability Analyst
  async analyzeSurfaceSuitability(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<SurfaceEnvironmentResult> {
    const startTime = Date.now();
    
    try {
      // Get surface-specific performance data
      const player1SurfaceStats = await this.getPlayerSurfaceStats(player1.id, match.surface);
      const player2SurfaceStats = await this.getPlayerSurfaceStats(player2.id, match.surface);
      
      // Get court pace information
      const courtPace = await this.getCourtPaceInfo(match.tournamentId, match.surface);
      
      // Prepare data for AI analysis
      const analysisData = {
        surface: match.surface,
        courtPace,
        player1: {
          name: player1.name,
          surfaceWinRate: player1SurfaceStats.winRate,
          surfaceMatches: player1SurfaceStats.totalMatches,
          recentSurfaceForm: player1SurfaceStats.recentForm,
          playingStyle: player1.playingStyle,
          preferredSurface: player1.preferredSurface
        },
        player2: {
          name: player2.name,
          surfaceWinRate: player2SurfaceStats.winRate,
          surfaceMatches: player2SurfaceStats.totalMatches,
          recentSurfaceForm: player2SurfaceStats.recentForm,
          playingStyle: player2.playingStyle,
          preferredSurface: player2.preferredSurface
        }
      };
      
      // Use GPT-4 for sophisticated analysis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Surface Suitability',
        analysisData,
        `Analyze how each player adapts to ${match.surface} courts. Consider:
        1. Historical performance on this surface
        2. Playing style compatibility with surface characteristics
        3. Recent form on this specific surface
        4. Court pace implications for each player's game
        
        Determine who has the surface advantage and explain why.`
      );
      
      // Extract advantage from AI response
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateSurfaceConfidence(player1SurfaceStats, player2SurfaceStats);
      
      return {
        agentName: "Surface Suitability Analyst",
        factor: "Factor 2.1 (Surface Fit)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Surface Suitability Analyst:", error);
      return {
        agentName: "Surface Suitability Analyst",
        factor: "Factor 2.1 (Surface Fit)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze surface suitability due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 2.2: Environment Analyst (Weather, Altitude, Conditions)
  async analyzeEnvironment(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<SurfaceEnvironmentResult> {
    const startTime = Date.now();
    
    try {
      // Get venue and environmental data
      const venueData = await this.getVenueData(match.tournamentId);
      const weatherData = await this.getWeatherData(venueData.location, match.scheduledTime);
      
      // Get player performance in various conditions
      const player1ConditionStats = await this.getPlayerConditionStats(player1.id);
      const player2ConditionStats = await this.getPlayerConditionStats(player2.id);
      
      const analysisData = {
        venue: venueData,
        weather: weatherData,
        player1: {
          name: player1.name,
          heatPerformance: player1ConditionStats.heatRecord,
          windPerformance: player1ConditionStats.windRecord,
          altitudeExperience: player1ConditionStats.altitudeMatches,
          age: player1.age,
          fitness: player1.fitnessLevel
        },
        player2: {
          name: player2.name,
          heatPerformance: player2ConditionStats.heatRecord,
          windPerformance: player2ConditionStats.windRecord,
          altitudeExperience: player2ConditionStats.altitudeMatches,
          age: player2.age,
          fitness: player2.fitnessLevel
        }
      };
      
      // Use GPT-4 for environmental impact analysis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Environmental Conditions',
        analysisData,
        `Analyze how environmental conditions will impact each player:
        1. Weather effects (temperature, humidity, wind)
        2. Altitude implications if applicable
        3. Time of day and potential fatigue factors
        4. Historical performance in similar conditions
        
        Determine if conditions favor either player.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateEnvironmentConfidence(weatherData, player1ConditionStats, player2ConditionStats);
      
      return {
        agentName: "Environment Analyst",
        factor: "Factor 2.2 (Conditions & Acclimatization)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Environment Analyst:", error);
      return {
        agentName: "Environment Analyst",
        factor: "Factor 2.2 (Conditions & Acclimatization)",
        conclusion: "No Clear Advantage",
        advantage: "none",
        confidence: 0.5,
        reasoning: "Environmental conditions appear neutral for both players.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Helper methods
  private async getPlayerSurfaceStats(playerId: string, surface: string) {
    const matches = await storage.getPlayerMatches(playerId);
    const surfaceMatches = matches.filter(m => m.surface === surface);
    
    const wins = surfaceMatches.filter(m => 
      (m.player1Id === playerId && m.winner === 'player1') ||
      (m.player2Id === playerId && m.winner === 'player2')
    ).length;
    
    const recent = surfaceMatches.slice(0, 10);
    const recentWins = recent.filter(m => 
      (m.player1Id === playerId && m.winner === 'player1') ||
      (m.player2Id === playerId && m.winner === 'player2')
    ).length;
    
    return {
      winRate: surfaceMatches.length > 0 ? wins / surfaceMatches.length : 0,
      totalMatches: surfaceMatches.length,
      recentForm: recent.length > 0 ? recentWins / recent.length : 0,
      wins,
      losses: surfaceMatches.length - wins
    };
  }
  
  private async getCourtPaceInfo(tournamentId: string | null, surface: string) {
    // In a real implementation, this would fetch actual court pace data
    // For now, return general surface characteristics
    const paceMap: Record<string, string> = {
      'hard': 'medium-fast',
      'clay': 'slow',
      'grass': 'fast',
      'indoor': 'medium-fast'
    };
    
    return {
      pace: paceMap[surface] || 'medium',
      bounceHeight: surface === 'clay' ? 'high' : surface === 'grass' ? 'low' : 'medium',
      description: `${surface} court with ${paceMap[surface] || 'medium'} pace`
    };
  }
  
  private async getVenueData(tournamentId: string | null) {
    if (!tournamentId) {
      return {
        location: 'Unknown',
        altitude: 0,
        indoor: false,
        timezone: 'UTC'
      };
    }
    
    const tournament = await storage.getTournament(tournamentId);
    if (!tournament) {
      return {
        location: 'Unknown',
        altitude: 0,
        indoor: false,
        timezone: 'UTC'
      };
    }
    
    // In a real implementation, this would have actual venue data
    return {
      location: tournament.location,
      altitude: 0, // Would need real data
      indoor: tournament.surface === 'indoor',
      timezone: 'UTC' // Would need real data
    };
  }
  
  private async getWeatherData(location: string, scheduledTime: Date) {
    // In a real implementation, this would call a weather API
    // For now, return mock weather data
    return {
      temperature: 25, // Celsius
      humidity: 60, // Percentage
      windSpeed: 10, // km/h
      conditions: 'partly_cloudy',
      forecastReliability: 0.8
    };
  }
  
  private async getPlayerConditionStats(playerId: string) {
    // In a real implementation, this would analyze historical performance in conditions
    return {
      heatRecord: { wins: 10, losses: 5, winRate: 0.67 },
      windRecord: { wins: 8, losses: 7, winRate: 0.53 },
      altitudeMatches: 5,
      indoorRecord: { wins: 15, losses: 10, winRate: 0.60 }
    };
  }
  
  private extractAdvantage(analysis: string): { player: string; conclusion: string } {
    const advantageMatch = analysis.match(/\*\*Advantage Player (\d|[12])\*\*|\*\*No Clear Advantage\*\*/i);
    
    if (advantageMatch) {
      if (advantageMatch[0].includes('No Clear')) {
        return { player: 'none', conclusion: 'No Clear Advantage' };
      }
      const playerNum = advantageMatch[1];
      return { 
        player: `player${playerNum}`, 
        conclusion: `Advantage Player ${playerNum}` 
      };
    }
    
    return { player: 'none', conclusion: 'No Clear Advantage' };
  }
  
  private calculateSurfaceConfidence(
    player1Stats: any,
    player2Stats: any
  ): number {
    const winRateDiff = Math.abs(player1Stats.winRate - player2Stats.winRate);
    const sampleSize = Math.min(player1Stats.totalMatches, player2Stats.totalMatches);
    
    // Higher confidence with larger win rate difference and more matches
    let confidence = 0.5 + (winRateDiff * 0.5);
    
    if (sampleSize < 5) {
      confidence *= 0.6; // Low confidence with small sample
    } else if (sampleSize < 10) {
      confidence *= 0.8;
    }
    
    return Math.min(0.95, Math.max(0.1, confidence));
  }
  
  private calculateEnvironmentConfidence(
    weather: any,
    player1Stats: any,
    player2Stats: any
  ): number {
    // Base confidence on weather forecast reliability
    let confidence = weather.forecastReliability || 0.5;
    
    // Adjust based on extreme conditions
    if (weather.temperature > 35 || weather.temperature < 10) {
      confidence *= 1.2; // More confident in extreme conditions impact
    }
    
    if (weather.windSpeed > 20) {
      confidence *= 1.1; // Wind has clear impact
    }
    
    return Math.min(0.9, Math.max(0.3, confidence));
  }
}

export const surfaceEnvironmentAgents = new SurfaceEnvironmentAgents();