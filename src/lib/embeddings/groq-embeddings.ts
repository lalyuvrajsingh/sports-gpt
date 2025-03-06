import { Embeddings } from "@langchain/core/embeddings";
import { ChatGroq } from "@langchain/groq";
import config from "../config";

/**
 * Custom embeddings class that uses Groq's LLM to generate embeddings
 * This is a workaround since Groq doesn't offer a dedicated embeddings API
 */
export class GroqEmbeddings implements Embeddings {
  private model: ChatGroq;
  private dimension: number;
  private cache: Map<string, number[]>;

  constructor() {
    this.model = new ChatGroq({
      apiKey: config.groq.apiKey,
      modelName: config.llm.model || "llama-3.3-70b-versatile", // Use the same LLM as the main application
    });
    
    // Set the dimension to match Pinecone index dimension for sports-gpt-index
    this.dimension = 3072;
    
    // Initialize cache to avoid redundant embedding requests
    this.cache = new Map<string, number[]>();
    
    console.log(`Initialized GroqEmbeddings with model: ${config.llm.model || "llama-3.3-70b-versatile"} and dimension: ${this.dimension}`);
  }

  /**
   * Embed a single document
   * @param text The text to embed
   * @returns A vector representation of the text
   */
  async embedQuery(text: string): Promise<number[]> {
    try {
      // Check cache first
      const normalizedText = text.trim().toLowerCase();
      if (this.cache.has(normalizedText)) {
        return this.cache.get(normalizedText)!;
      }
      
      console.log(`Generating embeddings for text: "${text.substring(0, 30)}..."`);
      
      const prompt = `
Generate a numerical vector representation with exactly ${this.dimension} dimensions for the following text.
The vector should capture the semantic meaning of the text.
Respond ONLY with a JSON array of ${this.dimension} floating point numbers between -1 and 1.
Return NOTHING but the JSON array - no explanation, no preamble.

Text: ${text}`;

      const response = await this.model.invoke(prompt);
      const content = response.content.toString().trim();
      
      // Extract the JSON array from the response
      const jsonMatch = content.match(/\[.*\]/s);
      if (!jsonMatch) {
        console.error("Failed to extract vector. Model response:", content);
        throw new Error("Failed to extract vector from response");
      }
      
      let vector: number[];
      try {
        vector = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error("Failed to parse vector JSON:", jsonMatch[0]);
        throw new Error("Failed to parse vector JSON");
      }
      
      // Ensure the vector has the correct dimension
      if (vector.length !== this.dimension) {
        console.warn(`Vector dimension mismatch. Expected ${this.dimension}, got ${vector.length}. Adjusting...`);
        
        if (vector.length < this.dimension) {
          // Pad with zeros
          vector = [...vector, ...Array(this.dimension - vector.length).fill(0)];
        } else {
          // Truncate
          vector = vector.slice(0, this.dimension);
        }
      }
      
      // Store in cache
      this.cache.set(normalizedText, vector);
      console.log("Successfully generated embeddings");
      
      return vector;
    } catch (error) {
      console.error("Error embedding query with Groq:", error);
      // Return a zero vector as fallback
      return Array(this.dimension).fill(0);
    }
  }

  /**
   * Embed multiple documents
   * @param documents The documents to embed
   * @returns Vector representations of the documents
   */
  async embedDocuments(documents: string[]): Promise<number[][]> {
    const embeddings = [];
    
    console.log(`Generating embeddings for ${documents.length} documents`);
    
    // Process documents in batches to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(documents.length/batchSize)}`);
      
      const batchPromises = batch.map((doc) => this.embedQuery(doc));
      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < documents.length) {
        console.log("Adding delay between batches...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return embeddings;
  }
} 