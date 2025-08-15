import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nationality: text("nationality"),
  birthDate: timestamp("birth_date"),
  ranking: integer("ranking"),
  eloRating: decimal("elo_rating", { precision: 10, scale: 2 }),
  playingStyle: text("playing_style"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  surface: text("surface").notNull(), // clay, hard, grass
  category: text("category").notNull(), // grand_slam, masters, atp_500, etc
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  player1Id: varchar("player1_id").references(() => players.id).notNull(),
  player2Id: varchar("player2_id").references(() => players.id).notNull(),
  scheduledTime: timestamp("scheduled_time"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  winnerId: varchar("winner_id").references(() => players.id),
  score: text("score"),
  surface: text("surface").notNull(),
  round: text("round"),
  matchStats: jsonb("match_stats"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id).notNull(),
  predictedWinnerId: varchar("predicted_winner_id").references(() => players.id).notNull(),
  winProbability: decimal("win_probability", { precision: 5, scale: 2 }).notNull(),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }).notNull(),
  factorAnalysis: jsonb("factor_analysis").notNull(),
  reasoning: text("reasoning").notNull(),
  agentContributions: jsonb("agent_contributions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerStats = pgTable("player_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id).notNull(),
  surface: text("surface").notNull(),
  timeframe: text("timeframe").notNull(), // last_10, last_52_weeks, career
  matchesPlayed: integer("matches_played").notNull(),
  matchesWon: integer("matches_won").notNull(),
  setsWon: integer("sets_won").notNull(),
  setsLost: integer("sets_lost").notNull(),
  firstServePercentage: decimal("first_serve_percentage", { precision: 5, scale: 2 }),
  firstServePointsWon: decimal("first_serve_points_won", { precision: 5, scale: 2 }),
  secondServePointsWon: decimal("second_serve_points_won", { precision: 5, scale: 2 }),
  acesPerMatch: decimal("aces_per_match", { precision: 5, scale: 2 }),
  doubleFaultsPerMatch: decimal("double_faults_per_match", { precision: 5, scale: 2 }),
  breakPointsConverted: decimal("break_points_converted", { precision: 5, scale: 2 }),
  breakPointsSaved: decimal("break_points_saved", { precision: 5, scale: 2 }),
  returnPointsWon: decimal("return_points_won", { precision: 5, scale: 2 }),
  tiebreaksWon: integer("tiebreaks_won"),
  tiebreaksPlayed: integer("tiebreaks_played"),
  decidingSetsWon: integer("deciding_sets_won"),
  decidingSetsPlayed: integer("deciding_sets_played"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agentAnalysis = pgTable("agent_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id).notNull(),
  agentType: text("agent_type").notNull(),
  agentName: text("agent_name").notNull(),
  analysis: jsonb("analysis").notNull(),
  conclusion: text("conclusion"),
  advantage: text("advantage"), // player1, player2, none, slight_player1, slight_player2
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }),
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const headToHeadRecords = pgTable("head_to_head_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  player1Id: varchar("player1_id").references(() => players.id).notNull(),
  player2Id: varchar("player2_id").references(() => players.id).notNull(),
  totalMeetings: integer("total_meetings").notNull().default(0),
  player1Wins: integer("player1_wins").notNull().default(0),
  player2Wins: integer("player2_wins").notNull().default(0),
  clayMeetings: integer("clay_meetings").notNull().default(0),
  clayPlayer1Wins: integer("clay_player1_wins").notNull().default(0),
  hardMeetings: integer("hard_meetings").notNull().default(0),
  hardPlayer1Wins: integer("hard_player1_wins").notNull().default(0),
  grassMeetings: integer("grass_meetings").notNull().default(0),
  grassPlayer1Wins: integer("grass_player1_wins").notNull().default(0),
  lastMeeting: timestamp("last_meeting"),
  recentForm: jsonb("recent_form"), // last 5 meetings details
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id),
  title: text("title").notNull(),
  content: text("content"),
  source: text("source").notNull(),
  url: text("url"),
  publishedAt: timestamp("published_at").notNull(),
  sentiment: text("sentiment"), // positive, negative, neutral
  relevanceScore: decimal("relevance_score", { precision: 5, scale: 2 }),
  keywords: jsonb("keywords"),
  isInjuryRelated: boolean("is_injury_related").default(false),
  isCoachingChange: boolean("is_coaching_change").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  updatedAt: true,
});

export const insertAgentAnalysisSchema = createInsertSchema(agentAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertHeadToHeadSchema = createInsertSchema(headToHeadRecords).omit({
  id: true,
  updatedAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertAgentAnalysis = z.infer<typeof insertAgentAnalysisSchema>;
export type AgentAnalysis = typeof agentAnalysis.$inferSelect;
export type InsertHeadToHead = z.infer<typeof insertHeadToHeadSchema>;
export type HeadToHeadRecord = typeof headToHeadRecords.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
