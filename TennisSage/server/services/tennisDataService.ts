import { storage } from "../storage";
import axios from "axios";
import * as cheerio from "cheerio";

interface TennisApiPlayer {
  id: string;
  name: string;
  nationality: string;
  ranking: number;
  eloRating?: number;
  playingStyle?: string;
}

interface TennisApiTournament {
  id: string;
  name: string;
  location: string;
  surface: string;
  category: string;
  startDate: string;
  endDate: string;
}

interface TennisApiMatch {
  id: string;
  tournament_id: string;
  player1_id: string;
  player2_id: string;
  scheduled_time: string;
  status: string;
  surface: string;
  round: string;
}

interface NewsItem {
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  playerId?: string;
  isInjuryRelated: boolean;
  isCoachingChange: boolean;
}

class TennisDataService {
  private readonly TENNIS_API_KEY = process.env.TENNIS_API_KEY || process.env.API_KEY || "demo_key";
  private readonly NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.API_KEY || "demo_key";
  private readonly WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.API_KEY || "demo_key";

  async syncPlayers(): Promise<void> {
    try {
      console.log("Syncing player data...");
      
      // Try to fetch from multiple sources
      await this.syncATPPlayers();
      await this.syncWTAPlayers();
      
      console.log("Player data sync completed");
    } catch (error) {
      console.error("Error syncing player data:", error);
      throw error;
    }
  }

