export interface Player {
  id: string;
  name: string;
  nationality?: string;
  ranking?: number;
  eloRating?: string;
  playingStyle?: string;
  profileImageUrl?: string;
  birthDate?: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  surface: string;
  category: string;
  startDate: string;
  endDate: string;
}

export interface Match {
  id: string;
  tournamentId?: string;
  player1Id: string;
  player2Id: string;
  scheduledTime?: string;
  status: string;
  winnerId?: string;
  score?: string;
  surface: string;
  round?: string;
}

export interface Prediction {
  id: string;
  matchId: string;
  predictedWinnerId: string;
  winProbability: string;
  confidenceLevel: string;
  factorAnalysis: FactorAnalysis[];
  reasoning: string;
  agentContributions: Record<string, any>;
  createdAt: string;
}

export interface FactorAnalysis {
  factor: string;
  conclusion: string;
  advantage: "player1" | "player2" | "none" | "slight_player1" | "slight_player2";
  confidence: number;
  reasoning: string;
}

export interface AgentStatus {
  name: string;
  type: string;
  status: "active" | "processing" | "idle" | "error";
  lastActivity: Date;
  accuracy: number;
  totalAnalyses: number;
}

export interface PlayerStats {
  id: string;
  playerId: string;
  surface: string;
  timeframe: string;
  matchesPlayed: number;
  matchesWon: number;
  firstServePercentage?: string;
  firstServePointsWon?: string;
  acesPerMatch?: string;
  breakPointsConverted?: string;
  tiebreaksWon?: number;
  tiebreaksPlayed?: number;
}

export interface NewsArticle {
  id: string;
  playerId?: string;
  title: string;
  content?: string;
  source: string;
  publishedAt: string;
  sentiment?: string;
  isInjuryRelated?: boolean;
}

export interface WebSocketMessage {
  type: string;
  channel?: string;
  data?: any;
  clientId?: string;
}
