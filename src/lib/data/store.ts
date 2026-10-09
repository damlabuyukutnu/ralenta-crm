import { useSyncExternalStore } from "react";
import type { CrmDatabase } from "@/lib/types/crm";
import { createSeedDatabase } from "@/lib/data/seed-data";

const STORAGE_KEY = "ralenta-crm:data";

let cache: CrmDatabase | null = null;
let serverSnapshot: CrmDatabase | null = null;
let listeners: Array<() => void> = [];

function readFromStorage(): CrmDatabase {
  if (typeof window === "undefined") {
    return createSeedDatabase();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = createSeedDatabase();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw) as CrmDatabase;
  } catch {
    const seeded = createSeedDatabase();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeToStorage(database: CrmDatabase) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((existing) => existing !== listener);
  };
}

export function getSnapshot(): CrmDatabase {
  if (cache === null) {
    cache = readFromStorage();
  }
  return cache;
}

export function getServerSnapshot(): CrmDatabase {
  if (serverSnapshot === null) {
    serverSnapshot = createSeedDatabase();
  }
  return serverSnapshot;
}

export function mutate(updater: (database: CrmDatabase) => CrmDatabase) {
  const next = updater(getSnapshot());
  cache = next;
  writeToStorage(next);
  notifyListeners();
}

export function resetToSeedData() {
  const seeded = createSeedDatabase();
  cache = seeded;
  writeToStorage(seeded);
  notifyListeners();
}

export function useCrmDatabase(): CrmDatabase {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
