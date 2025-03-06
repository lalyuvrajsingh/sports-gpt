import config from '../config';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface SonarResponse {
  id: string;
  model: string;
  created: number;
  object: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  // Sonar-specific fields
  citations?: {
    texts: {
      title: string;
      url: string;
      snippet: string;
    }[];
    images?: {
      url: string;
      origin?: string;
      height?: number;
      width?: number;
    }[];
  };
  search_queries?: string[];
}

/**
 * Client for interacting with Perplexity's Sonar API
 * Used for real-time research and information retrieval
 * 
 * Documentation: https://docs.perplexity.ai/guides/getting-started
 */
class PerplexityClient {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';
  private defaultModel = 'sonar';

  constructor() {
    this.apiKey = config.perplexity.apiKey;
  }

  /**
   * Performs real-time research on sports topics using Sonar
   * @param query The query to research
   * @param options Additional options for the Sonar API
   * @returns Research results with citations
   */
  async research(query: string, options: { 
    model?: string; 
    temperature?: number;
    max_tokens?: number;
  } = {}): Promise<{
    answer: string;
    sources: Source[];
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    } | null;
    searchQueries: string[] | null;
  }> {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature || 0;
      const max_tokens = options.max_tokens || 1024;

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides accurate, factual information about cricket. Format your answer in markdown with proper headings, lists, and tables where appropriate."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature,
          max_tokens,
          stream: false
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Perplexity API error:', errorData);
          throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
        } catch (fetchError: unknown) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.error('Perplexity API request timed out after 30 seconds');
            return {
              answer: `The request to get information about "${query}" timed out. Please try again with a more specific query.`,
              sources: [],
              usage: null,
              searchQueries: null
            };
          }
          throw new Error(`API error: ${response.statusText}`);
        }
      }

      const data = await response.json() as SonarResponse;
      const answer = data.choices[0]?.message.content || '';
      const sources = data.citations?.texts?.map(text => ({
        title: text.title || "Source",
        url: text.url,
        snippet: text.snippet
      })) || [];
      const usage = data.usage;
      const searchQueries = data.search_queries || null;

      return {
        answer,
        sources,
        usage,
        searchQueries
      };
    } catch (error: unknown) {
      // Return a graceful fallback instead of throwing
      return {
        answer: `I encountered an error while researching "${query}". ${error instanceof Error ? error.message : 'Please try again.'}`,
        sources: [],
        usage: null,
        searchQueries: null,
      };
    }
  }

  /**
   * Get detailed information using Sonar Pro for more in-depth analysis
   * @param query The research query
   * @returns Detailed research results with citations
   */
  async researchDetailed(query: string) {
    return this.research(query, {
      model: 'sonar-pro',
      temperature: 0.3,
      max_tokens: 4096,
    });
  }

  /**
   * Queries the Perplexity Sonar API directly with the latest cookbook patterns
   * @param query The user's cricket query
   * @returns A formatted response with cricket information and sources
   */
  async directSonarQuery(query: string): Promise<string> {
    console.log(`Sending direct Sonar query: "${query.substring(0, 50)}..."`);
    
    try {
      // Set up AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: 'system',
              content: 'You are CricketGPT, a specialized assistant focused on providing accurate, detailed cricket information. Your responses should be well-structured, using markdown formatting with headings, lists, and tables where appropriate. Always include statistics, historical context, and current information when available. Provide complete answers with sources. When discussing rankings, records, or historical achievements, include specific numbers and dates. Format player statistics in tables for clarity.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          options: {
            // Following the cookbook pattern
            temperature: 0.1,
            max_tokens: 2048
          }
        }),
        signal: controller.signal
      });
      
      // Clear the timeout as soon as we get a response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Perplexity API error (${response.status}): ${errorText}`);
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }
      
      const data: SonarResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
        console.error("Empty response from Perplexity API");
        throw new Error("Empty response from Perplexity API");
      }
      
      // Extract content and process it
      let content = data.choices[0].message.content;
      
      // Check for citations and append sources if available
      if (data.citations && data.citations.texts && data.citations.texts.length > 0) {
        // Only append sources if they're not already in the content
        if (!content.includes("Sources:") && !content.includes("Reference:")) {
          content += "\n\n## Sources\n";
          content += data.citations.texts
            .filter((text, index, self) => 
              // Remove duplicate sources
              index === self.findIndex(t => t.url === text.url)
            )
            .map(text => `- [${text.title || 'Source'}](${text.url})`)
            .join("\n");
        }
      }
      
      // Log successful query
      console.log(`Successfully retrieved cricket information (${content.length} chars)`);
      
      return content;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error("Direct Sonar query timed out after 25 seconds");
        return `I'm sorry, the research is taking longer than expected. Please try asking your cricket question again in a more specific way.`;
      }
      
      console.error("Error in direct Sonar query:", error);
      return `I encountered an error while trying to answer your question about cricket. Please try again with a more specific question.`;
    }
  }
}

// Export a singleton instance
export const perplexityClient = new PerplexityClient();
export default perplexityClient;