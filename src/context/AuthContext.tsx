// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BACKEND } from "@/integration/databaseIntegration";

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
                AsyncStorage.getItem("@Auth:userId")
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

    // Endpoint: Login (POST)
    async function signIn(username: string, password: string): Promise<boolean> {
        try {
            const response = await API_BACKEND.post("/auth/v1/login", {
                username,
                password,
            });

            // Nota: Altere de acordo com a estrutura exata do seu retorno (ex: response.data.id ou response.data.userId)
            const idUsuario = response.data.id || response.data.userId || "65888ffb-ed2a-4446-89c7-31723970c612";
            const displayName = username.trim();

            setUser(displayName);
            setUserId(idUsuario);
            setIsAuthenticated(true);

            await AsyncStorage.multiSet([
                ["@Auth:user", displayName],
                ["@Auth:userId", idUsuario]
            ]);

            return true;
        } catch (error) {
            console.error("Erro no login:", error);
            return false;
        }
    }

    // Endpoint: Registrar (POST)
    async function signUp(username: string, password: string): Promise<boolean> {
        try {
            await API_BACKEND.post("/auth/v1/register", {
                username,
                password,
            });
            return true;
        } catch (error) {
            console.error("Erro no registro:", error);
            return false;
        }
    }

    async function signOut() {
        setUser(null);
        setUserId(null);
        setIsAuthenticated(false);
        await AsyncStorage.multiRemove(['@Auth:user', '@Auth:userId', '@PokeApp:team', '@PokeApp:acquired']);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, userId, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>    
    );
};

export const useAuth = () => useContext(AuthContext);