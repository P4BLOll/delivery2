import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, register } from "@/integration/authIntegration";
import { getPokemonById, updateBackendTeam, addCapturedPokemon } from "@/integration/pokemonIntegration";
import { Pokemon } from "@/@types/pokemon";

type AuthContextData = {
  isAuthenticated: boolean;
  user: string | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const [storageUser, storageId] = await Promise.all([
        AsyncStorage.getItem("@Auth:user"),
        AsyncStorage.getItem("@Auth:userId"),
      ]);
      if (storageUser && storageId) {
        setUser(storageUser);
        setUserId(storageId);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
    loadStorageData();
  }, []);

  async function signIn(username: string, password: string): Promise<boolean> {
    try {
      const data = await login(username, password);
      const idUsuario = data.id ?? data.userId ?? "";
      const displayName = username.trim();
      setUser(displayName);
      setUserId(idUsuario);
      setIsAuthenticated(true);
      await AsyncStorage.multiSet([
        ["@Auth:user", displayName],
        ["@Auth:userId", idUsuario],
      ]);
      return true;
    } catch {
      return false;
    }
  }

  async function signUp(username: string, password: string): Promise<boolean> {
    try {
      // 1. Cria a conta no backend
      await register(username, password);

      // 2. Faz o login imediato em background para capturar o ID do novo usuário
      const loginData = await login(username, password);
      const generatedId = loginData.id ?? loginData.userId ?? "";

      if (generatedId) {
        const autoTeam: Pokemon[] = [];

        // Gera 5 Pokémon iniciais sem repetição
        while (autoTeam.length < 5) {
          const randomId = Math.floor(Math.random() * 151) + 1; // Sorteia da geração clássica para balanceamento inicial
          try {
            const pokemon = await getPokemonById(randomId);
            if (!autoTeam.some((p) => p.index === pokemon.index)) {
              autoTeam.push(pokemon);
            }
          } catch (e) {
            // Ignora falhas da API externa e continua tentando
          }
        }

        // 3. Salva no banco de dados e localmente no AsyncStorage
        for (const pokemon of autoTeam) {
          await addCapturedPokemon(generatedId, pokemon.index).catch(() => {});
          await updateBackendTeam(generatedId, "0", pokemon.index).catch(() => {});
        }

        await AsyncStorage.setItem("@PokeApp:team", JSON.stringify(autoTeam));
        await AsyncStorage.setItem("@PokeApp:bench", JSON.stringify([]));
      }

      return true;
    } catch {
      return false;
    }
  }

  async function signOut(): Promise<void> {
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);
    await AsyncStorage.multiRemove([
      "@Auth:user",
      "@Auth:userId",
      "@PokeApp:team",
      "@PokeApp:bench"
    ]);
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, userId, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);