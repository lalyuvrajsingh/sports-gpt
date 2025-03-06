/**
 * Configuration settings for the Sports GPT application
 * This file centralizes all configuration and environment variables
 */

// Environment variables with fallbacks for development
export const config = {
  // LLM Configuration (using Groq through OpenAI interface)
  llm: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 8192,
  },
  
  // Groq configuration for embeddings and other API calls
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    baseUrl: 'https://api.groq.com/openai/v1',
  },
  
  // OpenAI Configuration (fallback for embeddings)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || '',  // Fallback to Groq for compatibility
    model: process.env.OPENAI_MODEL || 'gpt-4',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  
  // Perplexity Configuration for Sonar API
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
  },
  
  // Pinecone Vector Database Configuration
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || '',
    indexName: process.env.PINECONE_INDEX_NAME || 'sports-gpt-index',
  },
  
  // Sports API Configuration
  sportsApi: {
    apiKey: process.env.SPORTS_API_KEY || '',
    host: process.env.SPORTS_API_HOST || '',
  },
  
  // Application Settings
  app: {
    name: 'Sports GPT',
    description: 'Sports-specific GPT with real-time updates and in-depth analysis',
  },
};

// Validate critical configuration
export function validateConfig() {
  const requiredVars = [
    { key: 'llm.apiKey', value: config.llm.apiKey },
    { key: 'perplexity.apiKey', value: config.perplexity.apiKey },
    { key: 'pinecone.apiKey', value: config.pinecone.apiKey },
    { key: 'pinecone.environment', value: config.pinecone.environment },
    { key: 'sportsApi.apiKey', value: config.sportsApi.apiKey },
  ];
  
  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    const missing = missingVars.map(v => v.key).join(', ');
    console.error(`Missing required environment variables: ${missing}`);
    console.error('Please check your .env.local file and make sure all required variables are set.');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing}`);
    }
  }
  
  return missingVars.length === 0;
}

export default config; 