import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { agentOrchestrator } from "./services/agentOrchestrator";
import { tennisDataService } from "./services/tennisDataService";
import { insertMatchSchema, insertPredictionSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketClient {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
}

const clients = new Map<string, WebSocketClient>();

function broadcastToSubscribers(channel: string, data: any) {
  clients.forEach((client) => {
    if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ channel, data }));
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware for API routes
  app.use("/api/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Player routes
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.get("/api/players/top", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const players = await storage.getTopPlayers(limit);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top players" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  app.get("/api/players/:id/stats", async (req, res) => {
    try {
      const { surface = "all", timeframe = "last_52_weeks" } = req.query;
      const stats = await storage.getPlayerStats(
        req.params.id,
        surface as string,
        timeframe as string
      );
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player stats" });
    }
  });

  app.get("/api/players/:id/recent-matches", async (req, res) => {
    try {
      const { surface, limit = "15" } = req.query;
      const matches = await storage.getRecentMatches(
        req.params.id,
        surface as string,
        parseInt(limit as string)
      );
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent matches" });
    }
  });

  // Match routes
  app.get("/api/matches/upcoming", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const matches = await storage.getUpcomingMatches(limit);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming matches" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      
      // Broadcast new match to WebSocket clients
      broadcastToSubscribers("matches:new", match);
      
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid match data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create match" });
    }
  });

  // Prediction routes
  app.get("/api/predictions/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const predictions = await storage.getRecentPredictions(limit);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent predictions" });
    }
  });

  app.get("/api/predictions/match/:matchId", async (req, res) => {
    try {
      const prediction = await storage.getPredictionByMatch(req.params.matchId);
      if (!prediction) {
        return res.status(404).json({ error: "Prediction not found" });
      }
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prediction" });
    }
  });

  app.post("/api/predictions/analyze", async (req, res) => {
    try {
      const { matchId, forceRefresh = false } = req.body;
      
      if (!matchId) {
        return res.status(400).json({ error: "Match ID is required" });
      }

      // Check if prediction already exists and is recent (unless forcing refresh)
      if (!forceRefresh) {
        const existingPrediction = await storage.getPredictionByMatch(matchId);
        if (existingPrediction) {
          return res.json(existingPrediction);
        }
      }

      const match = await storage.getMatch(matchId);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Broadcast analysis start
      broadcastToSubscribers("analysis:started", { matchId });

      // Run the multi-agent analysis
      const analysisResult = await agentOrchestrator.analyzeMatch(match);
      
      // Store the prediction
      const prediction = await storage.createPrediction({
        matchId,
        predictedWinnerId: analysisResult.predictedWinnerId,
        winProbability: analysisResult.winProbability.toString(),
        confidenceLevel: analysisResult.confidenceLevel.toString(),
        factorAnalysis: analysisResult.factorAnalysis,
        reasoning: analysisResult.reasoning,
        agentContributions: analysisResult.agentContributions,
      });

      // Broadcast completed analysis
      broadcastToSubscribers("analysis:completed", { matchId, prediction });

      res.json(prediction);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze match" });
    }
  });

  // Agent status routes
  app.get("/api/agents/status", async (req, res) => {
    try {
      const status = agentOrchestrator.getAgentStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent status" });
    }
  });

  app.get("/api/agents/analysis/:matchId", async (req, res) => {
    try {
      const analysis = await storage.getAnalysisByMatch(req.params.matchId);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent analysis" });
    }
  });

  // Head-to-Head routes
  app.get("/api/head-to-head/:player1Id/:player2Id", async (req, res) => {
    try {
      const h2h = await storage.getHeadToHead(req.params.player1Id, req.params.player2Id);
      if (!h2h) {
        return res.status(404).json({ error: "Head-to-head record not found" });
      }
      res.json(h2h);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch head-to-head record" });
    }
  });

  // News routes
  app.get("/api/news/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const news = await storage.getRecentNews(limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent news" });
    }
  });

  app.get("/api/news/player/:playerId", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const news = await storage.getNewsByPlayer(req.params.playerId, limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player news" });
    }
  });

  app.get("/api/news/injuries", async (req, res) => {
    try {
      const { playerId } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;
      const news = await storage.getInjuryNews(playerId as string, limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch injury news" });
    }
  });

  // Data synchronization routes
  app.post("/api/sync/players", async (req, res) => {
    try {
      await tennisDataService.syncPlayers();
      res.json({ message: "Player data synchronization completed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync player data" });
    }
  });

  app.post("/api/sync/tournaments", async (req, res) => {
    try {
      await tennisDataService.syncTournaments();
      res.json({ message: "Tournament data synchronization completed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync tournament data" });
    }
  });

  app.post("/api/sync/matches", async (req, res) => {
    try {
      const { tournamentId } = req.body;
      await tennisDataService.syncMatches(tournamentId);
      res.json({ message: "Match data synchronization completed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync match data" });
    }
  });

  app.post("/api/sync/news", async (req, res) => {
    try {
      await tennisDataService.syncNews();
      res.json({ message: "News data synchronization completed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync news data" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/ws",
    clientTracking: true 
  });

  wss.on("connection", (ws, req) => {
    const clientId = Math.random().toString(36).substring(7);
    const client: WebSocketClient = {
      id: clientId,
      ws,
      subscriptions: new Set()
    };
    
    clients.set(clientId, client);
    console.log(`WebSocket client connected: ${clientId}`);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case "subscribe":
            client.subscriptions.add(message.channel);
            ws.send(JSON.stringify({ 
              type: "subscribed", 
              channel: message.channel,
              clientId 
            }));
            break;
            
          case "unsubscribe":
            client.subscriptions.delete(message.channel);
            ws.send(JSON.stringify({ 
              type: "unsubscribed", 
              channel: message.channel,
              clientId 
            }));
            break;
            
          case "ping":
            ws.send(JSON.stringify({ type: "pong", clientId }));
            break;
            
          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ 
      type: "connected", 
      clientId,
      message: "Connected to Divine Tennis AI Oracle" 
    }));
  });

  // Periodic agent status broadcast
  setInterval(() => {
    const status = agentOrchestrator.getAgentStatus();
    broadcastToSubscribers("agents:status", status);
  }, 5000);

  return httpServer;
}
