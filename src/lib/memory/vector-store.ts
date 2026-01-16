
interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}

export class VectorStore {
  private documents: VectorDocument[] = [];

  async addDocument(content: string, metadata: Record<string, any> = {}) {
    console.log("[MEMORY] Adding document to vector store...");
    // Mock embedding generation
    const embedding = new Array(1536).fill(0).map(() => Math.random());
    
    this.documents.push({
      id: crypto.randomUUID(),
      content,
      embedding,
      metadata
    });
  }

  async search(query: string, limit: number = 3): Promise<VectorDocument[]> {
    console.log(`[MEMORY] Semantic search for: "${query}"`);
    // Mock search - return random documents or empty if none
    return this.documents.slice(0, limit);
  }
  
  // Save/Load from localStorage for persistence in MVP
  persist() {
      if (typeof window !== 'undefined') {
          localStorage.setItem('aether_vector_store', JSON.stringify(this.documents));
      }
  }

  load() {
      if (typeof window !== 'undefined') {
          const data = localStorage.getItem('aether_vector_store');
          if (data) {
              this.documents = JSON.parse(data);
          }
      }
  }
}
