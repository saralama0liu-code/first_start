export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function isStorageAvailable(storage: StorageLike | undefined): storage is StorageLike {
  if (!storage) {
    return false;
  }

  const testKey = '__quick_ledger_storage_test__';

  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function safeReadJson<T>(storage: StorageLike, key: string, fallback: T): T {
  try {
    const rawValue = storage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function safeWriteJson(storage: StorageLike, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

