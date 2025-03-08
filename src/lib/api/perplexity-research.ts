import { config } from '@/src/lib/config';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface ImageSource {
  url: string;
  origin?: string;
  height?: number;
  width?: number;
  context?: string;
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
      title?: string;
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
  private systemPrompt = `You are CricketGPT, a specialized cricket analysis engine that conducts comprehensive research on cricket-related topics.

RESEARCH APPROACH:
1. Conduct exhaustive multi-source research on cricket queries
2. Emphasize statistical accuracy with precise numbers and dates 
3. Provide detailed player/team/match analysis with recent performance trends
4. Include historical context and current developments
5. Uncover lesser-known cricket facts and advanced analytics when relevant
6. Include URLs to high-quality images of players, teams, venues, and charts/graphics
7. Actively search for and provide visual content that enhances the information

OUTPUT STRUCTURE:
1. Begin with a concise 2-3 sentence summary of the key findings
2. Organize content with clear markdown headings (##, ###) and bullet points
3. Present statistics in formatted tables for readability
4. For player profiles, include career stats AND recent form (last 1-2 years)
5. For match/tournament analysis, include venue conditions and historical performance data
6. When discussing cricket records, provide context about when/how they were set
7. Always include pre-formatted tables for statistical data
8. When relevant, indicate which entities (players, teams) should have images displayed

VISUAL CONTENT GUIDELINES:
1. Include URLs to high-quality images of relevant cricket players
2. Provide images of stadiums or venues when discussing specific matches
3. Include statistical charts or visualizations when available
4. For player rankings or comparisons, provide image URLs for all top players
5. Include team logos or emblems when discussing teams or tournaments
6. Tag images with proper context (e.g., "Virat Kohli batting stance", "Wankhede Stadium aerial view")

STYLISTIC ELEMENTS:
1. Write with authority but accessible to both casual fans and cricket experts
2. Use cricket-specific terminology appropriately with brief explanations of technical terms
3. Maintain objective tone while highlighting noteworthy achievements
4. Include relevant direct quotes from players/coaches when available in your sources
5. End with key takeaways or implications for future matches/tournaments when relevant

ATTRIBUTION AND ACCURACY:
1. Cite sources inline (e.g., "According to ESPN Cricinfo...")
2. Include full URLs for key statistical sources
3. Note when information conflicts between sources and explain discrepancies
4. For time-sensitive information, include publication dates
5. Distinguish between factual information and analytical interpretations
6. Label predictions or speculations clearly
7. Provide attribution for all images and visualizations used`;

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
    images?: ImageSource[];
    searchQueries?: string[];
  }> {
    const startTime = Date.now();
    const TIMEOUT_MS = 300000; // 5 minutes timeout for deep research
    
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
      
      // Extract and format images
      const images: ImageSource[] = data.citations?.images?.map(image => ({
        url: image.url,
        origin: image.origin,
        height: image.height,
        width: image.width,
        context: image.title || this.extractImageContext(image.url)
      })) || [];
      console.log(`[PerplexityClient] Images extracted (${images.length} images)`);
      if (images.length > 0) {
        console.log(`[PerplexityClient] Sample image URLs: ${images.slice(0, 2).map(img => img.url).join(', ')}${images.length > 2 ? '...' : ''}`);
      }
      
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
      console.log(`[PerplexityClient] Successfully completed deep research in ${totalTime.toFixed(2)}s (${content.length} chars, ${sources.length} sources, ${images.length} images, ${searchQueries.length} search queries)`);
      
      // Filter out the content
      const filteredContent = this.filterInternalContent(content);
      
      return {
        content: filteredContent,
        sources,
        images,
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
          sources: [],
          images: []
        };
      }
      
      console.error("[PerplexityClient] Error in research:", error);
      return {
        content: `I encountered an error while conducting deep research on your cricket question. This might be due to API limits or connectivity issues. Please try again later or refine your question to be more specific.`,
        sources: [],
        images: []
      };
    }
  }
  
  /**
   * Enhances the query for better research results
   * @param query The original query
   * @returns Enhanced query with additional context
   */
  private enhanceQuery(query: string): string {
    // Basic cricket terminology check
    const hasCricketTerms = /\b(cricket|ipl|odi|t20|test match|batsman|bowler|wicket|run|over|innings|century|captain|icc|bcci|cricketer)\b/i.test(query);
    
    // If it clearly mentions cricket already, enhance the query for depth
    if (hasCricketTerms) {
      return `${query}
      
Please provide comprehensive cricket analysis with:
1. Latest statistics and records as of 2024
2. Historical context and significance
3. Statistical tables and trends
4. Expert analysis from credible cricket sources
5. Quotes from players/coaches when relevant
6. Both career overview and recent form for players
7. Multiple perspectives on debated topics
8. URLs to high-quality images of relevant players/teams/venues
9. Suggestions for visual elements to display alongside the analysis
10. Links to charts, graphs, or infographics that illustrate key statistics

For any players, teams, or venues mentioned, please include image URLs that can be displayed alongside the text content. For statistical comparisons, include visual data that can be rendered as charts.`;
    }
    
    // If cricket isn't mentioned, assume it's a cricket query needing context
    return `Conduct in-depth cricket research on: ${query}

Please provide comprehensive cricket analysis that includes:
1. Latest statistics and records as of 2024
2. Historical context and trends 
3. Properly formatted statistical tables
4. Expert opinions from credible cricket sources
5. Analysis of both career statistics and recent performance
6. Multiple perspectives when addressing subjective questions
7. Relevant comparisons to similar players/teams/matches
8. URLs to high-quality images of key entities (players/teams/venues) mentioned
9. Image URLs for top players discussed in the analysis
10. Links to statistical visualizations or charts that enhance understanding

For any players, teams, or venues that are central to the analysis, please include image URLs that we can display alongside the content. For rankings or statistics, include visual elements that help illustrate the data.`;
  }
  
  /**
   * Extracts context from image URL when title is not provided
   * @param url The image URL
   * @returns Extracted context or empty string
   */
  private extractImageContext(url: string): string {
    try {
      // Extract filename from URL
      const filename = url.split('/').pop() || '';
      
      // Remove extension and replace dashes/underscores with spaces
      let context = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      
      // Capitalize first letter of each word
      context = context.replace(/\b\w/g, char => char.toUpperCase());
      
      return context || 'Cricket Image';
    } catch (e) {
      return 'Cricket Image';
    }
  }
  
  // Add a method to filter out <think> tags from the content
  private filterInternalContent(content: string): string {
    if (!content) return '';
    
    // Filter out <think>...</think> sections which contain internal instructions
    const thinkTagRegex = /<think>[\s\S]*?<\/think>/;
    const cleanedContent = content.replace(thinkTagRegex, '').trim();
    
    // If after filtering, content is empty, return a message
    if (!cleanedContent) {
      return 'No displayable content was found in the research results.';
    }
    
    return cleanedContent;
  }
}

// Export a singleton instance
export const perplexityResearchClient = new PerplexityResearchClient();
export default perplexityResearchClient; 