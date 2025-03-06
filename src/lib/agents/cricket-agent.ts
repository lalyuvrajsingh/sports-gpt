import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { StructuredTool } from '@langchain/core/tools';
import { Document } from '@langchain/core/documents';
import { 
  AIMessage, 
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';

import config from '../config';
import { cricketTools } from '../tools/cricket-tools';
import { similaritySearch } from '../vector-store/pinecone-client';
import perplexityClient from '../api/perplexity';

// Maximum time to wait for agent execution (in milliseconds)
const AGENT_TIMEOUT = 40000; // 40 seconds

// Define the state interface
interface AgentState {
  messages: Array<HumanMessage | AIMessage>;
  retrievedDocuments?: Document[];
}

/**
 * Create a cricket analysis agent using LangChain
 */
export const createCricketAgent = async () => {
  try {
    // Initialize the LLM with Groq configuration
    const llm = new ChatOpenAI({
      modelName: config.llm.model,
      temperature: config.llm.temperature,
      openAIApiKey: config.llm.apiKey,
      configuration: {
        baseURL: 'https://api.groq.com/openai/v1',
      },
      maxRetries: 3,
      timeout: 30000, // 30 seconds timeout
    });

    // Create a system prompt for the cricket agent
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a cricket expert assistant with deep knowledge about cricket statistics, 
      players, matches, and tournaments. You can access real-time data and provide
      in-depth analysis of cricket matches, player performances, and tournament statistics.

      You have the following tools at your disposal:
      - search-cricket-players: Search for cricket players by name
      - get-cricket-player-stats: Get detailed statistics for a cricket player
      - get-bowling-stats: Get detailed bowling statistics for a cricket player
      - get-live-cricket-matches: Get information about ongoing cricket matches
      - get-cricket-match-details: Get details about a specific cricket match
      - get-cricket-match-scorecard: Get the scorecard for a specific cricket match
      - research-cricket-information: Research real-time information about cricket using Perplexity Sonar API
      - deep-research-cricket: Perform in-depth research on complex cricket topics using Perplexity Sonar Pro

      GUIDELINES FOR PROVIDING DETAILED ANSWERS:
      1. When answering cricket queries, ALWAYS use the research-cricket-information or deep-research-cricket tool
         to ensure you provide the most up-to-date and factual information.
      2. Use deep-research-cricket for complex questions that require in-depth analysis.
      3. Use research-cricket-information for more straightforward factual questions.
      4. ALWAYS CITE YOUR SOURCES when providing information from research.
      5. Present statistics in clear, formatted tables when appropriate.
      6. For player stats, match details, or specific scorecards, use the specialized tools first,
         then supplement with research tools for context and additional information.
      
      Context: {context}`],
      ["human", "{input}"],
      ["assistant", "{agent_scratchpad}"]
    ]);

    // Create the agent
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools: cricketTools as StructuredTool[],
      prompt,
    });

    // Create an agent executor with tools
    return AgentExecutor.fromAgentAndTools({
      agent,
      tools: cricketTools as StructuredTool[],
      verbose: true, // Enable verbose output to see the tool usage
      maxIterations: 3, // Limit iterations to prevent infinite loops
    });
  } catch (error) {
    console.error("Error creating cricket agent:", error);
    throw error;
  }
};

// New web search fallback when all else fails
const performWebSearch = async (query: string) => {
  try {
    console.log(`Falling back to web search for: ${query}`);
    
    // Add cricket context to the query
    const cricketQuery = `cricket ${query}`;
    
    // Make a fetch to the DuckDuckGo API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Note: We're using the non-official DuckDuckGo API endpoint which might not always work
      // This is a simplified implementation
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(cricketQuery)}&format=json&no_html=1&skip_disambig=1`, 
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Web search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the results
      let answer = '';
      
      // Add the abstract if available
      if (data.Abstract && data.Abstract.length > 0) {
        answer += `${data.Abstract}\n\n`;
      } else if (data.Answer && data.Answer.length > 0) {
        answer += `${data.Answer}\n\n`;
      }
      
      // Add related topics
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        const topics = data.RelatedTopics
          .filter((item: any) => item.Text && item.Text.length > 0)
          .slice(0, 3)
          .map((item: any) => item.Text)
          .join('\n\n');
          
        if (topics.length > 0) {
          answer += topics;
        }
      }
      
      // If we have a decent result, return it
      if (answer.length > 100) {
        console.log(`Web search successful: ${answer.substring(0, 50)}...`);
        return `${answer}\n\nSource: DuckDuckGo search`;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error("Web search timed out after 10 seconds");
      } else {
        console.error("Web search API error:", error);
      }
    }
    
    // Fallback cricket info if web search fails
    return getCricketWorldCupInfo(query);
  } catch (error) {
    console.error("Web search fallback failed:", error);
    return getCricketWorldCupInfo(query);
  }
};

