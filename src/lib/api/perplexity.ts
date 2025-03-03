import { Perplexity } from 'perplexity';
import config from '../config';

/**
 * Client for interacting with Perplexity's Sonar API
 * Used for real-time research and information retrieval
 */
class PerplexityClient {
  private client: Perplexity;

  constructor() {
    this.client = new Perplexity({
      apiKey: config.perplexity.apiKey,
    });
  }

  /**
   * Performs real-time research on sports topics
   * @param query The query to research
   * @returns Research results with citations
   */
  async research(query: string) {
    try {
      const response = await this.client.search({
        query,
        focus: ['sports'], // Focus on sports-related content
        highlight: true, // Highlight relevant parts of the response
      });
      
      // Process the response to extract the most relevant information
      return {
        answer: response.text,
        sources: response.webPages?.map(page => ({
          title: page.title,
          url: page.url,
          snippet: page.snippet,
        })) || [],
      };
    } catch (error) {
      console.error('Error performing Perplexity research:', error);
      throw error;
    }
  }

  /**
   * Perform web search to get real-time sports information
   * @param query The search query
   * @returns Search results
   */
  async searchWeb(query: string) {
    try {
      const response = await this.client.search({
        query,
        num_results: 5,
      });
      
      return {
        answer: response.text,
        sources: response.webPages?.map(page => ({
          title: page.title,
          url: page.url,
          snippet: page.snippet,
        })) || [],
      };
    } catch (error) {
      console.error('Error searching with Perplexity:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const perplexityClient = new PerplexityClient();
export default perplexityClient; 