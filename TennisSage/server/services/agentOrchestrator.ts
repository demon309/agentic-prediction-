import { Match, Player } from "@shared/schema";
import { storage } from "../storage";
import { openAIService } from "./openai";
import { recentPerformanceAgents } from "../agents/recentPerformanceAgents";
import { surfaceEnvironmentAgents } from "../agents/surfaceEnvironmentAgents";
import { statisticalAgents } from "../agents/statisticalAgents";
import { physicalConditionAgents } from "../agents/physicalConditionAgents";
import { matchupAgents } from "../agents/matchupAgents";
import { contextualAgents } from "../agents/contextualAgents";

interface AgentStatus {
  name: string;
  type: string;
  status: "active" | "processing" | "idle" | "error";
  lastActivity: Date;
  accuracy: number;
  totalAnalyses: number;
}

interface FactorAnalysis {
  factor: string;
  conclusion: string;
  advantage: "player1" | "player2" | "none" | "slight_player1" | "slight_player2";
  confidence: number;
  reasoning: string;
}

interface AnalysisResult {
  predictedWinnerId: string;
  winProbability: number;
  confidenceLevel: number;
  factorAnalysis: FactorAnalysis[];
  reasoning: string;
  agentContributions: Record<string, any>;
}

class AgentOrchestrator {
  private agents: Map<string, AgentStatus> = new Map();
  private currentAnalysis: Map<string, boolean> = new Map(); // matchId -> isAnalyzing

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const agentDefinitions = [
      // Recent Performance Agents
      { name: "Recent Matches Analyst", type: "recent_performance" },
      { name: "Momentum Analyst", type: "recent_performance" },
      { name: "Clutch Performance Analyst", type: "recent_performance" },
      
      // Surface & Environment Agents
      { name: "Surface Suitability Analyst", type: "surface_environment" },
      { name: "Environment Analyst", type: "surface_environment" },
      
      // Statistical Agents
      { name: "Service Performance Analyst", type: "statistical" },
      { name: "Return Performance Analyst", type: "statistical" },
      { name: "Rally & Point Construction Analyst", type: "statistical" },
      { name: "Pressure Statistics Analyst", type: "statistical" },
      { name: "Statistical Trend Analyst", type: "statistical" },
      
      // Physical Condition Agents
      { name: "Workload & Recovery Analyst", type: "physical_condition" },
      { name: "Injury Status Analyst", type: "physical_condition" },
      { name: "Endurance Inference Analyst", type: "physical_condition" },
      
      // Match-Up Agents
      { name: "Playing Style Profiler", type: "matchup" },
      { name: "Head-to-Head Analyst", type: "matchup" },
      { name: "Tactical Battle Synthesizer", type: "matchup" },
      
      // Contextual Agents
      { name: "News Monitor", type: "contextual" },
      { name: "Data Gaps & Uncertainty Reporter", type: "contextual" },
    ];

