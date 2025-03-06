import { NextResponse } from 'next/server';
import { Message, StreamingTextResponse } from 'ai';
import { perplexityClient } from '@/src/lib/api/perplexity';

export const runtime = 'edge';

/**
 * The chat route handler - processes incoming chat messages and returns responses
 * Uses Perplexity Sonar API for accurate cricket information
 */
export async function POST(req: Request) {
  console.log('Chat API: Received new request');
  
  try {
    // Parse the request body
    const body = await req.json();
    const messages = body.messages ?? [];
    const query = messages[messages.length - 1]?.content;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query provided' },
        { status: 400 }
      );
    }
    
    console.log(`Chat API: Processing query: "${query}"`);
    
    try {
      // Get the result from Perplexity
      console.log("Directly querying Perplexity Sonar API...");
      const result = await perplexityClient.directSonarQuery(query);
      console.log("Response from Perplexity:", result.substring(0, 100) + "...");
      
      // Create a properly formatted text response for AI SDK
      const textEncoder = new TextEncoder();
      const fakeStream = new ReadableStream({
        async start(controller) {
          controller.enqueue(textEncoder.encode(result));
          controller.close();
        },
      });

      // Use the Vercel AI's StreamingTextResponse with the correct content type
      return new StreamingTextResponse(fakeStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (error) {
      console.error("Error querying Perplexity Sonar API:", error);
      return NextResponse.json(
        { error: "Failed to get information from Perplexity API" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 