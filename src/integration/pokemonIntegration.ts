// pokemonIntegration.ts

import axios from "axios";
import { Pokemon } from "@/@types/pokemon";

const API_URL = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
});

// Busca a lista completa (mantida para outros usos)
export const getPokemon = async (limit = 1025): Promise<Pokemon[]> => {
  const response = await API_URL.get(`/pokemon?limit=${limit}`);
  const list = response.data.results;
  const detailedList = await Promise.all(
    list.map(async (pokemon: { url: string }) => {
      const detailRes = await axios.get(pokemon.url);
      return mapPokemon(detailRes.data);
    }),
  );
  return detailedList;
};

// Busca um único pokémon pelo ID — use essa no sorteio
export const getPokemonById = async (id: number): Promise<Pokemon> => {
  const response = await API_URL.get(`/pokemon/${id}`);
  return mapPokemon(response.data);
};

// Evita repetir o mapeamento nos dois lugares
const mapPokemon = (data: any): Pokemon => ({
  nome: data.name,
  index: data.id.toString().padStart(3, "0"),
  tipos: data.types.map((t: any) => t.type.name),
  imagem: data.sprites.front_default,
  poderes: data.stats.map((s: any) => ({
    nome: s.stat.name,
    forca: s.base_stat,
  })),
});