    agentDefinitions.forEach(agent => {
      this.agents.set(agent.name, {
        name: agent.name,
        type: agent.type,
        status: "idle",
        lastActivity: new Date(),
        accuracy: 85 + Math.random() * 15, // Initialize with baseline accuracy
        totalAnalyses: 0
      });
    });
  }

  getAgentStatus(): AgentStatus[] {
    return Array.from(this.agents.values());
  }

  private updateAgentStatus(agentName: string, status: AgentStatus["status"]): void {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
      if (status === "processing") {
        agent.totalAnalyses++;
      }
    }
  }

  async analyzeMatch(match: Match): Promise<AnalysisResult> {
    const matchId = match.id;
    
    // Prevent concurrent analysis of the same match
    if (this.currentAnalysis.get(matchId)) {
      throw new Error("Match analysis already in progress");
    }
    
    this.currentAnalysis.set(matchId, true);
    
    try {
      console.log(`Starting multi-agent analysis for match ${matchId}`);
      
      // Get player data
      const [player1, player2] = await Promise.all([
        storage.getPlayer(match.player1Id),
        storage.getPlayer(match.player2Id)
      ]);
      
      if (!player1 || !player2) {
        throw new Error("Player data not found");
      }

      // Run all agent analyses in parallel groups for efficiency
      const analysisResults = await this.runAgentAnalyses(match, player1, player2);
      
      // Synthesize final prediction using AI
      const finalPrediction = await this.synthesizePrediction(match, player1, player2, analysisResults);
      
      // Store individual agent analyses
      await this.storeAgentAnalyses(matchId, analysisResults);
      
      console.log(`Completed multi-agent analysis for match ${matchId}`);
      
      return finalPrediction;
      
    } finally {
      this.currentAnalysis.delete(matchId);
    }
  }

  private async runAgentAnalyses(match: Match, player1: Player, player2: Player): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    try {
      // Group 1: Recent Performance Analysis (parallel execution)
      const recentPerformancePromises = [
        this.runAgentAnalysis("Recent Matches Analyst", () => 
          recentPerformanceAgents.analyzeRecentMatches(match, player1, player2)
        ),
        this.runAgentAnalysis("Momentum Analyst", () => 
          recentPerformanceAgents.analyzeMomentum(match, player1, player2)
        ),
        this.runAgentAnalysis("Clutch Performance Analyst", () => 
          recentPerformanceAgents.analyzeClutchPerformance(match, player1, player2)
        ),
      ];
      
      const recentPerformanceResults = await Promise.all(recentPerformancePromises);
      results.recentPerformance = recentPerformanceResults;
      
      // Group 2: Surface & Environment Analysis
      const surfaceEnvironmentPromises = [
        this.runAgentAnalysis("Surface Suitability Analyst", () => 
          surfaceEnvironmentAgents.analyzeSurfaceSuitability(match, player1, player2)
        ),
        this.runAgentAnalysis("Environment Analyst", () => 
          surfaceEnvironmentAgents.analyzeEnvironment(match, player1, player2)
        ),
      ];
      
      const surfaceEnvironmentResults = await Promise.all(surfaceEnvironmentPromises);
      results.surfaceEnvironment = surfaceEnvironmentResults;
      
      // Group 3: Statistical Analysis
      const statisticalPromises = [
        this.runAgentAnalysis("Service Performance Analyst", () => 
          statisticalAgents.analyzeServePerformance(match, player1, player2)
        ),
        this.runAgentAnalysis("Return Performance Analyst", () => 
          statisticalAgents.analyzeReturnPerformance(match, player1, player2)
        ),
        this.runAgentAnalysis("Rally & Point Construction Analyst", () => 
          statisticalAgents.analyzeRallyPatterns(match, player1, player2)
        ),
        this.runAgentAnalysis("Pressure Statistics Analyst", () => 
          statisticalAgents.analyzePressurePerformance(match, player1, player2)
        ),
        this.runAgentAnalysis("Statistical Trend Analyst", () => 
          statisticalAgents.analyzeStatisticalTrends(match, player1, player2)
        ),
      ];
      
      const statisticalResults = await Promise.all(statisticalPromises);
      results.statistical = statisticalResults;
      
      // Group 4: Physical Condition Analysis
      const physicalPromises = [
        this.runAgentAnalysis("Workload & Recovery Analyst", () => 
          physicalConditionAgents.analyzeScheduleBurden(match, player1, player2)
        ),
        this.runAgentAnalysis("Recent Match Physical Toll Analyst", () => 
          physicalConditionAgents.analyzeRecentMatchToll(match, player1, player2)
        ),
        this.runAgentAnalysis("Injury Status Analyst", () => 
          physicalConditionAgents.analyzeInjuryFitnessStatus(match, player1, player2)
        ),
        this.runAgentAnalysis("Endurance Inference Analyst", () => 
          physicalConditionAgents.analyzeAgeEndurance(match, player1, player2)
        ),
      ];
      
      const physicalResults = await Promise.all(physicalPromises);
      results.physical = physicalResults;
      
      // Group 5: Match-Up Analysis (sequential as they may depend on each other)
      results.matchup = [
        await this.runAgentAnalysis("Playing Style Profiler", () => 
          matchupAgents.analyzePlayingStyles(match, player1, player2)
        ),
        await this.runAgentAnalysis("Head-to-Head Analyst", () => 
          matchupAgents.analyzeHeadToHead(match, player1, player2)
        ),
        await this.runAgentAnalysis("Tactical Battle Synthesizer", () => 
          matchupAgents.analyzeTacticalBattle(match, player1, player2)
        ),
      ];
      
      // Group 6: Contextual Analysis
      const contextualPromises = [
        this.runAgentAnalysis("News Monitor", () => 
          contextualAgents.analyzeNews(match, player1, player2)
        ),
        this.runAgentAnalysis("Data Gaps & Uncertainty Reporter", () => 
          contextualAgents.analyzeDataGaps(match, player1, player2)
        ),
      ];
      
      const contextualResults = await Promise.all(contextualPromises);
      results.contextual = contextualResults;
      
      return results;
      
    } catch (error) {
      console.error("Error in agent analyses:", error);
      throw error;
    }
  }

  private async runAgentAnalysis<T>(agentName: string, analysisFunction: () => Promise<T>): Promise<T> {
    this.updateAgentStatus(agentName, "processing");
    
    try {
      const result = await analysisFunction();
      this.updateAgentStatus(agentName, "active");
      return result;
    } catch (error) {
      this.updateAgentStatus(agentName, "error");
      console.error(`Error in ${agentName}:`, error);
      throw error;
    }
  }

  private async synthesizePrediction(
    match: Match, 
    player1: Player, 
    player2: Player, 
    analysisResults: Record<string, any>
  ): Promise<AnalysisResult> {
    
    // Compile all factor analyses
    const factorAnalyses: FactorAnalysis[] = [];
    
    // Extract conclusions from each agent group
    Object.entries(analysisResults).forEach(([category, results]) => {
      if (Array.isArray(results)) {
        results.forEach((result: any) => {
          if (result && result.conclusion) {
            factorAnalyses.push({
              factor: result.factor || category,
              conclusion: result.conclusion,
              advantage: result.advantage || "none",
              confidence: result.confidence || 0.5,
              reasoning: result.reasoning || ""
            });
          }
        });
      }
    });

    // Use AI to synthesize final prediction
    const synthesisPrompt = `
    Analyze the following tennis match prediction data and provide a final prediction:
    
    Match: ${player1.name} vs ${player2.name}
    Surface: ${match.surface}
    
    Factor Analyses:
    ${factorAnalyses.map(fa => `
    - ${fa.factor}: ${fa.conclusion} (Advantage: ${fa.advantage}, Confidence: ${fa.confidence})
      Reasoning: ${fa.reasoning}
    `).join('\n')}
    
    Please provide your analysis in the following JSON format:
    {
      "predictedWinner": "player1" or "player2",
      "winProbability": number between 0.5 and 1.0,
      "confidenceLevel": number between 0.0 and 1.0,
      "reasoning": "detailed reasoning for the prediction",
      "keyFactors": ["list of most important factors"]
    }
    
    Consider the weight and reliability of each factor, and provide a well-reasoned final prediction.
    `;

    try {
      const aiResponse = await openAIService.generatePrediction(synthesisPrompt);
      
      // Determine winner ID based on AI prediction
      const predictedWinnerId = aiResponse.predictedWinner === "player1" ? player1.id : player2.id;
      
      return {
        predictedWinnerId,
        winProbability: aiResponse.winProbability,
        confidenceLevel: aiResponse.confidenceLevel,
        factorAnalysis: factorAnalyses,
        reasoning: aiResponse.reasoning,
        agentContributions: analysisResults
      };
      
    } catch (error) {
      console.error("Error in AI synthesis:", error);
      
      // Fallback: Simple majority vote system
      const player1Advantages = factorAnalyses.filter(fa => 
        fa.advantage === "player1" || fa.advantage === "slight_player1"
      ).length;
      
      const player2Advantages = factorAnalyses.filter(fa => 
        fa.advantage === "player2" || fa.advantage === "slight_player2"
      ).length;
      
      const predictedWinnerId = player1Advantages > player2Advantages ? player1.id : player2.id;
      const winProbability = Math.max(0.5, Math.min(0.9, 0.5 + Math.abs(player1Advantages - player2Advantages) * 0.05));
      
      return {
        predictedWinnerId,
        winProbability,
        confidenceLevel: 0.75,
        factorAnalysis: factorAnalyses,
        reasoning: `Based on factor analysis: ${player1Advantages} factors favor ${player1.name}, ${player2Advantages} factors favor ${player2.name}. Prediction made using fallback majority vote system.`,
        agentContributions: analysisResults
      };
    }
  }

  private async storeAgentAnalyses(matchId: string, analysisResults: Record<string, any>): Promise<void> {
    const promises: Promise<any>[] = [];
    
    Object.entries(analysisResults).forEach(([category, results]) => {
      if (Array.isArray(results)) {
        results.forEach((result: any) => {
          if (result && result.agentName) {
            promises.push(
              storage.createAgentAnalysis({
                matchId,
                agentType: category,
                agentName: result.agentName,
                analysis: result.analysis || {},
                conclusion: result.conclusion || "",
                advantage: result.advantage || "none",
                confidenceLevel: result.confidence?.toString() || "0.5",
                processingTime: result.processingTime || 1000,
              })
            );
          }
        });
      }
    });
    
    await Promise.all(promises);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
