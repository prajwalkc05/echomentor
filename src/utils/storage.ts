// User-scoped localStorage — all keys are prefixed with userId
// so different users never see each other's data

// WARNING: Always use this storage utility instead of localStorage directly
// to prevent users from seeing each other's data!

const getUserId = (): string => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return 'guest';
    // Decode JWT payload to get user id (no verification needed client-side)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || payload.sub || 'guest';
  } catch {
    return 'guest';
  }
};

export const storage = {
  get(key: string): string | null {
    return localStorage.getItem(`${getUserId()}_${key}`);
  },
  set(key: string, value: string): void {
    localStorage.setItem(`${getUserId()}_${key}`, value);
  },
  remove(key: string): void {
    localStorage.removeItem(`${getUserId()}_${key}`);
  },
  getJSON<T>(key: string): T | null {
    try {
      const val = this.get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  setJSON(key: string, value: unknown): void {
    this.set(key, JSON.stringify(value));
  },
  // Clear all keys belonging to a specific user
  clearUser(userId: string): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${userId}_`)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },
};

// Helper to warn developers about direct localStorage usage
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  const originalRemoveItem = localStorage.removeItem;
  
  // Override localStorage methods with completely secure logging (no user input in logs)
  localStorage.setItem = function(key: string, value: string) {
    if (key !== 'authToken' && !key.includes('_')) {
      // Completely secure logging - no user input included
      console.warn('[STORAGE SECURITY WARNING]');
      console.warn('Direct localStorage.setItem() usage detected');
      console.warn('This bypasses user data isolation and may cause privacy issues');
      console.warn('Solution: Use storage.set() instead of localStorage.setItem()');
      console.warn('Documentation: See USER_DATA_PRIVACY.md for details');
    }
    return originalSetItem.call(this, key, value);
  };
  
  localStorage.getItem = function(key: string) {
    if (key !== 'authToken' && !key.includes('_')) {
      console.warn('[STORAGE SECURITY WARNING]');
      console.warn('Direct localStorage.getItem() usage detected');
      console.warn('This bypasses user data isolation and may cause privacy issues');
      console.warn('Solution: Use storage.get() instead of localStorage.getItem()');
      console.warn('Documentation: See USER_DATA_PRIVACY.md for details');
    }
    return originalGetItem.call(this, key);
  };
  
  localStorage.removeItem = function(key: string) {
    if (key !== 'authToken' && !key.includes('_')) {
      console.warn('[STORAGE SECURITY WARNING]');
      console.warn('Direct localStorage.removeItem() usage detected');
      console.warn('This bypasses user data isolation and may cause privacy issues');
      console.warn('Solution: Use storage.remove() instead of localStorage.removeItem()');
      console.warn('Documentation: See USER_DATA_PRIVACY.md for details');
    }
    return originalRemoveItem.call(this, key);
  };
}
