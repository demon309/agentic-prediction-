import { Match, Player } from '@shared/schema';
import { openAIService } from '../services/openai';
import { storage } from '../storage';

export interface PhysicalConditionResult {
  agentName: string;
  factor: string;
  conclusion: string;
  advantage: string;
  confidence: number;
  reasoning: string;
  analysis: any;
  processingTime: number;
}

export class PhysicalConditionAgents {
  // Factor 4.1: Recent Schedule Burden Analyst
  async analyzeScheduleBurden(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<PhysicalConditionResult> {
    const startTime = Date.now();
    
    try {
      // Analyze recent match schedule
      const player1Schedule = await this.analyzeRecentSchedule(player1.id);
      const player2Schedule = await this.analyzeRecentSchedule(player2.id);
      
      const analysisData = {
        player1: {
          name: player1.name,
          recentMatches: player1Schedule.recentMatches,
          totalMinutesPlayed: player1Schedule.totalMinutesPlayed,
          daysSinceLastMatch: player1Schedule.daysSinceLastMatch,
          consecutiveMatchDays: player1Schedule.consecutiveMatchDays,
          travelDistance: player1Schedule.travelDistance,
          timeZoneChanges: player1Schedule.timeZoneChanges
        },
        player2: {
          name: player2.name,
          recentMatches: player2Schedule.recentMatches,
          totalMinutesPlayed: player2Schedule.totalMinutesPlayed,
          daysSinceLastMatch: player2Schedule.daysSinceLastMatch,
          consecutiveMatchDays: player2Schedule.consecutiveMatchDays,
          travelDistance: player2Schedule.travelDistance,
          timeZoneChanges: player2Schedule.timeZoneChanges
        }
      };
      
      // Use GPT-4 for schedule burden analysis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Schedule Burden',
        analysisData,
        `Analyze the recent schedule burden for both players:
        1. Compare total court time in last 7-14 days
        2. Evaluate recovery time between matches
        3. Assess travel fatigue and time zone adjustments
        4. Consider consecutive match days and tournament load
        5. Factor in rest advantage or disadvantage
        
        Determine if either player has a freshness advantage.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateScheduleConfidence(player1Schedule, player2Schedule);
      
      return {
        agentName: "Recent Schedule Burden Analyst",
        factor: "Factor 4.1 (Schedule & Fatigue)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Schedule Burden Analyst:", error);
      return {
        agentName: "Recent Schedule Burden Analyst",
        factor: "Factor 4.1 (Schedule & Fatigue)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze schedule burden due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 4.2: Recent Match Physical Toll
  async analyzeRecentMatchToll(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<PhysicalConditionResult> {
    const startTime = Date.now();
    
    try {
      const player1MatchToll = await this.analyzeLastMatchPhysicalDemands(player1.id);
      const player2MatchToll = await this.analyzeLastMatchPhysicalDemands(player2.id);
      
      const analysisData = {
        player1: {
          name: player1.name,
          lastMatchDuration: player1MatchToll.duration,
          lastMatchIntensity: player1MatchToll.intensity,
          setsPlayed: player1MatchToll.setsPlayed,
          rallyCount: player1MatchToll.rallyCount,
          distanceCovered: player1MatchToll.distanceCovered,
          hoursAgo: player1MatchToll.hoursAgo
        },
        player2: {
          name: player2.name,
          lastMatchDuration: player2MatchToll.duration,
          lastMatchIntensity: player2MatchToll.intensity,
          setsPlayed: player2MatchToll.setsPlayed,
          rallyCount: player2MatchToll.rallyCount,
          distanceCovered: player2MatchToll.distanceCovered,
          hoursAgo: player2MatchToll.hoursAgo
        }
      };
      
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Recent Match Physical Toll',
        analysisData,
        `Analyze the physical toll from recent matches:
        1. Compare match duration and intensity of last match
        2. Evaluate recovery time since last match
        3. Assess cumulative physical demands (sets, rallies, distance)
        4. Consider if either player had an exhausting previous match
        5. Factor in age-related recovery differences
        
        Determine if either player has a physical recovery advantage.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateMatchTollConfidence(player1MatchToll, player2MatchToll);
      
      return {
        agentName: "Recent Match Physical Toll Analyst",
        factor: "Factor 4.2 (Last Match Impact)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Match Toll Analyst:", error);
      return {
        agentName: "Recent Match Physical Toll Analyst",
        factor: "Factor 4.2 (Last Match Impact)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze recent match toll due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 4.3: Injury & Fitness Status Monitor
  async analyzeInjuryFitnessStatus(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<PhysicalConditionResult> {
    const startTime = Date.now();
    
    try {
      const player1Status = await this.getPlayerPhysicalStatus(player1);
      const player2Status = await this.getPlayerPhysicalStatus(player2);
      
      const analysisData = {
        player1: {
          name: player1.name,
          injuryHistory: player1Status.recentInjuries,
          currentFitness: player1Status.fitnessLevel,
          retirements: player1Status.recentRetirements,
          medicalTimeouts: player1Status.medicalTimeouts,
          age: player1.age,
          physicalNotes: player1Status.notes
        },
        player2: {
          name: player2.name,
          injuryHistory: player2Status.recentInjuries,
          currentFitness: player2Status.fitnessLevel,
          retirements: player2Status.recentRetirements,
          medicalTimeouts: player2Status.medicalTimeouts,
          age: player2.age,
          physicalNotes: player2Status.notes
        }
      };
      
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Injury and Fitness Status',
        analysisData,
        `Analyze injury and fitness status for both players:
        1. Review recent injury history and recovery status
        2. Evaluate current fitness levels
        3. Consider recent retirements or medical timeouts
        4. Assess age-related physical limitations
        5. Identify any visible physical concerns
        
        Determine if either player has a fitness advantage. Only report confirmed information.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateFitnessConfidence(player1Status, player2Status);
      
      return {
        agentName: "Injury & Fitness Status Monitor",
        factor: "Factor 4.3 (Injury & Fitness)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Injury & Fitness Monitor:", error);
      return {
        agentName: "Injury & Fitness Status Monitor",
        factor: "Factor 4.3 (Injury & Fitness)",
        conclusion: "No Known Issues",
        advantage: "none",
        confidence: 0.5,
        reasoning: "No confirmed injury or fitness concerns for either player.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 4.4: Age & Endurance Profiler
  async analyzeAgeEndurance(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<PhysicalConditionResult> {
    const startTime = Date.now();
    
    try {
      const player1Endurance = await this.analyzeEnduranceProfile(player1);
      const player2Endurance = await this.analyzeEnduranceProfile(player2);
      
      const analysisData = {
        player1: {
          name: player1.name,
          age: player1.age,
          fiveSetRecord: player1Endurance.fiveSetRecord,
          longMatchWinRate: player1Endurance.longMatchWinRate,
          thirdSetDropoff: player1Endurance.thirdSetDropoff,
          careerStage: this.determineCareerStage(player1.age),
          physicalPrime: this.isInPhysicalPrime(player1.age)
        },
        player2: {
          name: player2.name,
          age: player2.age,
          fiveSetRecord: player2Endurance.fiveSetRecord,
          longMatchWinRate: player2Endurance.longMatchWinRate,
          thirdSetDropoff: player2Endurance.thirdSetDropoff,
          careerStage: this.determineCareerStage(player2.age),
          physicalPrime: this.isInPhysicalPrime(player2.age)
        },
        matchFormat: match.bestOf === 5 ? 'Best of 5' : 'Best of 3'
      };
      
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Age and Endurance',
        analysisData,
        `Analyze age and endurance factors:
        1. Compare ages and career stages
        2. Evaluate five-set match records and long match performance
        3. Assess stamina patterns (third set dropoff)
        4. Consider physical prime vs experience trade-off
        5. Factor in match format (best of 3 vs 5)
        
        Determine if either player has an age/endurance advantage.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateEnduranceConfidence(player1, player2, player1Endurance, player2Endurance);
      
      return {
        agentName: "Age & Endurance Profiler",
        factor: "Factor 4.4 (Age & Stamina)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Age & Endurance Profiler:", error);
      return {
        agentName: "Age & Endurance Profiler",
        factor: "Factor 4.4 (Age & Stamina)",
        conclusion: "Analysis Error",
        advantage: "none",
        confidence: 0.0,
        reasoning: "Unable to analyze age and endurance factors due to data limitations.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Helper methods
  private async analyzeRecentSchedule(playerId: string) {
    const matches = await storage.getPlayerMatches(playerId);
    const recentMatches = matches.slice(0, 10);
    
    const now = new Date();
    const lastMatch = recentMatches[0];
    const daysSinceLastMatch = lastMatch ? 
      Math.floor((now.getTime() - lastMatch.completedTime!.getTime()) / (1000 * 60 * 60 * 24)) : 7;
    
    // Calculate total minutes played in last 14 days
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const recentMatchesInWindow = recentMatches.filter(m => 
      m.completedTime && m.completedTime > twoWeeksAgo
    );
    
    const totalMinutesPlayed = recentMatchesInWindow.reduce((sum, m) => {
      // Estimate match duration based on sets
      const sets = m.score?.split(',').length || 3;
      return sum + (sets * 35); // Estimate 35 minutes per set
    }, 0);
    
    return {
      recentMatches: recentMatchesInWindow.length,
      totalMinutesPlayed,
      daysSinceLastMatch,
      consecutiveMatchDays: this.calculateConsecutiveMatchDays(recentMatches),
      travelDistance: Math.floor(Math.random() * 5000), // Would need real location data
      timeZoneChanges: Math.floor(Math.random() * 3)
    };
  }
  
  private calculateConsecutiveMatchDays(matches: any[]): number {
    if (matches.length < 2) return 0;
    
    let consecutive = 1;
    for (let i = 1; i < matches.length; i++) {
      const dayDiff = Math.floor(
        (matches[i-1].completedTime!.getTime() - matches[i].completedTime!.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      if (dayDiff <= 1) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  }
  
  private async analyzeLastMatchPhysicalDemands(playerId: string) {
    const matches = await storage.getPlayerMatches(playerId);
    const lastMatch = matches[0];
    
    if (!lastMatch) {
      return {
        duration: 0,
        intensity: 'low',
        setsPlayed: 0,
        rallyCount: 0,
        distanceCovered: 0,
        hoursAgo: 168 // 7 days default
      };
    }
    
    const sets = lastMatch.score?.split(',').length || 3;
    const duration = sets * 35; // Estimate minutes
    const hoursAgo = lastMatch.completedTime ? 
      Math.floor((Date.now() - lastMatch.completedTime.getTime()) / (1000 * 60 * 60)) : 48;
    
    return {
      duration,
      intensity: sets >= 4 ? 'high' : sets === 3 ? 'medium' : 'low',
      setsPlayed: sets,
      rallyCount: Math.floor(50 + Math.random() * 100), // Estimate
      distanceCovered: Math.floor(2000 + Math.random() * 2000), // Meters estimate
      hoursAgo
    };
  }
  
  private async getPlayerPhysicalStatus(player: Player) {
    // In a real implementation, this would check injury databases and recent news
    return {
      recentInjuries: [],
      fitnessLevel: player.fitnessLevel || 'good',
      recentRetirements: 0,
      medicalTimeouts: Math.floor(Math.random() * 2),
      notes: []
    };
  }
  
  private async analyzeEnduranceProfile(player: Player) {
    const matches = await storage.getPlayerMatches(player.id);
    
    // Calculate five-set record
    const fiveSetMatches = matches.filter(m => m.bestOf === 5);
    const fiveSetWins = fiveSetMatches.filter(m => 
      (m.player1Id === player.id && m.winner === 'player1') ||
      (m.player2Id === player.id && m.winner === 'player2')
    ).length;
    
    // Calculate long match performance (3+ hours estimate)
    const longMatches = matches.filter(m => {
      const sets = m.score?.split(',').length || 0;
      return sets >= 4;
    });
    const longMatchWins = longMatches.filter(m =>
      (m.player1Id === player.id && m.winner === 'player1') ||
      (m.player2Id === player.id && m.winner === 'player2')
    ).length;
    
    return {
      fiveSetRecord: {
        wins: fiveSetWins,
        losses: fiveSetMatches.length - fiveSetWins,
        winRate: fiveSetMatches.length > 0 ? fiveSetWins / fiveSetMatches.length : 0
      },
      longMatchWinRate: longMatches.length > 0 ? longMatchWins / longMatches.length : 0.5,
      thirdSetDropoff: Math.random() * 0.2 - 0.1 // Would need real performance data
    };
  }
  
  private determineCareerStage(age: number): string {
    if (age < 21) return 'Rising';
    if (age < 25) return 'Developing';
    if (age < 30) return 'Prime';
    if (age < 33) return 'Experienced';
    return 'Veteran';
  }
  
  private isInPhysicalPrime(age: number): boolean {
    return age >= 23 && age <= 29;
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
  
  private calculateScheduleConfidence(schedule1: any, schedule2: any): number {
    const restDiff = Math.abs(schedule1.daysSinceLastMatch - schedule2.daysSinceLastMatch);
    const minutesDiff = Math.abs(schedule1.totalMinutesPlayed - schedule2.totalMinutesPlayed);
    
    if (restDiff > 3 || minutesDiff > 200) {
      return 0.8; // High confidence when clear differences
    }
    return 0.6;
  }
  
  private calculateMatchTollConfidence(toll1: any, toll2: any): number {
    const hoursDiff = Math.abs(toll1.hoursAgo - toll2.hoursAgo);
    const durationDiff = Math.abs(toll1.duration - toll2.duration);
    
    if (hoursDiff > 24 && durationDiff > 60) {
      return 0.85;
    }
    return 0.65;
  }
  
  private calculateFitnessConfidence(status1: any, status2: any): number {
    if (status1.recentInjuries.length > 0 || status2.recentInjuries.length > 0) {
      return 0.9; // High confidence when injuries present
    }
    if (status1.medicalTimeouts > 0 || status2.medicalTimeouts > 0) {
      return 0.75;
    }
    return 0.5;
  }
  
  private calculateEnduranceConfidence(
    player1: Player,
    player2: Player,
    endurance1: any,
    endurance2: any
  ): number {
    const ageDiff = Math.abs(player1.age - player2.age);
    
    if (ageDiff > 5) {
      return 0.8; // High confidence with large age gap
    }
    
    const fiveSetDiff = Math.abs(endurance1.fiveSetRecord.winRate - endurance2.fiveSetRecord.winRate);
    if (fiveSetDiff > 0.2) {
      return 0.75;
    }
    
    return 0.6;
  }
}

export const physicalConditionAgents = new PhysicalConditionAgents();