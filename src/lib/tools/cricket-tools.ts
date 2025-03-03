import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import sportsApiClient from '../api/sports-api';
import perplexityClient from '../api/perplexity';

/**
 * Tool to search for cricket players
 */
export const searchCricketPlayersTool = new DynamicStructuredTool({
  name: 'search-cricket-players',
  description: 'Search for cricket players by name to get their IDs and basic information',
  schema: z.object({
    query: z.string().describe('The name of the cricket player to search for'),
  }),
  func: async ({ query }) => {
    try {
      const results = await sportsApiClient.searchCricketPlayers(query);
      return JSON.stringify(results);
    } catch (error) {
      return `Error searching for cricket players: ${error}`;
    }
  }
});

/**
 * Tool to get player stats
 */
export const getPlayerStatsTool = new DynamicStructuredTool({
  name: 'get-cricket-player-stats',
  description: 'Get detailed statistics for a cricket player using their player ID',
  schema: z.object({
    playerId: z.string().describe('The ID of the cricket player'),
  }),
  func: async ({ playerId }) => {
    try {
      const stats = await sportsApiClient.getCricketPlayerStats(playerId);
      return JSON.stringify(stats);
    } catch (error) {
      return `Error fetching player stats: ${error}`;
    }
  }
});

/**
 * Tool to get bowling statistics for a player
 */
export const getPlayerBowlingStatsTool = new DynamicStructuredTool({
  name: 'get-bowling-stats',
  description: 'Get detailed bowling statistics for a cricket player, optionally filtered by tournament',
  schema: z.object({
    playerId: z.string().describe('The ID of the cricket player'),
    tournament: z.string().optional().describe('Optional tournament name (e.g., "ipl")'),
  }),
  func: async ({ playerId, tournament }) => {
    try {
      const stats = await sportsApiClient.getPlayerBowlingStats(playerId, tournament);
      return JSON.stringify(stats);
    } catch (error) {
      return `Error fetching bowling stats: ${error}`;
    }
  }
});

/**
 * Tool to get live cricket matches
 */
export const getLiveCricketMatchesTool = new DynamicStructuredTool({
  name: 'get-live-cricket-matches',
  description: 'Get information about currently ongoing cricket matches',
  schema: z.object({}),
  func: async () => {
    try {
      const matches = await sportsApiClient.getLiveCricketMatches();
      return JSON.stringify(matches);
    } catch (error) {
      return `Error fetching live matches: ${error}`;
    }
  }
});

/**
 * Tool to get match details
 */
export const getMatchDetailsTool = new DynamicStructuredTool({
  name: 'get-cricket-match-details',
  description: 'Get detailed information about a cricket match using its match ID',
  schema: z.object({
    matchId: z.string().describe('The ID of the cricket match'),
  }),
  func: async ({ matchId }) => {
    try {
      const details = await sportsApiClient.getCricketMatchDetails(matchId);
      return JSON.stringify(details);
    } catch (error) {
      return `Error fetching match details: ${error}`;
    }
  }
});

/**
 * Tool to get match scorecard
 */
export const getMatchScorecardTool = new DynamicStructuredTool({
  name: 'get-cricket-match-scorecard',
  description: 'Get the scorecard for a cricket match using its match ID',
  schema: z.object({
    matchId: z.string().describe('The ID of the cricket match'),
  }),
  func: async ({ matchId }) => {
    try {
      const scorecard = await sportsApiClient.getCricketMatchScorecard(matchId);
      return JSON.stringify(scorecard);
    } catch (error) {
      return `Error fetching match scorecard: ${error}`;
    }
  }
});

/**
 * Tool to research cricket information using Perplexity
 */
export const researchCricketTool = new DynamicStructuredTool({
  name: 'research-cricket-information',
  description: 'Research real-time information about cricket using Perplexity Sonar API',
  schema: z.object({
    query: z.string().describe('The cricket-related query to research'),
  }),
  func: async ({ query }) => {
    try {
      const researchResults = await perplexityClient.research(query);
      return JSON.stringify(researchResults);
    } catch (error) {
      return `Error researching cricket information: ${error}`;
    }
  }
});

// Export all cricket tools
export const cricketTools = [
  searchCricketPlayersTool,
  getPlayerStatsTool,
  getPlayerBowlingStatsTool,
  getLiveCricketMatchesTool,
  getMatchDetailsTool,
  getMatchScorecardTool,
  researchCricketTool,
]; 