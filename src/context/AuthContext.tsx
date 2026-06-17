import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, register, updateCredentials as apiUpdateCredentials } from "@/integration/authIntegration";

type AuthContextData = {
  isAuthenticated: boolean;
  user: string | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateCredentials: (username: string, password: string) => Promise<boolean>;
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
      await register(username, password);
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
    ]);
  }

  async function updateCredentials(username: string, password: string): Promise<boolean> {
    try {
      await apiUpdateCredentials(username, password);
      const displayName = username.trim();
      setUser(displayName);
      await AsyncStorage.setItem("@Auth:user", displayName);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, userId, isLoading, signIn, signUp, signOut, updateCredentials }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
