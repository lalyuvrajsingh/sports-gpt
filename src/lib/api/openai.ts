import { config } from '@/src/lib/config';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface OpenAIResponse {
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
  // Tool output fields if any
  tool_calls?: any[];
}

/**
 * OpenAI client for the Sports GPT application
 * Handles cricket information queries using OpenAI's GPT-4o model
 */
class OpenAIClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string = 'gpt-4o'; // Using GPT-4o by default
  private systemPrompt: string = `You are CricketGPT, a specialized cricket authority providing expert analysis and information.

CAPABILITIES:
1. Deliver accurate, detailed cricket information with statistical precision
2. Answer questions about players, teams, tournaments, historical records, and current rankings
3. Provide match analyses, player comparisons, and tournament overviews
4. Explain cricket rules, terminology, and strategies to fans of all knowledge levels

RESPONSE FORMAT:
1. Begin with a direct, concise answer to the main question (1-2 sentences)
2. Structure content with clear markdown headings (##, ###) and bullet points
3. Present statistical data in well-formatted tables for clarity
4. Include career statistics for players with proper formatting
5. Use cricket terminology appropriately with brief explanations when needed
6. For historical content, include dates and contextual information
7. When discussing records or rankings, include specific numbers and timeframes

CONTENT GUIDELINES:
1. Focus on factual accuracy with precise statistics and data
2. Present balanced perspectives on debated topics
3. Highlight significant achievements and records
4. Include both historical context and recent developments
5. For questions about "best" or "greatest," provide objective criteria and multiple perspectives
6. When discussing match strategies or techniques, explain the reasoning clearly
7. Provide thoughtful analysis beyond just raw statistics

Always maintain accuracy, clarity, and helpfulness in your cricket expertise.`;

  constructor() {
    this.apiKey = config.openai.apiKey;
    this.baseUrl = config.openai.baseUrl;
    
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('OpenAI API key is not set or using placeholder. Using fallback mode.');
    }
  }

  /**
   * Queries OpenAI's GPT-4o model for cricket information
   * @param query The user's cricket query
   * @returns A formatted response with cricket information
   */
  async getCricketInfo(query: string): Promise<string> {
    console.log(`Sending OpenAI query: "${query.substring(0, 50)}..."`);
    
    // Check if API key is valid
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.log("Using fallback response (no valid API key)");
      return this.getFallbackResponse(query);
    }
    
    try {
      // Using Node-compatible AbortController
      let abortController;
      try {
        abortController = new AbortController();
      } catch (e) {
        // Fallback if AbortController is not available
        console.warn("AbortController not available, timeout will not work");
        abortController = { signal: undefined, abort: () => {} };
      }
      
      const timeoutId = setTimeout(() => {
        try {
          abortController.abort();
        } catch (e) {
          console.warn("Could not abort request", e);
        }
      }, 25000); // 25 second timeout
      
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
              content: query
            }
          ],
          temperature: 0.1,
          max_tokens: 2048
        }),
        signal: abortController.signal
      });
      
      // Clear the timeout as soon as we get a response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}): ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
        console.error("Empty response from OpenAI API");
        throw new Error("Empty response from OpenAI API");
      }
      
      // Extract content
      const content = data.choices[0].message.content;
      
      // Log successful query
      console.log(`Successfully retrieved cricket information from OpenAI (${content.length} chars)`);
      
      return content;
    } catch (error: unknown) {
      // Check for AbortError in a way that works in both browser and Node.js
      const isAbortError = error instanceof Error && 
        (error.name === 'AbortError' || 
         (error instanceof DOMException && error.name === 'AbortError'));
         
      if (isAbortError) {
        console.error("OpenAI query timed out after 25 seconds");
        return `I'm sorry, the research is taking longer than expected. Please try asking your cricket question again in a more specific way.`;
      }
      
      console.error("Error in OpenAI query:", error);
      return this.getFallbackResponse(query);
    }
  }
  
  /**
   * Provides a fallback response when API access fails
   * @param query The user's cricket query
   * @returns A helpful fallback response
   */
  private getFallbackResponse(query: string): string {
    if (query.toLowerCase().includes("world cup")) {
      return `## Cricket World Cup Information

Australia has been the most successful team in Cricket World Cup history, winning the tournament a record 6 times (1987, 1999, 2003, 2007, 2015, and 2023). 

India follows with 3 World Cup victories (1983, 2011, and 2023), while the West Indies has won twice (1975 and 1979). Other countries with one World Cup each include Pakistan (1992), Sri Lanka (1996), and England (2019).

The Cricket World Cup is held approximately every four years and is organized by the International Cricket Council (ICC).

*Note: This is a fallback response as the OpenAI API connection is unavailable.*`;
    }
    
    if (query.toLowerCase().includes("ipl")) {
      return `## IPL Information

The Indian Premier League (IPL) is one of the most popular T20 cricket leagues in the world. Mumbai Indians is the most successful IPL team with 5 championships, followed by Chennai Super Kings with 4 titles.

The IPL typically features 8-10 teams and runs annually for about 2 months. It has revolutionized cricket with its mix of international and domestic talent playing together in a franchise format.

*Note: This is a fallback response as the OpenAI API connection is unavailable.*`;
    }
    
    // General cricket fallback
    return `## Cricket Information

Cricket is a bat-and-ball game played between two teams of eleven players on a field with a 22-yard pitch in the center. The game has various formats including Test matches (played over 5 days), One Day Internationals (50 overs per side), and Twenty20 (20 overs per side).

The International Cricket Council (ICC) is the global governing body for cricket. Major cricket playing nations include India, Australia, England, Pakistan, South Africa, New Zealand, and the West Indies.

*Note: This is a fallback response as the OpenAI API connection is unavailable. For more specific information, please add a valid OpenAI API key to your configuration.*`;
  }
}

// Export a singleton instance
export const openaiClient = new OpenAIClient();
export default openaiClient; 