import { aiService } from './aiService';

// Memory cache for RAG knowledge base chunks to avoid hitting IndexedDB on every query
let cachedKnowledgeChunks: KnowledgeChunk[] | null = null;

async function getCachedChunks(): Promise<KnowledgeChunk[]> {
  if (cachedKnowledgeChunks) return cachedKnowledgeChunks;
  try {
    const db = await openDB();
    const tx = db.transaction('knowledge_chunks', 'readonly');
    const store = tx.objectStore('knowledge_chunks');
    const chunks: KnowledgeChunk[] = await new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    cachedKnowledgeChunks = chunks;
    return chunks;
  } catch (e) {
    console.error('Failed to load knowledge chunks from DB into cache:', e);
    return [];
  }
}

function invalidateChunksCache() {
  cachedKnowledgeChunks = null;
}

export interface KnowledgeChunk {
  id?: number;
  text: string;
  embedding: number[];
  metadata: {
    source: string;
    timestamp: string;
    category?: string;
  };
}

export interface UserHabit {
  id?: number;
  timestamp: string;
  action: string;
  category: string;
  detail?: string;
}

export interface UserIdentity {
  key: string;
  name: string;
  role: string;
  goals: string[];
  tone: string;
  experience: string;
  techStack: string;
  hardwareTier: string;
  completedOnboarding: boolean;
  lastUpdated: string;
}

export interface UserProfileSummary {
  key: string; // 'habits_summary'
  preferredTools: string[];
  commonWorkflows: string[];
  activeHours: string[];
  profileSummary: string;
  lastUpdated: string;
}

// Open IndexedDB Connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('domodomo_cognitive_brain', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('knowledge_chunks')) {
        db.createObjectStore('knowledge_chunks', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('user_habits')) {
        db.createObjectStore('user_habits', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('user_profile')) {
        db.createObjectStore('user_profile', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Calculate Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Simple Text Chunker
function chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
  const chunks: string[] = [];
  let startIndex = 0;
  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex < text.length) {
      const nextSpace = text.indexOf(' ', endIndex);
      if (nextSpace !== -1 && nextSpace - endIndex < 50) {
        endIndex = nextSpace;
      }
    }
    chunks.push(text.slice(startIndex, endIndex).trim());
    startIndex = endIndex - overlap;
    if (startIndex >= text.length - overlap) break;
  }
  return chunks.filter(c => c.length > 5);
}

