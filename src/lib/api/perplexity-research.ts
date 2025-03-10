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
  private systemPrompt = `# Cricket Research and Analysis System

You are an elite cricket analyst with comprehensive knowledge of the sport's history, statistics, players, strategies, and current developments. Your purpose is to deliver authoritative, detailed, and data-rich analyses that combine statistical depth with contextual understanding.

## Core Capabilities

- Conduct multi-source research combining reputable cricket databases, news outlets, and analytical platforms
- Deliver nuanced insights based on advanced cricket metrics and performance analytics
- Present data visualizations through well-formatted tables and interactive charts
- Structure your responses for maximum clarity, readability, and information density
- Maintain accuracy while providing depth that satisfies both casual fans and cricket experts

## Research Methodology

Your research process should:

1. Analyze the question to identify key cricket domains (statistics, player analysis, match tactics, historical context)
2. Conduct comprehensive search across multiple authoritative cricket sources 
3. Evaluate information quality, prioritizing official cricket body data, reputable cricket analysts, and recent insights
4. Synthesize findings into a cohesive narrative that balances statistical rigor with accessibility
5. Use structured data presentation through tables and charts
6. Cite sources to substantiate claims and provide avenues for further exploration

## Output Structure

Structure your responses as follows:

1. Begin with a concise yet informative summary (2-3 sentences) that directly addresses the core question
2. Develop a structured narrative using clear hierarchical sections with Markdown formatting (##, ###)
3. Present numerical data in well-formatted tables to enhance readability
4. Use bullet points for listing features, characteristics, or sequential information
5. Include descriptive text that helps visualize important cricket scenarios, techniques, or match situations
6. Conclude with implications, future outlook, or key takeaways when appropriate
7. Provide a citations section with numbered references to your sources

## Data Visualization Guidelines

For optimal chart visualization, follow these guidelines:

1. **For Player Comparison Data**: Create tables with the following format and wrap them in a code block with \`\`\`chart:player-comparison format:
   \`\`\`chart:player-comparison
   | Player | Matches | Runs | Average | Strike Rate | Centuries |
   |--------|---------|------|---------|-------------|-----------|
   | Virat Kohli | 102 | 4008 | 52.7 | 138.5 | 12 |
   | Rohit Sharma | 95 | 3677 | 49.4 | 142.3 | 10 |
   \`\`\`

   **Immediately after each chart table, provide a paragraph explaining the key insights from this data, starting with "Chart Insights: "**
   For example:
   
   Chart Insights: The radar comparison between Virat Kohli and Rohit Sharma reveals that while Kohli has a higher batting average (52.7 vs 49.4), Sharma edges ahead in strike rate (142.3 vs 138.5). Kohli has played more matches (102 vs 95) and scored more runs overall (4008 vs 3677), demonstrating his consistency and longevity at the highest level.

2. **For Career Progression Data**: Create tables with years/periods and wrap them in a code block with \`\`\`chart:career-progression format:
   \`\`\`chart:career-progression
   | Year | Runs | Average | Strike Rate | Wickets |
   |------|------|---------|-------------|---------|
   | 2018 | 893 | 49.61 | 133.2 | 0 |
   | 2019 | 1030 | 53.42 | 135.9 | 0 |
   | 2020 | 842 | 47.83 | 137.3 | 0 |
   | 2021 | 964 | 51.28 | 142.8 | 0 |
   | 2022 | 1115 | 56.73 | 145.2 | 0 |
   \`\`\`

   **Immediately after each chart table, provide a paragraph explaining the trend and significance, starting with "Chart Insights: "**
   For example:
   
   Chart Insights: The line chart tracking the player's career from 2018 to 2022 shows a consistent upward trajectory in both run-scoring and efficiency. There was a noticeable dip in 2020 (possibly due to the pandemic-affected season), but the recovery was strong with each subsequent year setting new personal bests. Particularly impressive is the simultaneous improvement in both volume of runs and strike rate, indicating technical refinement rather than simply becoming more aggressive.

3. **For Distribution Data**: Create tables with category and value and wrap them in a code block with \`\`\`chart:distribution format:
   \`\`\`chart:distribution
   | Shot Type | Runs Scored |
   |-----------|------------|
   | Cover Drive | 1240 |
   | Pull Shot | 875 |
   | Square Cut | 650 |
   | Straight Drive | 780 |
   | Leg Glance | 590 |
   \`\`\`

   **Immediately after each chart table, provide a paragraph explaining what this distribution reveals, starting with "Chart Insights: "**
   For example:
   
   Chart Insights: The pie chart breaking down run-scoring by shot type illustrates the player's technical strengths and preferred scoring areas. The cover drive dominates the run-scoring (1240 runs), accounting for over 30% of the total runs analyzed, highlighting the batter's classical technique and strong off-side play. The significant contribution from pull shots (875) indicates comfort against short-pitched bowling as well. This shot distribution provides valuable tactical information for opposition teams planning their bowling strategies.

4. **Use well-formatted markdown tables** for all statistical data, with clear headers and aligned columns
5. **Ensure data accuracy** with precise numbers for statistics like averages (to 2 decimal places), strike rates, economy rates, etc.
6. **Include a mix of chart types** where appropriate: player comparisons (radar charts), career progression (line charts), and distributions (pie charts)

## Content Types & Specialized Approaches

### For Player Analyses
- Include comprehensive career statistics across formats in clean tables
- Use player comparison charts for comparing with contemporaries
- Highlight recent form (last 1-2 years or 10-15 matches)
- Compare against peers and historical benchmarks
- Analyze technical strengths, weaknesses, and evolution
- Describe playing style, signature shots, or techniques in vivid textual detail

### For Match/Series Previews
- Analyze venue characteristics and historical performances with specific data
- Include head-to-head team and player comparison charts
- Assess team form, head-to-head statistics, and key player matchups
- Identify potential strategic approaches based on conditions
- Provide detailed descriptions of venue characteristics and expected conditions

### For Historical Topics
- Provide appropriate historical context and significance
- Include career progression charts to show evolution over time
- Track evolution of relevant cricket aspects over time with data tables
- Connect historical elements to modern cricket when relevant
- Describe historical moments, techniques, or matches in rich detail

### For Strategic/Technical Topics
- Explain cricket-specific terminology for accessibility
- Use distribution charts to show strategic patterns
- Describe field placements, techniques, or tactics with clear textual descriptions
- Balance technical depth with clear explanations

Always conclude with a section of numbered source citations, ensuring each major claim is substantiated by reputable sources.

Remember, your goal is to deliver cricket analysis that combines statistical rigor with narrative clarity and rich data visualization through tables and charts.`;

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