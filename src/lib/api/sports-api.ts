import axios from 'axios';
import config from '../config';

/**
 * Client for interacting with Sports APIs
 * This implementation can be adapted to work with different sports data providers
 */
class SportsApiClient {
  private baseUrl: string;
  private apiKey: string;
  
  constructor() {
    this.baseUrl = config.sportsApi.host;
    this.apiKey = config.sportsApi.apiKey;
  }
  
  /**
   * Creates an axios instance with proper headers
   */
  private getClient() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': new URL(this.baseUrl).hostname,
      },
    });
  }
  
  /**
   * Get live cricket matches
   */
  async getLiveCricketMatches() {
    try {
      const client = this.getClient();
      const response = await client.get('/cricket/matches/live');
      return response.data;
    } catch (error) {
      console.error('Error fetching live cricket matches:', error);
      throw error;
    }
  }
  
  /**
   * Get cricket player stats
   * @param playerId Player ID
   */
  async getCricketPlayerStats(playerId: string) {
    try {
      const client = this.getClient();
      const response = await client.get(`/cricket/players/${playerId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cricket player stats for ${playerId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get IPL team stats
   * @param teamId Team ID
   */
  async getIPLTeamStats(teamId: string) {
    try {
      const client = this.getClient();
      const response = await client.get(`/cricket/teams/${teamId}/stats?league=ipl`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching IPL team stats for ${teamId}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for cricket players
   * @param query Search query (player name)
   */
  async searchCricketPlayers(query: string) {
    try {
      const client = this.getClient();
      const response = await client.get(`/cricket/players/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching cricket players for ${query}:`, error);
      throw error;
    }
  }
  
  /**
   * Get cricket match details by ID
   * @param matchId Match ID
   */
  async getCricketMatchDetails(matchId: string) {
    try {
      const client = this.getClient();
      const response = await client.get(`/cricket/matches/${matchId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cricket match details for ${matchId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get cricket match scorecard
   * @param matchId Match ID
   */
  async getCricketMatchScorecard(matchId: string) {
    try {
      const client = this.getClient();
      const response = await client.get(`/cricket/matches/${matchId}/scorecard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cricket match scorecard for ${matchId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get cricket player bowling stats
   * @param playerId Player ID
   * @param tournament Tournament name (e.g., 'ipl')
   */
  async getPlayerBowlingStats(playerId: string, tournament?: string) {
    try {
      const client = this.getClient();
      let url = `/cricket/players/${playerId}/bowling`;
      if (tournament) {
        url += `?tournament=${encodeURIComponent(tournament)}`;
      }
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bowling stats for player ${playerId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const sportsApiClient = new SportsApiClient();
export default sportsApiClient; 