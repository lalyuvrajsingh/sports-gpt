import { Message, StreamingTextResponse, createStreamableUI } from 'ai';
import { validateConfig } from '@/src/lib/config';
import { runCricketAgent } from '@/src/lib/agents/cricket-agent';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

export const runtime = 'edge';

/**
 * Convert chat messages from the AI SDK format to LangChain format
 */
function convertMessagesToLangChain(messages: Message[]) {
  return messages.map(message => {
    if (message.role === 'user') {
      return new HumanMessage(message.content);
    } else if (message.role === 'assistant') {
      return new AIMessage(message.content);
    }
    // Skip system messages for now
    return null;
  }).filter(Boolean);
}

/**
 * API handler for chat requests
 */
export async function POST(req: Request) {
  try {
    // Validate the configuration
    validateConfig();

    // Parse the incoming request
    const body = await req.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      return new Response(JSON.stringify({ error: 'Last message must be from the user' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Convert previous messages to LangChain format
    const previousMessages = convertMessagesToLangChain(messages.slice(0, -1));
    
    // Create a streaming UI response
    const ui = createStreamableUI();
    
    // Add the thinking indicator
    ui.update(<div className="thinking">Thinking...</div>);
    
    // Run the cricket agent and get the response
    const responseMessages = await runCricketAgent(lastMessage.content, previousMessages);
    
    // Get the latest AI message (the response)
    const aiResponse = responseMessages[responseMessages.length - 1];
    if (!aiResponse || !(aiResponse instanceof AIMessage)) {
      throw new Error('Failed to get AI response');
    }
    
    // Update the UI with the final response and remove the thinking indicator
    ui.update(<div className="response">{aiResponse.content}</div>);
    ui.done();
    
    // Create and return a streaming response
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(aiResponse.content);
        controller.close();
      },
    });
    
    return new StreamingTextResponse(stream, {}, ui);
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: error.message || 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 