export const unifiedMemory = {
  // --- USER HABITS & DYNAMIC MEMORY ---
  async recordAction(action: string, category: string, detail?: string): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction('user_habits', 'readwrite');
      const store = tx.objectStore('user_habits');
      
      const newEvent: UserHabit = {
        timestamp: new Date().toISOString(),
        action,
        category,
        detail
      };

      await new Promise<void>((resolve, reject) => {
        const req = store.add(newEvent);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      // Keep only last 100 habits
      const countTx = db.transaction('user_habits', 'readwrite');
      const countStore = countTx.objectStore('user_habits');
      const habits: UserHabit[] = await new Promise((resolve, reject) => {
        const req = countStore.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      if (habits.length > 100) {
        habits.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const toDelete = habits.slice(0, habits.length - 100);
        for (const item of toDelete) {
          if (item.id) {
            countStore.delete(item.id);
          }
        }
      }

      // Automatically compile profile summary
      await this.compileProfileSummary();
      window.dispatchEvent(new Event('domodomo_memory_updated'));
    } catch (e) {
      console.warn('Failed to record user habit action:', e);
    }
  },

  async getRecentActions(limit = 15): Promise<UserHabit[]> {
    try {
      const db = await openDB();
      const tx = db.transaction('user_habits', 'readonly');
      const store = tx.objectStore('user_habits');
      const habits: UserHabit[] = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      return habits
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch {
      return [];
    }
  },

  async clearHabits(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(['user_habits', 'user_profile'], 'readwrite');
      tx.objectStore('user_habits').clear();
      tx.objectStore('user_profile').clear();
      window.dispatchEvent(new Event('domodomo_memory_updated'));
    } catch (e) {
      console.error('Failed to clear user habits:', e);
    }
  },

  async compileProfileSummary(): Promise<void> {
    try {
      const habits = await this.getRecentActions(100);
      if (habits.length === 0) return;

      // Extract preferred tools (count occurrences of action/details)
      const toolCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};
      const hourCounts: Record<number, number> = {};

      for (const h of habits) {
        const toolName = h.detail || h.action;
        toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
        categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
        
        const date = new Date(h.timestamp);
        const hour = date.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }

      const preferredTools = Object.entries(toolCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

      const preferredCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      const activeHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => `${hour}:00 - ${Number(hour) + 1}:00`);

      const profileSummary = `The user frequently works on projects involving ${preferredCategories.join(', ')} categories. Their favorite tool utilities include: ${preferredTools.join(', ')}. They are typically active around ${activeHours.join(', ')}.`;

      const db = await openDB();
      const tx = db.transaction('user_profile', 'readwrite');
      const store = tx.objectStore('user_profile');
      
      const updatedProfile: UserProfileSummary = {
        key: 'habits_summary',
        preferredTools,
        commonWorkflows: preferredCategories,
        activeHours,
        profileSummary,
        lastUpdated: new Date().toISOString()
      };

      await new Promise<void>((resolve, reject) => {
        const req = store.put(updatedProfile);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed compiling user profile habits:', e);
    }
  },

  async getProfileSummary(): Promise<UserProfileSummary | null> {
    try {
      const db = await openDB();
      const tx = db.transaction('user_profile', 'readonly');
      const store = tx.objectStore('user_profile');
      return await new Promise((resolve, reject) => {
        const req = store.get('habits_summary');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  async saveUserIdentity(identity: Omit<UserIdentity, 'key' | 'lastUpdated'>): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction('user_profile', 'readwrite');
      const store = tx.objectStore('user_profile');
      const data: UserIdentity = {
        ...identity,
        key: 'user_identity',
        lastUpdated: new Date().toISOString()
      };
      await new Promise<void>((resolve, reject) => {
        const req = store.put(data);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      window.dispatchEvent(new Event('domodomo_memory_updated'));
    } catch (e) {
      console.error('Failed to save user identity:', e);
    }
  },

  async getUserIdentity(): Promise<UserIdentity | null> {
    try {
      const db = await openDB();
      const tx = db.transaction('user_profile', 'readonly');
      const store = tx.objectStore('user_profile');
      return await new Promise((resolve, reject) => {
        const req = store.get('user_identity');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  async clearIdentity(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction('user_profile', 'readwrite');
      const store = tx.objectStore('user_profile');
      await new Promise<void>((resolve, reject) => {
        const req = store.delete('user_identity');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      window.dispatchEvent(new Event('domodomo_memory_updated'));
    } catch (e) {
      console.error('Failed to clear user identity:', e);
    }
  },

  // --- RAG & DOCUMENT KNOWLEDGE VAULT ---
  async addKnowledge(text: string, source: string, category?: string, onProgress?: (msg: string, progress: number) => void): Promise<void> {
    try {
      onProgress?.('Extracting knowledge chunks...', 10);
      const chunks = chunkText(text);
      if (chunks.length === 0) return;

      onProgress?.('Initializing Local Embedding Pipeline...', 20);
      await aiService.initEmbedder();

      const db = await openDB();

      // Clear existing chunks from this source to avoid duplicates
      await this.deleteKnowledge(source);

      let completed = 0;
      for (const textChunk of chunks) {
        onProgress?.(`Encoding chunk ${completed + 1}/${chunks.length}...`, Math.round(20 + (completed / chunks.length) * 80));
        
        const embedding = await aiService.getEmbedding(textChunk);
        
        const tx = db.transaction('knowledge_chunks', 'readwrite');
        const store = tx.objectStore('knowledge_chunks');
        
        const chunk: KnowledgeChunk = {
          text: textChunk,
          embedding,
          metadata: {
            source,
            timestamp: new Date().toISOString(),
            category
          }
        };

        await new Promise<void>((resolve, reject) => {
          const req = store.add(chunk);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });

        completed++;
      }

      invalidateChunksCache();
      onProgress?.('Knowledge base updated successfully.', 100);
      window.dispatchEvent(new Event('domodomo_memory_updated'));
    } catch (e) {
      console.error('Failed to add knowledge to RAG store:', e);
      throw e;
    }
  },

  async searchKnowledge(queryText: string, limit = 4): Promise<Array<{ text: string; score: number; source: string }>> {
    try {
      const queryEmbedding = await aiService.getEmbedding(queryText);

      const allChunks = await getCachedChunks();

      const scored = allChunks.map(chunk => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        return {
          text: chunk.text,
          score,
          source: chunk.metadata.source
        };
      });

      // Filter similarity above 0.35 and sort descending
      return scored
        .filter(item => item.score > 0.35)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (e) {
      console.warn('Failed similarity searching in Local RAG:', e);
      return [];
    }
  },

  async deleteKnowledge(source: string): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction('knowledge_chunks', 'readwrite');
      const store = tx.objectStore('knowledge_chunks');
      
      const allChunks = await getCachedChunks();

      const targets = allChunks.filter(c => c.metadata.source === source);
      for (const item of targets) {
        if (item.id) {
          store.delete(item.id);
        }
      }
      invalidateChunksCache();
      window.dispatchEvent(new Event('domodomo_memory_updated'));
    } catch (e) {
      console.error('Failed to delete knowledge source:', e);
    }
  },

  async getAllSources(): Promise<string[]> {
    try {
      const allChunks = await getCachedChunks();
      const sources = allChunks.map(c => c.metadata.source);
      return Array.from(new Set(sources));
    } catch {
      return [];
    }
  },

  async getAllChunks(): Promise<KnowledgeChunk[]> {
    try {
      return await getCachedChunks();
    } catch {
      return [];
    }
  },

  async getRecallContext(userPrompt: string, _category = 'general'): Promise<string> {
    try {
      // 0. Fetch user identity
      const identity = await this.getUserIdentity();

      // 1. Fetch relevant chunks from Vault
      const ragResults = await this.searchKnowledge(userPrompt, 3);
      
      // 2. Fetch user profile summary
      const profile = await this.getProfileSummary();

      // 3. Fetch recent habits
      const habits = await this.getRecentActions(5);

      let contextStr = `\n[LOCAL COGNITIVE RECALL MEMORY]\nYou have access to the user's localized memory cache. Treat this like your human intuition. Recite details naturally if queried.`;

      if (identity) {
        contextStr += `\n- User Persona Context:\n  * Name: ${identity.name}\n  * Role: ${identity.role}\n  * Experience Level: ${identity.experience || 'Intermediate'}\n  * Primary Tech Stack: ${identity.techStack || 'None Specified'}\n  * Hardware Specs Tier: ${identity.hardwareTier || 'Standard'}\n  * Goals: ${identity.goals.join(', ')}\n  * Requested Tone: ${identity.tone} (Adopt this style in your replies)`;
      }

      if (profile) {
        contextStr += `\n- User Habits Profile: "${profile.profileSummary}"`;
      }

      if (habits.length > 0) {
        const recentActions = habits
          .map(h => `- Recent action: ${h.action} (${h.detail || ''}) at ${new Date(h.timestamp).toLocaleTimeString()}`)
          .join('\n');
        contextStr += `\n- Recent User Timeline:\n${recentActions}`;
      }

      if (ragResults.length > 0) {
        const docs = ragResults
          .map(r => `[Source: ${r.source} (Similarity: ${Math.round(r.score * 100)}%)]\n${r.text}`)
          .join('\n\n');
        contextStr += `\n- Relevant Local Knowledge Docs:\n${docs}`;
      }

      return contextStr;
    } catch {
      return '';
    }
  }
};
