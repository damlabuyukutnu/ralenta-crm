import { useSyncExternalStore } from "react";
import { DEFAULT_TEAM_MEMBER_ID, TEAM_MEMBERS, getTeamMember } from "@/lib/data/team";
import type { TeamMember } from "@/lib/types/crm";

const STORAGE_KEY = "ralenta-crm:current-user";

let cache: string | null = null;
let listeners: Array<() => void> = [];

function readCurrentUserId(): string {
  if (typeof window === "undefined") {
    return DEFAULT_TEAM_MEMBER_ID;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && getTeamMember(stored)) {
    return stored;
  }

  return DEFAULT_TEAM_MEMBER_ID;
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((existing) => existing !== listener);
  };
}

function getSnapshot(): string {
  if (cache === null) {
    cache = readCurrentUserId();
  }
  return cache;
}

function getServerSnapshot(): string {
  return DEFAULT_TEAM_MEMBER_ID;
}

export function setCurrentUserId(id: string) {
  cache = id;
  window.localStorage.setItem(STORAGE_KEY, id);
  listeners.forEach((listener) => listener());
}

export function useCurrentUser(): TeamMember {
  const id = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return getTeamMember(id) ?? TEAM_MEMBERS[0];
}