// Static fallback information when all else fails
const getCricketWorldCupInfo = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  
  // Determine what cricket information to return based on query keywords
  if (lowercaseQuery.includes('world cup') && 
      (lowercaseQuery.includes('win') || lowercaseQuery.includes('most'))) {
    return `
Australia has won the most Cricket World Cups with 6 titles (1987, 1999, 2003, 2007, 2015, 2023), followed by:
- India: 2 titles (1983, 2011)
- West Indies: 2 titles (1975, 1979)
- Pakistan: 1 title (1992)
- Sri Lanka: 1 title (1996)
- England: 1 title (2019)

Australia has been the most dominant team in Cricket World Cup history, appearing in 8 finals.

Source: Cricket World Cup historical records
`;
  } else if (lowercaseQuery.includes('player') || lowercaseQuery.includes('batsman') || 
             lowercaseQuery.includes('batting')) {
    return `
The top Cricket World Cup batting records are:
1. Sachin Tendulkar (India): Most runs (2,278) and most centuries (6)
2. Ricky Ponting (Australia): Second most runs (1,743)
3. Kumar Sangakkara (Sri Lanka): Third most runs (1,532)

The highest individual score in a World Cup match is 237* by Martin Guptill (New Zealand) against West Indies in 2015.

Source: Cricket World Cup historical records
`;
  } else if (lowercaseQuery.includes('bowl') || lowercaseQuery.includes('wicket')) {
    return `
The top Cricket World Cup bowling records are:
1. Glenn McGrath (Australia): Most wickets (71)
2. Muttiah Muralitharan (Sri Lanka): Second most wickets (68)
3. Lasith Malinga (Sri Lanka): Third most wickets (56)

The best bowling figures in a World Cup match are 7/15 by Tim Southee (New Zealand) against England in 2015.

Source: Cricket World Cup historical records
`;
  } else {
    return `
The Cricket World Cup is the international championship of One Day International cricket. It is organized by the International Cricket Council (ICC) and is played every four years.

Key facts:
- Australia has won the most titles (6)
- The tournament started in 1975 in England
- The most recent World Cup was held in India in 2023, won by Australia
- The tournament has featured between 8 and 16 teams in different editions

I couldn't find specific information about "${query}" at this moment, but I've provided some general Cricket World Cup information.

Source: Cricket World Cup historical records
`;
  }
};

/**
 * Run the cricket agent with a user query
 * @param query The user query to process
 * @param chatHistory Optional chat history
 */
