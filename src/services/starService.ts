// Star Service - Hybrid Browser + Server Storage Management
// This is like having a database class in Python that handles both local cache and server sync

import { updateTranslationStar, getTranslationStarCount } from './api';
import type { StarRequest } from '@/types';

/**
 * Service for managing starred translations with hybrid storage:
 * - Browser localStorage: tracks what THIS user has starred (personal state)
 * - Server API: tracks global star counts from ALL users
 * Think of this as your "database layer" with both local cache and server sync
 */
class StarService {
  private readonly STORAGE_KEY = 'form_translator_starred_items';
  private readonly STAR_COUNT_CACHE_KEY = 'form_translator_star_counts';
  
  // Cache for global star counts to avoid excessive API calls
  private starCountCache: Map<string, { count: number; timestamp: number }> = new Map();

  /**
   * Get all starred translation IDs from browser storage
   * Like: starred_items = json.load(file) in Python
   */
  getStarredItems(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading starred items from localStorage:', error);
      return [];
    }
  }

  /**
   * Check if a specific translation is starred
   * Like: return item_id in starred_list in Python
   */
  isStarred(translationId: string): boolean {
    const starredItems = this.getStarredItems();
    return starredItems.includes(translationId);
  }

  /**
   * Add a translation to starred items
   * Like: starred_list.append(item_id) in Python
   */
  addStar(translationId: string): void {
    const starredItems = this.getStarredItems();
    
    // Don't add duplicates
    if (!starredItems.includes(translationId)) {
      starredItems.push(translationId);
      this.saveStarredItems(starredItems);
      console.log(`⭐ Added star for translation: ${translationId}`);
    }
  }

  /**
   * Remove a translation from starred items
   * Like: starred_list.remove(item_id) in Python
   */
  removeStar(translationId: string): void {
    const starredItems = this.getStarredItems();
    const filteredItems = starredItems.filter(id => id !== translationId);
    
    if (filteredItems.length !== starredItems.length) {
      this.saveStarredItems(filteredItems);
      console.log(`⭐ Removed star for translation: ${translationId}`);
    }
  }

  /**
   * Toggle star status for a translation (HYBRID VERSION)
   * This updates both local storage AND server
   * Like: async def toggle_star(item_id) in Python
   */
  async toggleStar(translationId: string): Promise<{ isStarred: boolean; globalCount: number }> {
    const wasStarred = this.isStarred(translationId);
    const action: 'star' | 'unstar' = wasStarred ? 'unstar' : 'star';
    
    try {
      // 1. Update server first (global count)
      const serverResponse = await updateTranslationStar({
        translationId,
        action
      });
      
      // 2. If server update succeeded, update local storage
      // Check for success field, or assume success if we got a valid response with totalStars
      if (serverResponse.success !== false && typeof serverResponse.totalStars === 'number') {
        if (wasStarred) {
          this.removeStar(translationId);
        } else {
          this.addStar(translationId);
        }
        
        // 3. Update cache with new global count
        this.updateStarCountCache(translationId, serverResponse.totalStars);
        
        return {
          isStarred: !wasStarred,
          globalCount: serverResponse.totalStars
        };
      } else {
        throw new Error(serverResponse.message || 'Failed to update star on server');
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
      
      // Fallback: just update locally if server fails
      if (wasStarred) {
        this.removeStar(translationId);
      } else {
        this.addStar(translationId);
      }
      
      // Return local-only result
      return {
        isStarred: !wasStarred,
        globalCount: this.getLocalStarCount(translationId)
      };
    }
  }

  /**
   * Get GLOBAL count of how many users have starred this translation
   * This fetches from server or cache
   */
  async getGlobalStarCount(translationId: string): Promise<number> {
    try {
      // Check cache first (avoid excessive API calls)
      const cached = this.starCountCache.get(translationId);
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return cached.count;
      }
      
      // Fetch from server
      const response = await getTranslationStarCount(translationId);
      this.updateStarCountCache(translationId, response.totalStars);
      
      return response.totalStars;
    } catch (error) {
      console.error('Failed to get global star count:', error);
      // Fallback to local count
      return this.getLocalStarCount(translationId);
    }
  }

  /**
   * Get LOCAL count (just for current user: 0 or 1)
   * This is the old getStarCount method
   */
  getLocalStarCount(translationId: string): number {
    return this.isStarred(translationId) ? 1 : 0;
  }

  /**
   * Get total number of starred items
   * Like: len(starred_list) in Python
   */
  getTotalStarredCount(): number {
    return this.getStarredItems().length;
  }

  /**
   * Clear all starred items (for testing or reset)
   * Like: starred_list.clear() in Python
   */
  clearAllStars(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Cleared all starred items');
  }

  /**
   * Private method to save starred items to localStorage
   * Like: json.dump(starred_list, file) in Python
   */
  private saveStarredItems(starredItems: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(starredItems));
    } catch (error) {
      console.error('Error saving starred items to localStorage:', error);
    }
  }

  /**
   * Update the star count cache for a translation
   * Like: cache[item_id] = {'count': count, 'timestamp': now} in Python
   */
  private updateStarCountCache(translationId: string, count: number): void {
    this.starCountCache.set(translationId, {
      count,
      timestamp: Date.now()
    });
  }

  /**
   * Debug method to see what's in storage
   * Useful for development
   */
  debugPrint(): void {
    const starredItems = this.getStarredItems();
    console.log('🔍 Current starred items:', starredItems);
    console.log('📊 Total starred count:', starredItems.length);
  }
}

// Create and export a singleton instance
// Like having a global database connection in Python
export const starService = new StarService();

// Export the class too in case you need multiple instances
export default StarService;
