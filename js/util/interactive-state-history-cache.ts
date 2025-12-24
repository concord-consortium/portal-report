import { camelizeKeys } from "../core/transform-json-response";
import { getFirestore } from "../db";

export class InteractiveStateHistoryCache {
  private smallCache: Map<string, any>;
  private largeCache: Map<string, any>;

  private maxSmallCacheItemsSize = 100; // max 100 items in small cache

  private largeCacheThreshold = 50 * 1024; // 50 KB
  private maxLargeCacheItemsSize = 10; // max 10 items in large cache

  constructor() {
    this.smallCache = new Map<string, any>();
    this.largeCache = new Map<string, any>();
  }

  get(sourceKey: string, id: string, callback: (error: string|null, data: any) => void): void {
    const state = this.smallCache.get(id) ?? this.largeCache.get(id);
    if (!state) {
      getFirestore().then(db => {
        const path = `sources/${sourceKey}/interactive_state_history_states`;

        db.collection(path).doc(id).get().then(snapshot => {
          if (!snapshot.exists) {
            callback("Not found in Firestore", null);
            return;
          }

          const data = snapshot.data();
          if (data) {
            const processedData = camelizeKeys(data);
            this.set(id, processedData);
            callback(null, processedData);
          } else {
            callback("No state data in Firestore document", null);
          }
        }).catch(error => {
          console.error("Error fetching interactive state history from Firestore:", error);
          callback("Error fetching from Firestore", null);
        });
      });
    } else {
      callback(null, state);
    }
  }

  set(id: string, data: any): void {
    const size = JSON.stringify(data).length;
    if (size > this.largeCacheThreshold) {
      this.evictIfNeeded(this.largeCache, this.maxLargeCacheItemsSize);
      this.largeCache.set(id, data);
      this.smallCache.delete(id);
    } else {
      this.evictIfNeeded(this.smallCache, this.maxSmallCacheItemsSize);
      this.smallCache.set(id, data);
      this.largeCache.delete(id);
    }
  }

  private evictIfNeeded(cache: Map<string, any>, maxSize: number): void {
    while (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
  }
}


// singleton instance
export const interactiveStateHistoryCache = new InteractiveStateHistoryCache();
