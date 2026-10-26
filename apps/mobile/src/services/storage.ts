import AsyncStorage from '@react-native-async-storage/async-storage';

// High-speed in-memory store fallback to guarantee 0 crashes if native bridge is unlinked
const inMemoryCache = new Map<string, string>();

export const SafeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const value = await AsyncStorage.getItem(key);
        if (value !== null && value !== undefined) {
          inMemoryCache.set(key, value);
          return value;
        }
      }
    } catch (err) {
      // Suppress unhandled rejection if native module is null on certain Expo Go environments
    }
    return inMemoryCache.get(key) || null;
  },

  async setItem(key: string, value: string): Promise<void> {
    inMemoryCache.set(key, value);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      }
    } catch (err) {
      // Suppress native error; memory cache preserves session
    }
  },

  async removeItem(key: string): Promise<void> {
    inMemoryCache.delete(key);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch (err) {
      // Suppress native error
    }
  },

  async clear(): Promise<void> {
    inMemoryCache.clear();
    try {
      if (AsyncStorage && typeof AsyncStorage.clear === 'function') {
        await AsyncStorage.clear();
      }
    } catch (err) {
      // Suppress native error
    }
  },
};
