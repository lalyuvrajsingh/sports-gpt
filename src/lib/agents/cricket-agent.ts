import { ChatOpenAI } from '@langchain/openai';
import { createGraph, StateGraph } from '@langchain/langgraph';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { AgentExecutor } from 'langchain/agents';
import { StructuredTool } from '@langchain/core/tools';
import { Document } from '@langchain/core/documents';
import { 
  MessagesState, 
  AIMessage, 
  HumanMessage 
} from '@langchain/core/messages';

import config from '../config';
import { cricketTools } from '../tools/cricket-tools';
import { similaritySearch } from '../vector-store/pinecone-client';

// Define the state interface
interface AgentState {
  messages: MessagesState;
  retrievedDocuments?: Document[];
}

/**
 * Create a cricket analysis agent using LangGraph
 */
export const createCricketAgent = () => {
  // Initialize the OpenAI model
  const llm = new ChatOpenAI({
    openAIApiKey: config.openai.apiKey,
    modelName: config.openai.model,
    temperature: 0.5,
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

  // Create a workflow with multiple nodes for different operations
  const workflow = new StateGraph<AgentState>({
    channels: {
      messages: { value: [] },
      retrievedDocuments: { value: [] },
    },
  });

  // Node 1: Retrieve relevant documents from vector store
  const retrieveNode = async (state: AgentState) => {
    // Get the latest user message
    const lastMessage = state.messages[state.messages.length - 1];
    if (!(lastMessage instanceof HumanMessage)) {
      return { ...state };
    }

    const query = lastMessage.content as string;
    
    try {
      // Search for relevant documents in the vector store
      const documents = await similaritySearch(query, 3);
      
      return {
        ...state,
        retrievedDocuments: documents,
      };
    } catch (error) {
      console.error('Error retrieving documents:', error);
      return { ...state };
    }
  };

  // Node 2: Generate a response with tools and context
  const agentNode = async (state: AgentState) => {
    // Format context from retrieved documents
    const contextText = state.retrievedDocuments?.length 
      ? state.retrievedDocuments.map(doc => doc.pageContent).join('\n\n')
      : 'No specific context available from the knowledge base.';
    
    // Create a prompt with context
    const prompt = systemPrompt.pipe(
      RunnableSequence.from([
        {
          messages: (state: AgentState) => state.messages,
          context: () => contextText,
        },
        systemPrompt,
      ])
    );

    // Create an agent executor with tools
    const executor = AgentExecutor.fromLLMAndTools(llm, cricketTools as StructuredTool[], {
      prefix: prompt.toString(),
    });

    // Extract the human message text
    const lastMessage = state.messages[state.messages.length - 1];
    const humanText = lastMessage instanceof HumanMessage ? lastMessage.content : '';
    
    try {
      // Run the agent with the human query
      const result = await executor.invoke({ input: humanText });
      
      // Return the updated state with the AI response
      return {
        ...state,
        messages: [...state.messages, new AIMessage(result.output)],
      };
    } catch (error) {
      console.error('Error in agent execution:', error);
      return {
        ...state,
        messages: [...state.messages, new AIMessage('I encountered an error processing your request. Please try again.')],
      };
    }
  };

  // Add nodes to the workflow
  workflow.addNode('retrieve', retrieveNode);
  workflow.addNode('agent', agentNode);

  // Define the edges between nodes
  workflow.addEdge('retrieve', 'agent');
  workflow.setEntryPoint('retrieve');
  
  // Compile the graph
  const graph = workflow.compile();
  
  return graph;
};

/**
 * Run the cricket agent with a user query
 * @param query The user query to process
 * @param chatHistory Optional chat history
 */
export const runCricketAgent = async (query: string, chatHistory: MessagesState = []) => {
  const graph = createCricketAgent();
  
  // Initialize the state with chat history and the new human message
  const initialState: AgentState = {
    messages: [...chatHistory, new HumanMessage(query)],
  };
  
  // Execute the agent graph
  const result = await graph.invoke(initialState);
  
  // Return the full message history including the new AI response
  return result.messages;
}; 