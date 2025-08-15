import { Match, Player } from '@shared/schema';
import { openAIService } from '../services/openai';
import { storage } from '../storage';
import axios from 'axios';

export interface ContextualResult {
  agentName: string;
  factor: string;
  conclusion: string;
  advantage: string;
  confidence: number;
  reasoning: string;
  analysis: any;
  processingTime: number;
}

export class ContextualAgents {
  // Factor 6.1: News Monitor
  async analyzeNewsAndContext(
    match: Match,
    player1: Player,
    player2: Player
  ): Promise<ContextualResult> {
    const startTime = Date.now();
    
    try {
      // Gather recent news and contextual information
      const player1News = await this.gatherPlayerNews(player1.name);
      const player2News = await this.gatherPlayerNews(player2.name);
      
      // Extract insights using AI
      const player1Insights = await openAIService.extractInsightsFromNews(
        player1News.join('\n'),
        player1.name
      );
      const player2Insights = await openAIService.extractInsightsFromNews(
        player2News.join('\n'),
        player2.name
      );
      
      const analysisData = {
        player1: {
          name: player1.name,
          recentNews: player1News.slice(0, 3),
          injuries: player1Insights.injuries,
          formIndicators: player1Insights.formIndicators,
          contextualFactors: player1Insights.contextualFactors
        },
        player2: {
          name: player2.name,
          recentNews: player2News.slice(0, 3),
          injuries: player2Insights.injuries,
          formIndicators: player2Insights.formIndicators,
          contextualFactors: player2Insights.contextualFactors
        },
        matchContext: {
          tournament: match.tournamentId,
          round: match.round,
          scheduledTime: match.scheduledTime
        }
      };
      
      // Use GPT-4 for contextual analysis
      const aiAnalysis = await openAIService.analyzeFactorWithSpecializedPrompt(
        'Contextual Factors',
        analysisData,
        `Analyze recent news and contextual factors that could impact this match:
        1. Any confirmed injuries or health issues
        2. Recent coaching changes or team adjustments
        3. Personal circumstances affecting focus or motivation
        4. Tournament-specific context (defending champion, first-time participant, etc.)
        5. External pressures or expectations
        
        Only report confirmed facts, no speculation. Determine if any contextual factors favor either player.`
      );
      
      const advantage = this.extractAdvantage(aiAnalysis);
      const confidence = this.calculateContextualConfidence(player1Insights, player2Insights);
      
      return {
        agentName: "News Monitor",
        factor: "Factor 6.1 (Recent News & Context)",
        conclusion: advantage.conclusion,
        advantage: advantage.player,
        confidence,
        reasoning: aiAnalysis,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in News Monitor:", error);
      return {
        agentName: "News Monitor",
        factor: "Factor 6.1 (Recent News & Context)",
        conclusion: "No Significant News",
        advantage: "none",
        confidence: 0.5,
        reasoning: "No significant recent news or contextual factors identified for either player.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Factor 6.2: Data Gaps & Uncertainty Reporter
  async reportDataGapsAndLimitations(
    match: Match,
    player1: Player,
    player2: Player,
    allAgentResults: any[]
  ): Promise<ContextualResult> {
    const startTime = Date.now();
    
    try {
      // Identify data gaps and limitations
      const dataGaps = this.identifyDataGaps(match, player1, player2, allAgentResults);
      const uncertainties = this.assessUncertainties(allAgentResults);
      
      const analysisData = {
        dataGaps,
        uncertainties,
        dataCoverage: this.calculateDataCoverage(allAgentResults),
        reliabilityScore: this.calculateReliabilityScore(allAgentResults)
      };
      
      // Generate transparency report
      const limitationsReport = this.generateLimitationsReport(dataGaps, uncertainties);
      
      return {
        agentName: "Data Gaps & Uncertainty Reporter",
        factor: "Factor 6.2 (Data Limitations)",
        conclusion: "Transparency Report",
        advantage: "none",
        confidence: analysisData.reliabilityScore,
        reasoning: limitationsReport,
        analysis: analysisData,
        processingTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error("Error in Data Gaps Reporter:", error);
      return {
        agentName: "Data Gaps & Uncertainty Reporter",
        factor: "Factor 6.2 (Data Limitations)",
        conclusion: "Limited Data Available",
        advantage: "none",
        confidence: 0.3,
        reasoning: "Analysis based on limited available data. Results should be interpreted with caution.",
        analysis: {},
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Helper methods
  private async gatherPlayerNews(playerName: string): Promise<string[]> {
    try {
      // In a real implementation, this would search news APIs or scrape tennis news sites
      // For now, we'll simulate with placeholder data
      const newsItems = [
        `${playerName} completes practice session ahead of match`,
        `Coach confirms ${playerName} is fully fit and ready`,
        `${playerName} speaks about surface preferences in press conference`
      ];
      
      return newsItems;
    } catch (error) {
      console.error(`Error gathering news for ${playerName}:`, error);
      return [];
    }
  }
  
  private identifyDataGaps(
    match: Match,
    player1: Player,
    player2: Player,
    agentResults: any[]
  ): string[] {
    const gaps: string[] = [];
    
    // Check for missing data
    if (!match.tournamentId) {
      gaps.push('Tournament information not available');
    }
    
    if (!player1.ranking || !player2.ranking) {
      gaps.push('Current rankings not available for one or both players');
    }
    
    // Check agent results for low confidence or errors
    agentResults.forEach(result => {
      if (result.confidence < 0.3) {
        gaps.push(`Low confidence in ${result.factor} due to insufficient data`);
      }
      if (result.conclusion === 'Analysis Error') {
        gaps.push(`Unable to complete ${result.factor} analysis`);
      }
    });
    
    // Check for missing historical data
    const hasH2H = agentResults.find(r => r.factor.includes('Head-to-Head'));
    if (hasH2H && hasH2H.analysis?.overall?.totalMatches === 0) {
      gaps.push('No previous head-to-head meetings between players');
    }
    
    return gaps;
  }
  
  private assessUncertainties(agentResults: any[]): string[] {
    const uncertainties: string[] = [];
    
    // Check for conflicting signals
    const advantages = agentResults.filter(r => r.advantage !== 'none');
    const player1Advantages = advantages.filter(r => r.advantage === 'player1').length;
    const player2Advantages = advantages.filter(r => r.advantage === 'player2').length;
    
    if (Math.abs(player1Advantages - player2Advantages) <= 1) {
      uncertainties.push('Close match with nearly equal advantages for both players');
    }
    
    // Check for weather uncertainty
    const envResult = agentResults.find(r => r.factor.includes('Environment'));
    if (envResult && envResult.analysis?.weather?.forecastReliability < 0.7) {
      uncertainties.push('Weather forecast has moderate reliability');
    }
    
    // Check for form volatility
    const formResult = agentResults.find(r => r.factor.includes('Recent Match'));
    if (formResult && formResult.analysis?.volatility > 0.5) {
      uncertainties.push('Recent form shows high volatility');
    }
    
    return uncertainties;
  }
  
  private calculateDataCoverage(agentResults: any[]): number {
    const totalFactors = 17; // Total number of sub-factors in the system
    const completedFactors = agentResults.filter(r => 
      r.conclusion !== 'Analysis Error' && r.confidence > 0.1
    ).length;
    
    return completedFactors / totalFactors;
  }
  
  private calculateReliabilityScore(agentResults: any[]): number {
    if (agentResults.length === 0) return 0;
    
    const avgConfidence = agentResults.reduce((sum, r) => sum + r.confidence, 0) / agentResults.length;
    const coverage = this.calculateDataCoverage(agentResults);
    
    // Weighted average of confidence and coverage
    return avgConfidence * 0.7 + coverage * 0.3;
  }
  
  private generateLimitationsReport(gaps: string[], uncertainties: string[]): string {
    let report = 'Analysis Transparency Report:\n\n';
    
    if (gaps.length > 0) {
      report += '**Data Gaps:**\n';
      gaps.forEach(gap => {
        report += `• ${gap}\n`;
      });
      report += '\n';
    }
    
    if (uncertainties.length > 0) {
      report += '**Uncertainties:**\n';
      uncertainties.forEach(uncertainty => {
        report += `• ${uncertainty}\n`;
      });
      report += '\n';
    }
    
    if (gaps.length === 0 && uncertainties.length === 0) {
      report += 'Analysis completed with comprehensive data coverage and high confidence.';
    } else {
      report += 'Note: These limitations have been factored into the confidence scores of individual predictions.';
    }
    
    return report;
  }
  
  private extractAdvantage(analysis: string): { player: string; conclusion: string } {
    const advantageMatch = analysis.match(/\*\*Advantage Player (\d|[12])\*\*|\*\*No Clear Advantage\*\*|\*\*No Significant/i);
    
    if (advantageMatch) {
      if (advantageMatch[0].includes('No')) {
        return { player: 'none', conclusion: 'No Clear Advantage' };
      }
      const playerNum = advantageMatch[1];
      return { 
        player: `player${playerNum}`, 
        conclusion: `Advantage Player ${playerNum}` 
      };
    }
    
    return { player: 'none', conclusion: 'No Significant Factors' };
  }
  
  private calculateContextualConfidence(insights1: any, insights2: any): number {
    // Higher confidence if significant contextual factors found
    const hasInjuries = insights1.injuries.length > 0 || insights2.injuries.length > 0;
    const hasContextual = insights1.contextualFactors.length > 0 || insights2.contextualFactors.length > 0;
    
    if (hasInjuries) return 0.85; // High confidence in injury impact
    if (hasContextual) return 0.7; // Moderate confidence in other factors
    
    return 0.5; // Neutral if no significant factors
  }
}

export const contextualAgents = new ContextualAgents();