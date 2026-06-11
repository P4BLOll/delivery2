import axios from "axios";
import { API_BACKEND } from "./databaseIntegration";
import { Pokemon } from "@/@types/pokemon";

const POKEAPI_URL = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
});

export interface TrainerStats {
  level: string;
  vitorias: string;
  derrotas: string;
}

export const getPokemon = async (limit = 1025): Promise<Pokemon[]> => {
  const response = await POKEAPI_URL.get(`/pokemon?limit=${limit}`);
  const list = response.data.results;
  return await Promise.all(
    list.map(async (pokemon: { url: string }) => {
      const detailRes = await axios.get(pokemon.url);
      return mapPokemon(detailRes.data);
    }),
  );
};

export const getPokemonById = async (id: number | string): Promise<Pokemon> => {
  const response = await POKEAPI_URL.get(`/pokemon/${id}`);
  return mapPokemon(response.data);
};

const mapPokemon = (data: any): Pokemon => ({
  nome: data.name,
  index: data.id.toString(),
  tipos: data.types.map((t: any) => t.type.name),
  imagem: data.sprites.front_default,
  poderes: data.stats.map((s: any) => ({
    nome: s.stat.name,
    forca: s.base_stat,
  })),
});

export const getTrainerStats = async (userId: string): Promise<TrainerStats> => {
  const response = await API_BACKEND.get(`/auth/v1/stats/${userId}`);
  return response.data;
};

export const updateTrainerStats = async (userId: string, stats: TrainerStats): Promise<void> => {
  await API_BACKEND.put(`/auth/v1/stats/${userId}`, stats);
};

export const getBackendTeam = async (userId: string): Promise<(Pokemon | null)[]> => {
  try {
    const response = await API_BACKEND.get(`/pokemon/v1/team?user-id=${userId}`);
    const pokemonList = response.data.pokemons || response.data || [];
    
    const teamPromises = Array(6).fill(null).map(async (_, index) => {
      const pokeData = pokemonList[index];
      if (!pokeData) return null;
      
      const id = pokeData.id || pokeData.pokemonId || pokeData;
      return id ? await getPokemonById(id) : null;
    });

    return await Promise.all(teamPromises);
  } catch (error) {
    console.error("Erro ao buscar time do backend", error);
    return Array(6).fill(null);
  }
};

export const updateBackendTeam = async (
  userId: string, 
  removedPokemonId: string | number, 
  newPokemonId: string | number
): Promise<void> => {
  const removed = removedPokemonId === "0" || removedPokemonId === 0 ? "" : removedPokemonId;
  const added = newPokemonId === "0" || newPokemonId === 0 ? "" : newPokemonId;

  await API_BACKEND.put(`/pokemon/v1/team`, null, {
    params: {
      "user-id": userId,
      "removed-pokemon": removed,
      "new-pokemon": added
    }
  });
};

export const addCapturedPokemon = async (userId: string, pokemonId: string | number): Promise<void> => {
  await API_BACKEND.put(`/pokemon/v1/captured`, null, {
    params: {
      "user-id": userId,
      "pokemon-id": pokemonId
    }
  });
};

export const deleteCapturedPokemon = async (userId: string, pokemonId: string | number): Promise<void> => {
  await API_BACKEND.delete(`/pokemon/v1/captured`, {
    params: {
      "user-id": userId,
      "pokemon-id": pokemonId
    }
  });
};