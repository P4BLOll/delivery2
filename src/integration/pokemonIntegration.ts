import axios from "axios";
import { API_BACKEND } from "./authIntegration";
import { Pokemon } from "@/@types/pokemon";

const POKEAPI_URL = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
});

const MAX_BACKEND_TEAM_SIZE = 5;

// Busca a lista completa de pokémons da PokéAPI.
export const getPokemon = async (limit = 1025): Promise<Pokemon[]> => {
  const response = await POKEAPI_URL.get(`/pokemon?limit=${limit}`);
  const list = response.data.results;
  return await Promise.all(
    list.map(async (pokemon: { url: string }) => {
      const detailRes = await axios.get(pokemon.url);
      return mapPokemon(detailRes.data);
    })
  );
};

// Busca um pokémon pelo id ou nome na PokéAPI
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

// Mapeia o objeto retornado pelo backend para o tipo Pokemon do app
const mapBackendPokemon = (data: any): Pokemon | null => {
  if (!data) return null;
  return {
    index: String(data.index ?? data.id ?? ""),
    nome: data.name ?? data.nome ?? "",
    imagem: data.image ?? data.imagem ?? data.sprites?.front_default ?? "",
    tipos: Array.isArray(data.types)
      ? data.types.map((t: any) => (typeof t === "string" ? t : t.type?.name ?? t.name ?? t))
      : Array.isArray(data.tipos)
      ? data.tipos
      : [],
    poderes: Array.isArray(data.abilities)
      ? data.abilities.map((a: any) => ({ nome: a.name ?? a.nome ?? "", forca: a.strength ?? a.forca ?? 0 }))
      : Array.isArray(data.poderes)
      ? data.poderes
      : [],
  };
};

// Busca o time e capturados em uma única chamada ao backend
export const getTeamAndCaptured = async (
  userId: string
): Promise<{ team: (Pokemon | null)[]; captured: Pokemon[] }> => {
  const response = await API_BACKEND.get(`/pokemon/v1/team`, {
    params: { "user-id": userId },
  });

  const raw = response.data;

  const teamList: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.team)
    ? raw.team
    : Array.isArray(raw?.pokemons)
    ? raw.pokemons
    : [];

  const capturedList: any[] = Array.isArray(raw?.capture)
    ? raw.capture
    : Array.isArray(raw?.captured)
    ? raw.captured
    : [];

  const team = Array(MAX_BACKEND_TEAM_SIZE)
    .fill(null)
    .map((_, i) => mapBackendPokemon(teamList[i] ?? null));

  const captured = capturedList
    .map(mapBackendPokemon)
    .filter((p): p is Pokemon => p !== null && p.index !== "");

  return { team, captured };
};

// retorna o time do treinador 
export const getBackendTeam = async (
  userId: string
): Promise<(Pokemon | null)[]> => {
  const { team } = await getTeamAndCaptured(userId);
  return team;
};

// Retorna os pokémons capturados (adquiridos) do treinador que não estão no time
export const getCapturedPokemons = async (userId: string): Promise<Pokemon[]> => {
  try {
    const { captured } = await getTeamAndCaptured(userId);
    return captured;
  } catch {
    return [];
  }
};

// Atualiza o time via swap: troca removedPokemon por newPokemon.
// O backend espera o user-id como query param e os pokémons no corpo
// da requisição (TeamUpdateRequest). Enviar como query params resulta
// em 400 "Required request body is missing".
export const updateBackendTeam = async (
  userId: string,
  removedPokemon: string,
  newPokemon: string
): Promise<void> => {
  await API_BACKEND.put(
    `/pokemon/v1/team`,
    { removedPokemon, newPokemon },
    {
      params: { "user-id": userId },
    },
  );
};

// Adiciona um pokémon capturado
export const addCapturedPokemon = async (
  userId: string,
  pokemonId: string | number
): Promise<void> => {
  await API_BACKEND.put(`/pokemon/v1/captured`, null, {
    params: {
      "user-id": userId,
      "pokemon-id": pokemonId,
    },
  });
};

// Remove um pokémon capturado
export const deleteCapturedPokemon = async (
  userId: string,
  pokemonId: string | number
): Promise<void> => {
  await API_BACKEND.delete(`/pokemon/v1/captured`, {
    params: {
      "user-id": userId,
      "pokemon-id": pokemonId,
    },
  });
};