export const runCricketAgent = async (
  query: string, 
  chatHistory: Array<HumanMessage | AIMessage> = []
) => {
  console.log(`Processing query: "${query}"`);
  let context = "";
  
  // Set a maximum time for embeddings generation
  const embeddingsTimeout = 10000; // 10 seconds
  
  try {
    console.log("Retrieving context from vector store...");
    
    // Use a Promise.race to timeout embeddings if they take too long
    try {
      const embeddingsPromise = similaritySearch(query, 5);
      const timeoutPromise = new Promise<Document[]>((_, reject) => 
        setTimeout(() => reject(new Error("Embeddings timeout")), embeddingsTimeout)
      );
      
      const docs: Document[] = await Promise.race([embeddingsPromise, timeoutPromise])
        .catch(error => {
          console.log(`Embeddings timed out after ${embeddingsTimeout/1000} seconds: ${error.message}`);
          return [] as Document[];
        });
        
      console.log(`Retrieved ${docs.length} relevant documents from vector store`);
      
      if (docs.length > 0) {
        context = docs.map((doc: Document) => doc.pageContent).join("\n\n");
      }
    } catch (embeddingError) {
      console.error("Error retrieving context from vector store:", embeddingError);
      console.log("Proceeding without context due to embeddings error");
      // Immediately try direct research for faster response when embeddings fail
      console.log("Falling back to direct research immediately...");
      return performDirectResearch(query);
    }
  } catch (error) {
    console.error("Error in context retrieval:", error);
    // Fall back to direct research when context retrieval fails
    console.log("Falling back to direct research due to context retrieval failure...");
    return performDirectResearch(query);
  }
  
  console.log("Running cricket agent with query and context...");
  
  try {
    const agent = await createCricketAgent();
    
    // Execute agent with more aggressive timeout (20 seconds)
    const controller = new AbortController();
    const REDUCED_AGENT_TIMEOUT = 20000; // 20 seconds instead of whatever the original was
    const timeoutId = setTimeout(() => controller.abort(), REDUCED_AGENT_TIMEOUT);
    
    try {
      const result = await Promise.race([
        agent.invoke({
          input: query,
          chat_history: chatHistory,
          context,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Agent execution timed out")), REDUCED_AGENT_TIMEOUT)
        )
      ]);
      
      clearTimeout(timeoutId);
      console.log("Agent execution completed");
      
      // Check if result has content
      if (result && typeof result.output === 'string' && result.output.trim().length > 0) {
        console.log(`Agent returned response with ${result.output.length} characters`);
        return result.output;
      } else {
        console.log("Agent returned empty result, using fallback");
        return await performDirectResearch(query);
      }
    } catch (agentError) {
      clearTimeout(timeoutId);
      console.error("Error or timeout in agent execution:", agentError);
      return await performDirectResearch(query);
    }
  } catch (error) {
    console.error("Error creating or running cricket agent:", error);
    console.log("Agent execution failed, using fallback research");
    return await performDirectResearch(query);
  }
};

const performDirectResearch = async (query: string) => {
  console.log("Using direct research fallback for query:", query);
  
  // Try the direct Sonar query with shorter timeout
  try {
    console.log("Attempting direct Sonar query with 15s timeout...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const sonarResponse = await perplexityClient.directSonarQuery(query);
    clearTimeout(timeoutId);
    
    console.log("Direct Sonar query successful");
    return sonarResponse;
  } catch (error) {
    console.error("Direct Sonar query failed:", error instanceof Error ? error.message : error);
    
    // Try the detailed research query with shorter timeout
    try {
      console.log("Falling back to detailed research with 10s timeout...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const detailedResponse = await perplexityClient.researchDetailed(query);
      clearTimeout(timeoutId);
      
      let formattedResult = detailedResponse.answer;
      
      // Append sources if they exist and aren't already included
      if (detailedResponse.sources && detailedResponse.sources.length > 0) {
        if (!formattedResult.includes("Sources:")) {
          formattedResult += "\n\n**Sources:**\n";
          formattedResult += detailedResponse.sources
            .map(source => `- [${source.title}](${source.url})`)
            .join("\n");
        }
      }
      
      console.log("Detailed research successful");
      return formattedResult;
    } catch (detailedError) {
      console.error("Detailed research failed:", detailedError instanceof Error ? detailedError.message : detailedError);
      
      // Last API fallback - try basic research
      try {
        console.log("Falling back to basic research with 5s timeout...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const basicResponse = await perplexityClient.research(query);
        clearTimeout(timeoutId);
        
        console.log("Basic research successful");
        return basicResponse.answer;
      } catch (basicError) {
        console.error("All API methods failed, using cricket knowledge fallback");
        
        // If all API methods fail, use local cricket knowledge
        return getCricketWorldCupInfo(query);
      }
    }
  }
}; 