  private async syncATPPlayers(): Promise<void> {
    try {
      // Scrape ATP rankings from official website
      const response = await axios.get("https://www.atptour.com/en/rankings/singles", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const $ = cheerio.load(response.data);
      const players: any[] = [];

      $('.player-cell').each((index, element) => {
        const $element = $(element);
        const name = $element.find('.player-name').text().trim();
        const ranking = parseInt($element.find('.rank-cell').text().trim());
        const nationality = $element.find('.country-item').attr('data-country') || '';

        if (name && ranking) {
          players.push({
            name,
            nationality: nationality.toUpperCase(),
            ranking,
            playingStyle: this.inferPlayingStyle(name), // Basic inference
          });
        }
      });

      // Store players in database
      for (const playerData of players.slice(0, 100)) { // Limit to top 100
        try {
          const existingPlayer = await storage.getPlayerByName(playerData.name);
          if (existingPlayer) {
            await storage.updatePlayer(existingPlayer.id, playerData);
          } else {
            await storage.createPlayer(playerData);
          }
        } catch (error) {
          console.error(`Error syncing player ${playerData.name}:`, error);
        }
      }
    } catch (error) {
      console.error("Error syncing ATP players:", error);
    }
  }

  private async syncWTAPlayers(): Promise<void> {
    try {
      // Similar logic for WTA players
      const response = await axios.get("https://www.wtatennis.com/rankings", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const $ = cheerio.load(response.data);
      // Implementation similar to ATP scraping
      
    } catch (error) {
      console.error("Error syncing WTA players:", error);
    }
  }

  async syncTournaments(): Promise<void> {
    try {
      console.log("Syncing tournament data...");
      
      // Scrape upcoming tournaments
      await this.scrapeUpcomingTournaments();
      
      console.log("Tournament data sync completed");
    } catch (error) {
      console.error("Error syncing tournament data:", error);
      throw error;
    }
  }

  private async scrapeUpcomingTournaments(): Promise<void> {
    try {
      const response = await axios.get("https://www.atptour.com/en/tournaments", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const $ = cheerio.load(response.data);
      
      const tournaments: any[] = [];
      $('.tournament-item').each((index, element) => {
        const $element = $(element);
        const name = $element.find('.tournament-name').text().trim();
        const location = $element.find('.tournament-location').text().trim();
        const surface = $element.find('.tournament-surface').text().trim().toLowerCase();
        const dates = $element.find('.tournament-dates').text().trim();
        
        if (name && location) {
          const [startDate, endDate] = this.parseTournamentDates(dates);
          tournaments.push({
            name,
            location,
            surface: surface || 'hard',
            category: this.inferTournamentCategory(name),
            startDate,
            endDate,
          });
        }
      });

      // Process tournaments asynchronously
      for (const tournament of tournaments) {
        try {
          await storage.createTournament(tournament);
        } catch (error) {
          console.error(`Error creating tournament ${tournament.name}:`, error);
        }
      }
    } catch (error) {
      console.error("Error scraping tournaments:", error);
    }
  }

  async syncMatches(tournamentId?: string): Promise<void> {
    try {
      console.log("Syncing match data...");
      
      if (tournamentId) {
        await this.syncTournamentMatches(tournamentId);
      } else {
        await this.syncUpcomingMatches();
      }
      
      console.log("Match data sync completed");
    } catch (error) {
      console.error("Error syncing match data:", error);
      throw error;
    }
  }

  private async syncUpcomingMatches(): Promise<void> {
    try {
      // Scrape upcoming matches from tennis websites
      const response = await axios.get("https://www.tennisexplorer.com/matches/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const $ = cheerio.load(response.data);
      
      const matches: any[] = [];
      $('.match-item').each((index, element) => {
        const $element = $(element);
        const player1Name = $element.find('.player1').text().trim();
        const player2Name = $element.find('.player2').text().trim();
        const time = $element.find('.match-time').text().trim();
        const surface = $element.find('.surface').text().trim().toLowerCase();
        
        if (player1Name && player2Name) {
          matches.push({
            player1Name,
            player2Name,
            time,
            surface: surface || "hard"
          });
        }
      });

      // Process matches asynchronously
      for (const match of matches) {
        try {
          const player1 = await storage.getPlayerByName(match.player1Name);
          const player2 = await storage.getPlayerByName(match.player2Name);
          
          if (player1 && player2) {
            const scheduledTime = this.parseMatchTime(match.time);
            
            await storage.createMatch({
              player1Id: player1.id,
              player2Id: player2.id,
              scheduledTime,
              status: "scheduled",
              surface: match.surface,
              round: "First Round", // Default
            });
          }
        } catch (error) {
          console.error(`Error creating match ${match.player1Name} vs ${match.player2Name}:`, error);
        }
      }
    } catch (error) {
      console.error("Error syncing upcoming matches:", error);
    }
  }

  private async syncTournamentMatches(tournamentId: string): Promise<void> {
    // Implementation for specific tournament matches
    console.log(`Syncing matches for tournament ${tournamentId}`);
  }

  async syncNews(): Promise<void> {
    try {
      console.log("Syncing news data...");
      
      await this.fetchTennisNews();
      await this.fetchInjuryNews();
      
      console.log("News data sync completed");
    } catch (error) {
      console.error("Error syncing news data:", error);
      throw error;
    }
  }

  private async fetchTennisNews(): Promise<void> {
    try {
      // Use News API to fetch tennis-related news
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: "tennis OR ATP OR WTA",
          language: "en",
          sortBy: "publishedAt",
          apiKey: this.NEWS_API_KEY,
          pageSize: 50,
        }
      });

      const articles = response.data.articles;
      
      for (const article of articles) {
        try {
          const newsItem = await this.processNewsArticle(article);
          await storage.createNewsArticle(newsItem);
        } catch (error) {
          console.error(`Error processing news article:`, error);
        }
      }
    } catch (error) {
      console.error("Error fetching tennis news:", error);
    }
  }

  private async fetchInjuryNews(): Promise<void> {
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: "tennis injury OR tennis withdraw OR tennis medical",
          language: "en",
          sortBy: "publishedAt",
          apiKey: this.NEWS_API_KEY,
          pageSize: 20,
        }
      });

      const articles = response.data.articles;
      
      for (const article of articles) {
        try {
          const newsItem = await this.processNewsArticle(article, true);
          await storage.createNewsArticle(newsItem);
        } catch (error) {
          console.error(`Error processing injury news:`, error);
        }
      }
    } catch (error) {
      console.error("Error fetching injury news:", error);
    }
  }

  private async processNewsArticle(article: any, isInjuryRelated = false): Promise<any> {
    // Extract player mentions from the article
    const playerId = await this.extractPlayerMention(article.title + " " + article.description);
    
    return {
      title: article.title,
      content: article.description || article.content,
      source: article.source.name,
      url: article.url,
      publishedAt: new Date(article.publishedAt),
      playerId,
      isInjuryRelated,
      isCoachingChange: this.isCoachingChange(article.title + " " + article.description),
      sentiment: this.analyzeSentiment(article.title + " " + article.description),
      relevanceScore: this.calculateRelevanceScore(article.title + " " + article.description),
      keywords: this.extractKeywords(article.title + " " + article.description),
    };
  }

  private async extractPlayerMention(text: string): Promise<string | null> {
    const players = await storage.getAllPlayers();
    
    for (const player of players) {
      const names = player.name.split(' ');
      const lastName = names[names.length - 1];
      
      if (text.toLowerCase().includes(lastName.toLowerCase())) {
        return player.id;
      }
    }
    
    return null;
  }

  async getWeatherData(location: string, date: Date): Promise<any> {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: {
          q: location,
          appid: this.WEATHER_API_KEY,
          units: "metric",
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return null;
    }
  }

  // Helper methods
  private inferPlayingStyle(playerName: string): string {
    // Basic playing style inference (would be enhanced with real data)
    const styles = ["Aggressive Baseliner", "Counterpuncher", "All-Court Player", "Serve and Volley"];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  private inferTournamentCategory(name: string): string {
    if (name.toLowerCase().includes("grand slam") || 
        name.toLowerCase().includes("wimbledon") ||
        name.toLowerCase().includes("french open") ||
        name.toLowerCase().includes("us open") ||
        name.toLowerCase().includes("australian open")) {
      return "grand_slam";
    }
    if (name.toLowerCase().includes("masters")) {
      return "masters_1000";
    }
    if (name.toLowerCase().includes("500")) {
      return "atp_500";
    }
    return "atp_250";
  }

  private parseTournamentDates(dateString: string): [Date, Date] {
    // Parse date string and return start and end dates
    const now = new Date();
    const startDate = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return [startDate, endDate];
  }

  private parseMatchTime(timeString: string): Date {
    // Parse match time string and return Date object
    const now = new Date();
    return new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  }

  private isCoachingChange(text: string): boolean {
    const coachingKeywords = ["coach", "coaching", "trainer", "team change"];
    return coachingKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private analyzeSentiment(text: string): string {
    // Basic sentiment analysis (would use AI service in production)
    const positiveKeywords = ["win", "victory", "champion", "success", "best"];
    const negativeKeywords = ["lose", "injury", "withdraw", "defeat", "retire"];
    
    const positiveCount = positiveKeywords.filter(word => text.toLowerCase().includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => text.toLowerCase().includes(word)).length;
    
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  private calculateRelevanceScore(text: string): number {
    // Calculate relevance score based on keywords and context
    const tennisKeywords = ["tennis", "atp", "wta", "grand slam", "tournament", "match"];
    const score = tennisKeywords.filter(word => text.toLowerCase().includes(word)).length;
    return Math.min(score / tennisKeywords.length, 1.0);
  }

  private extractKeywords(text: string): string[] {
    // Extract relevant keywords from text
    const words = text.toLowerCase().split(/\s+/);
    const relevantWords = words.filter(word => 
      word.length > 3 && 
      !["the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use"].includes(word)
    );
    return relevantWords.slice(0, 10);
  }
}

export const tennisDataService = new TennisDataService();
