import { NextResponse } from 'next/server';
import { Message, StreamingTextResponse } from 'ai';
import { openaiClient } from '@/src/lib/api/openai';

export const runtime = 'edge';

/**
 * The chat route handler - processes incoming chat messages and returns responses
 * Uses OpenAI GPT-4o for accurate cricket information
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
      // Get the result from OpenAI GPT-4o
      console.log("Querying OpenAI GPT-4o...");
      const result = await openaiClient.getCricketInfo(query);
      console.log("Response from OpenAI:", result.substring(0, 100) + "...");
      
      // Use the Vercel AI's StreamingTextResponse with simple response handling
      // Avoiding complex browser APIs like TextEncoder and ReadableStream in Edge runtime
      return new Response(result, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (error) {
      console.error("Error querying OpenAI API:", error);
      return NextResponse.json(
        { error: "Failed to get information from OpenAI API" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 