import { config } from '@/src/lib/config';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface SonarResearchResponse {
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
 * Perplexity Deep Research client for comprehensive web research on cricket topics
 * Uses sonar-deep-research model for expert-level analysis with citations
 */
class PerplexityResearchClient {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';
  private model = 'sonar-deep-research'; // Using the most comprehensive research model
  private systemPrompt = `You are CricketResearchGPT, a specialized research assistant focused on providing in-depth, comprehensive cricket information.

Follow these research guidelines:
1. Conduct exhaustive research on the cricket query using multiple high-quality sources.
2. Include the latest statistics, historical context, and current information.
3. Structure your response with clear sections using markdown headings and lists.
4. For statistical data, use tables to present information clearly.
5. Always cite your sources with links when providing factual information.
6. Be comprehensive - your research should be thorough and detailed.
7. Focus on accuracy and recency of information - include dates for time-sensitive data.
8. For player statistics, include complete career information where relevant.

Your output should be properly formatted with sections, statistics, and sources that provide a complete research report on the cricket-related question.`;

  constructor() {
    this.apiKey = config.perplexity.apiKey;
    
    if (!this.apiKey) {
      console.warn('Perplexity API key is not set. Research features will not work properly.');
    }
    
    console.log(`[PerplexityClient] Initialized with model: ${this.model}`);
  }

  /**
   * Conducts deep web research using Perplexity's Sonar API
   * @param query The research query about cricket
   * @returns A detailed research report with citations
   */
  async conductResearch(query: string): Promise<{
    content: string;
    sources: Source[];
    searchQueries?: string[];
  }> {
    const startTime = Date.now();
    const TIMEOUT_MS = 180000; // 3 minutes timeout for deep research
    
    console.log(`[PerplexityClient] Starting deep research with ${TIMEOUT_MS}ms timeout on: "${query}"`);
    console.log(`[PerplexityClient] Using model: ${this.model}`);
    
    try {
      // Set up AbortController for timeout (longer timeout for deep research)
      let abortController;
      try {
        abortController = new AbortController();
        console.log(`[PerplexityClient] AbortController initialized successfully`);
      } catch (e) {
        console.warn("[PerplexityClient] AbortController not available, timeout will not work", e);
        abortController = { signal: undefined, abort: () => {} };
      }
      
      const timeoutId = setTimeout(() => {
        try {
          console.log(`[PerplexityClient] Aborting request after ${TIMEOUT_MS}ms timeout`);
          abortController.abort();
        } catch (e) {
          console.warn("[PerplexityClient] Could not abort request", e);
        }
      }, TIMEOUT_MS);
      
      // Enhance the query for better cricket-specific research
      const enhancedQuery = this.enhanceQuery(query);
      console.log(`[PerplexityClient] Enhanced query: "${enhancedQuery.substring(0, 100)}..."`);
      
      console.log(`[PerplexityClient] Preparing request to ${this.baseUrl}/chat/completions`);
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.systemPrompt
            },
            {
              role: 'user',
              content: enhancedQuery
            }
          ],
          temperature: 0.1, // Lower temperature for more factual responses
          max_tokens: 4096, // Larger context for comprehensive research
        }),
        signal: abortController.signal
      });
      
      // Clear the timeout as soon as we get a response
      clearTimeout(timeoutId);
      console.log(`[PerplexityClient] Received response after ${(Date.now() - startTime)/1000}s`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PerplexityClient] Error (${response.status}): ${errorText}`);
        throw new Error(`Perplexity Research API error: ${response.status} ${response.statusText}`);
      }
      
      console.log(`[PerplexityClient] Parsing JSON response...`);
      const data: SonarResearchResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
        console.error("[PerplexityClient] Empty response from API");
        throw new Error("Empty response from Perplexity Research API");
      }
      
      // Extract content
      const content = data.choices[0].message.content;
      console.log(`[PerplexityClient] Content extracted (${content.length} chars)`);
      
      // Extract and format sources
      const sources: Source[] = data.citations?.texts?.map(text => ({
        title: text.title || 'Untitled Source',
        url: text.url,
        snippet: text.snippet
      })) || [];
      console.log(`[PerplexityClient] Sources extracted (${sources.length} sources)`);
      
      // Extract search queries if available
      const searchQueries = data.search_queries || [];
      console.log(`[PerplexityClient] Search queries extracted (${searchQueries.length} queries)`);
      if (searchQueries.length > 0) {
        console.log(`[PerplexityClient] Sample queries: ${searchQueries.slice(0, 3).join(', ')}${searchQueries.length > 3 ? '...' : ''}`);
      }
      
      // Token usage info
      if (data.usage) {
        console.log(`[PerplexityClient] Token usage - Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`);
      }
      
      // Log successful research
      const totalTime = (Date.now() - startTime) / 1000;
      console.log(`[PerplexityClient] Successfully completed deep research in ${totalTime.toFixed(2)}s (${content.length} chars, ${sources.length} sources, ${searchQueries.length} search queries)`);
      
      return {
        content,
        sources,
        searchQueries
      };
    } catch (error: unknown) {
      // Check for AbortError in a way that works in both browser and Node.js
      const isAbortError = error instanceof Error && 
        (error.name === 'AbortError' || 
         (error instanceof DOMException && error.name === 'AbortError'));
         
      if (isAbortError) {
        const totalTime = (Date.now() - startTime) / 1000;
        console.error(`[PerplexityClient] Research timed out after ${totalTime.toFixed(2)}s (${TIMEOUT_MS/1000}s limit)`);
        return {
          content: `I'm sorry, but the deep research is taking longer than expected. Cricket research requires analyzing multiple sources and compiling detailed information. Please try a more specific question about cricket for faster results.`,
          sources: []
        };
      }
      
      console.error("[PerplexityClient] Error in research:", error);
      return {
        content: `I encountered an error while conducting deep research on your cricket question. This might be due to API limits or connectivity issues. Please try again later or refine your question to be more specific.`,
        sources: []
      };
    }
  }
  
  /**
   * Enhances the query for better research results
   * @param query The original query
   * @returns Enhanced query with additional context
   */
  private enhanceQuery(query: string): string {
    // Only enhance if the query doesn't explicitly mention cricket
    if (!query.toLowerCase().includes('cricket')) {
      return `Conduct in-depth cricket research on: ${query}\n\nPlease provide comprehensive information, including latest statistics, historical context, and current developments.`;
    }
    
    return `${query}\n\nPlease provide comprehensive information, including latest statistics, historical context, and current developments.`;
  }
}

// Export a singleton instance
export const perplexityResearchClient = new PerplexityResearchClient();
export default perplexityResearchClient; 