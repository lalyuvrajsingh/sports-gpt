import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { StructuredTool } from '@langchain/core/tools';
import { Document } from '@langchain/core/documents';
import { 
  AIMessage, 
  HumanMessage 
} from '@langchain/core/messages';

import config from '../config';
import { cricketTools } from '../tools/cricket-tools';
import { similaritySearch } from '../vector-store/pinecone-client';

// Define the state interface
interface AgentState {
  messages: Array<HumanMessage | AIMessage>;
  retrievedDocuments?: Document[];
}

/**
 * Create a cricket analysis agent using LangChain
 */
export const createCricketAgent = () => {
  // Initialize the LLM with Groq configuration
  const llm = new ChatOpenAI({
    modelName: config.llm.model,
    temperature: config.llm.temperature,
    openAIApiKey: config.llm.apiKey,
    configuration: {
      baseURL: 'https://api.groq.com/openai/v1',
    },
  });

  // Create a system prompt for the cricket agent
  const systemPrompt = ChatPromptTemplate.fromTemplate(`
    You are a cricket expert assistant with deep knowledge about cricket statistics, 
    players, matches, and tournaments. You can access real-time data and provide
    in-depth analysis of cricket matches, player performances, and tournament statistics.

    You have the following tools at your disposal:
    - search-cricket-players: Search for cricket players by name
    - get-cricket-player-stats: Get detailed statistics for a cricket player
    - get-bowling-stats: Get detailed bowling statistics for a cricket player
    - get-live-cricket-matches: Get information about ongoing cricket matches
    - get-cricket-match-details: Get details about a specific cricket match
    - get-cricket-match-scorecard: Get the scorecard for a specific cricket match
    - research-cricket-information: Research real-time information about cricket

    Always provide data-backed insights and cite your sources if using research information.
    If you don't know something, use the appropriate tool to look it up.
    
    {context}
  `);

  // Create an agent executor with tools
  const executor = AgentExecutor.fromAgentAndTools({
    agent: createOpenAIFunctionsAgent({
      llm,
      tools: cricketTools as StructuredTool[],
      prompt: systemPrompt,
    }),
    tools: cricketTools as StructuredTool[],
  });

  return executor;
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
  try {
    // Create the agent
    const agent = createCricketAgent();
    
    // Get relevant context from vector store
    const documents = await similaritySearch(query, 3);
    const context = documents.map(doc => doc.pageContent).join('\n\n');
    
    // Run the agent
    const result = await agent.invoke({
      input: query,
      chat_history: chatHistory,
      context,
    });
    
    // Convert the result to a message
    const message = new AIMessage(result.output);
    
    // Return the updated chat history
    return [...chatHistory, new HumanMessage(query), message];
  } catch (error) {
    console.error('Error running cricket agent:', error);
    throw error;
  }
}; 