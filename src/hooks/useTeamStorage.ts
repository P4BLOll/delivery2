import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pokemon } from "@/@types/pokemon";

const STORAGE_TEAM_KEY = "@PokeApp:team";
const STORAGE_BENCH_KEY = "@PokeApp:bench";

export interface TeamStorage {
  team: (Pokemon | null)[];
  bench: Pokemon[];
}
export const loadTeamFromStorage = async (
  maxSize: number
): Promise<TeamStorage | null> => {
  const [rawTeam, rawBench] = await Promise.all([
    AsyncStorage.getItem(STORAGE_TEAM_KEY),
    AsyncStorage.getItem(STORAGE_BENCH_KEY),
  ]);

  if (!rawTeam && !rawBench) return null;

  const team: (Pokemon | null)[] = rawTeam
    ? Array(maxSize)
        .fill(null)
        .map((_, i) => (JSON.parse(rawTeam) as (Pokemon | null)[])[i] ?? null)
    : Array(maxSize).fill(null);

  const bench: Pokemon[] = rawBench ? JSON.parse(rawBench) : [];

  return { team, bench };
};

 
export const saveTeamToStorage = async (
  team: (Pokemon | null)[],
  bench: Pokemon[]
): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(team)),
    AsyncStorage.setItem(STORAGE_BENCH_KEY, JSON.stringify(bench)),
  ]).catch(() => {});
};

export function useTeamStorage() {
  const persist = useCallback(
    (team: (Pokemon | null)[], bench: Pokemon[]) =>
      saveTeamToStorage(team, bench),
    []
  );

  return { persist, loadTeamFromStorage, saveTeamToStorage };
}
