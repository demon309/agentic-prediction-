import { 
  users, players, tournaments, matches, predictions, playerStats, 
  agentAnalysis, headToHeadRecords, newsArticles,
  type User, type InsertUser, type Player, type InsertPlayer,
  type Tournament, type InsertTournament, type Match, type InsertMatch,
  type Prediction, type InsertPrediction, type PlayerStats, type InsertPlayerStats,
  type AgentAnalysis, type InsertAgentAnalysis, type HeadToHeadRecord, type InsertHeadToHead,
  type NewsArticle, type InsertNewsArticle
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Player methods
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayerByName(name: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player>;
  getAllPlayers(): Promise<Player[]>;
  getTopPlayers(limit?: number): Promise<Player[]>;

  // Tournament methods
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getActiveTournaments(): Promise<Tournament[]>;
  getTournamentsByDateRange(startDate: Date, endDate: Date): Promise<Tournament[]>;

  // Match methods
  getMatch(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<InsertMatch>): Promise<Match>;
  getUpcomingMatches(limit?: number): Promise<Match[]>;
  getMatchesByPlayer(playerId: string, limit?: number): Promise<Match[]>;
  getMatchesByTournament(tournamentId: string): Promise<Match[]>;
  getRecentMatches(playerId: string, surface?: string, limit?: number): Promise<Match[]>;

  // Prediction methods
  getPrediction(id: string): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getPredictionByMatch(matchId: string): Promise<Prediction | undefined>;
  getRecentPredictions(limit?: number): Promise<Prediction[]>;

  // Player Stats methods
  getPlayerStats(playerId: string, surface: string, timeframe: string): Promise<PlayerStats | undefined>;
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  updatePlayerStats(id: string, updates: Partial<InsertPlayerStats>): Promise<PlayerStats>;
  getPlayerStatsBySurface(playerId: string, surface: string): Promise<PlayerStats[]>;

  // Agent Analysis methods
  getAgentAnalysis(id: string): Promise<AgentAnalysis | undefined>;
  createAgentAnalysis(analysis: InsertAgentAnalysis): Promise<AgentAnalysis>;
  getAnalysisByMatch(matchId: string): Promise<AgentAnalysis[]>;
  getAnalysisByAgent(agentType: string, agentName: string, limit?: number): Promise<AgentAnalysis[]>;

  // Head-to-Head methods
  getHeadToHead(player1Id: string, player2Id: string): Promise<HeadToHeadRecord | undefined>;
  createHeadToHead(h2h: InsertHeadToHead): Promise<HeadToHeadRecord>;
  updateHeadToHead(id: string, updates: Partial<InsertHeadToHead>): Promise<HeadToHeadRecord>;

  // News methods
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  getNewsByPlayer(playerId: string, limit?: number): Promise<NewsArticle[]>;
  getRecentNews(limit?: number): Promise<NewsArticle[]>;
  getInjuryNews(playerId?: string, limit?: number): Promise<NewsArticle[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Player methods
  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.name, name));
    return player || undefined;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async updatePlayer(id: string, updates: Partial<InsertPlayer>): Promise<Player> {
    const [updatedPlayer] = await db
      .update(players)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer;
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players).orderBy(players.ranking);
  }

  async getTopPlayers(limit = 50): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(sql`${players.ranking} IS NOT NULL`)
      .orderBy(players.ranking)
      .limit(limit);
  }

  // Tournament methods
  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament || undefined;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }

  async getActiveTournaments(): Promise<Tournament[]> {
    const now = new Date();
    return await db
      .select()
      .from(tournaments)
      .where(and(lte(tournaments.startDate, now), gte(tournaments.endDate, now)))
      .orderBy(tournaments.startDate);
  }

  async getTournamentsByDateRange(startDate: Date, endDate: Date): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(and(gte(tournaments.startDate, startDate), lte(tournaments.endDate, endDate)))
      .orderBy(tournaments.startDate);
  }

  // Match methods
  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  async updateMatch(id: string, updates: Partial<InsertMatch>): Promise<Match> {
    const [updatedMatch] = await db
      .update(matches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(matches.id, id))
      .returning();
    return updatedMatch;
  }

  async getUpcomingMatches(limit = 20): Promise<Match[]> {
    const now = new Date();
    return await db
      .select()
      .from(matches)
      .where(and(eq(matches.status, "scheduled"), gte(matches.scheduledTime, now)))
      .orderBy(matches.scheduledTime)
      .limit(limit);
  }

  async getMatchesByPlayer(playerId: string, limit = 50): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(or(eq(matches.player1Id, playerId), eq(matches.player2Id, playerId)))
      .orderBy(desc(matches.scheduledTime))
      .limit(limit);
  }

  async getMatchesByTournament(tournamentId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(matches.scheduledTime);
  }

  async getRecentMatches(playerId: string, surface?: string, limit = 15): Promise<Match[]> {
    const conditions = [
      or(eq(matches.player1Id, playerId), eq(matches.player2Id, playerId)),
      eq(matches.status, "completed")
    ];

    if (surface) {
      conditions.push(eq(matches.surface, surface));
    }

    return await db
      .select()
      .from(matches)
      .where(and(...conditions))
      .orderBy(desc(matches.scheduledTime))
      .limit(limit);
  }

  // Prediction methods
  async getPrediction(id: string): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.id, id));
    return prediction || undefined;
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  async getPredictionByMatch(matchId: string): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.matchId, matchId));
    return prediction || undefined;
  }

  async getRecentPredictions(limit = 20): Promise<Prediction[]> {
    return await db
      .select()
      .from(predictions)
      .orderBy(desc(predictions.createdAt))
      .limit(limit);
  }

  // Player Stats methods
  async getPlayerStats(playerId: string, surface: string, timeframe: string): Promise<PlayerStats | undefined> {
    const [stats] = await db
      .select()
      .from(playerStats)
      .where(
        and(
          eq(playerStats.playerId, playerId),
          eq(playerStats.surface, surface),
          eq(playerStats.timeframe, timeframe)
        )
      );
    return stats || undefined;
  }

  async createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats> {
    const [newStats] = await db.insert(playerStats).values(stats).returning();
    return newStats;
  }

  async updatePlayerStats(id: string, updates: Partial<InsertPlayerStats>): Promise<PlayerStats> {
    const [updatedStats] = await db
      .update(playerStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(playerStats.id, id))
      .returning();
    return updatedStats;
  }

  async getPlayerStatsBySurface(playerId: string, surface: string): Promise<PlayerStats[]> {
    return await db
      .select()
      .from(playerStats)
      .where(and(eq(playerStats.playerId, playerId), eq(playerStats.surface, surface)))
      .orderBy(playerStats.timeframe);
  }

  // Agent Analysis methods
  async getAgentAnalysis(id: string): Promise<AgentAnalysis | undefined> {
    const [analysis] = await db.select().from(agentAnalysis).where(eq(agentAnalysis.id, id));
    return analysis || undefined;
  }

  async createAgentAnalysis(analysis: InsertAgentAnalysis): Promise<AgentAnalysis> {
    const [newAnalysis] = await db.insert(agentAnalysis).values(analysis).returning();
    return newAnalysis;
  }

  async getAnalysisByMatch(matchId: string): Promise<AgentAnalysis[]> {
    return await db
      .select()
      .from(agentAnalysis)
      .where(eq(agentAnalysis.matchId, matchId))
      .orderBy(agentAnalysis.createdAt);
  }

  async getAnalysisByAgent(agentType: string, agentName: string, limit = 50): Promise<AgentAnalysis[]> {
    return await db
      .select()
      .from(agentAnalysis)
      .where(and(eq(agentAnalysis.agentType, agentType), eq(agentAnalysis.agentName, agentName)))
      .orderBy(desc(agentAnalysis.createdAt))
      .limit(limit);
  }

  // Head-to-Head methods
  async getHeadToHead(player1Id: string, player2Id: string): Promise<HeadToHeadRecord | undefined> {
    const [h2h] = await db
      .select()
      .from(headToHeadRecords)
      .where(
        or(
          and(eq(headToHeadRecords.player1Id, player1Id), eq(headToHeadRecords.player2Id, player2Id)),
          and(eq(headToHeadRecords.player1Id, player2Id), eq(headToHeadRecords.player2Id, player1Id))
        )
      );
    return h2h || undefined;
  }

  async createHeadToHead(h2h: InsertHeadToHead): Promise<HeadToHeadRecord> {
    const [newH2H] = await db.insert(headToHeadRecords).values(h2h).returning();
    return newH2H;
  }

  async updateHeadToHead(id: string, updates: Partial<InsertHeadToHead>): Promise<HeadToHeadRecord> {
    const [updatedH2H] = await db
      .update(headToHeadRecords)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(headToHeadRecords.id, id))
      .returning();
    return updatedH2H;
  }

  // News methods
  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article || undefined;
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const [newArticle] = await db.insert(newsArticles).values(article).returning();
    return newArticle;
  }

  async getNewsByPlayer(playerId: string, limit = 20): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.playerId, playerId))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async getRecentNews(limit = 50): Promise<NewsArticle[]> {
    return await db
      .select()
      .from(newsArticles)
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }

  async getInjuryNews(playerId?: string, limit = 20): Promise<NewsArticle[]> {
    const conditions = [eq(newsArticles.isInjuryRelated, true)];

    if (playerId) {
      conditions.push(eq(newsArticles.playerId, playerId));
    }

    return await db
      .select()
      .from(newsArticles)
      .where(and(...conditions))
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
