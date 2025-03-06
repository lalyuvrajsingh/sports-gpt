import { NextResponse } from 'next/server';
import { perplexityResearchClient } from '@/src/lib/api/perplexity-research';

export const runtime = 'edge';

/**
 * Deep research API route that uses Perplexity Sonar for comprehensive web research
 * This endpoint provides detailed, up-to-date information with citations from multiple sources
 */
export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);
  const startTime = Date.now();
  
  console.log(`[Research API:${requestId}] Received new request at ${new Date().toISOString()}`);
  
  try {
    // Parse the request body
    console.log(`[Research API:${requestId}] Parsing request body...`);
    const body = await req.json();
    const query = body.query;
    
    if (!query || typeof query !== 'string') {
      console.error(`[Research API:${requestId}] Invalid query provided: ${query}`);
      return NextResponse.json(
        { error: 'Invalid research query provided' },
        { status: 400 }
      );
    }
    
    console.log(`[Research API:${requestId}] Processing query: "${query}"`);
    console.log(`[Research API:${requestId}] Query length: ${query.length} characters`);
    
    try {
      // Conduct deep research using Perplexity's Sonar API
      console.log(`[Research API:${requestId}] Initiating Perplexity Sonar deep research...`);
      const researchStartTime = Date.now();
      
      const result = await perplexityResearchClient.conductResearch(query);
      
      const researchDuration = (Date.now() - researchStartTime) / 1000;
      console.log(`[Research API:${requestId}] Research completed in ${researchDuration.toFixed(2)}s`);
      console.log(`[Research API:${requestId}] Result content length: ${result.content.length} chars`);
      console.log(`[Research API:${requestId}] Sources found: ${result.sources.length}`);
      console.log(`[Research API:${requestId}] Search queries used: ${result.searchQueries?.length || 0}`);
      
      // Return the research results with sources and search queries
      const totalDuration = (Date.now() - startTime) / 1000;
      console.log(`[Research API:${requestId}] Request completed successfully in ${totalDuration.toFixed(2)}s`);
      
      return NextResponse.json({
        content: result.content,
        sources: result.sources,
        searchQueries: result.searchQueries || [],
        meta: {
          processingTime: totalDuration,
          timestamp: new Date().toISOString(),
          requestId: requestId
        }
      });
    } catch (error) {
      const errorDuration = (Date.now() - startTime) / 1000;
      console.error(`[Research API:${requestId}] Error conducting research after ${errorDuration.toFixed(2)}s:`, error);
      
      return NextResponse.json(
        { 
          error: "Failed to conduct research. Please try again later.",
          meta: {
            processingTime: errorDuration,
            timestamp: new Date().toISOString(),
            requestId: requestId
          }
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorDuration = (Date.now() - startTime) / 1000;
    console.error(`[Research API:${requestId}] Error in research API route after ${errorDuration.toFixed(2)}s:`, error);
    
    return NextResponse.json({ 
      error: "Internal server error",
      meta: {
        processingTime: errorDuration,
        timestamp: new Date().toISOString(),
        requestId: requestId
      }
    }, { status: 500 });
  }
} 