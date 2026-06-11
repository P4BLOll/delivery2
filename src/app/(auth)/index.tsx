// src/app/(auth)/index.tsx
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { useAuth } from '@/context/AuthContext';
import { COLORS } from "@/constants/Colors";

export default function Index() {
    const [name, setName] = useState("");
    const [senha, setSenha] = useState("");
    const [loginErrado, setLoginErrado] = useState(false);
    const [carregando, setCarregando] = useState(false); // Estado para controlar o feedback de loading

    const { signIn } = useAuth();

    async function verificarLogin() {
        if (!name.trim() || !senha.trim()) {
            setLoginErrado(true);
            return;
        }

        setCarregando(true);
        setLoginErrado(false); // Reseta o erro a cada nova tentativa

        try {
            const success = await signIn(name, senha);
            
            if (success) {
                router.replace('/pokedex');
            } else {
                setLoginErrado(true);
            }
        } catch (error) {
            console.error("Erro ao autenticar", error);
            setLoginErrado(true);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <View style={styles.container}>
            <Card>
                <Text style={styles.title}>Seja Bem-Vindo!</Text>
                <Text style={styles.subtitle}>Faça login para continuar</Text>

                <View style={styles.form}>
                    <Input 
                        placeholder="Usuário" 
                        value={name} 
                        onChangeText={setName} 
                        autoCapitalize="none"
                    />
                    <Input 
                        placeholder="Senha" 
                        value={senha} 
                        onChangeText={setSenha} 
                        secureTextEntry 
                        autoCapitalize="none"
                    />

                    {loginErrado && (
                        <Text style={styles.error}>Usuário ou senha incorretos.</Text>
                    )}

                    {/* Passando a prop isLoading nativa do seu componente Button */}
                    <Button 
                        title="Entrar" 
                        onPress={verificarLogin} 
                        isLoading={carregando} 
                    />
                </View>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background, // Fundo escuro oficial
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF", // Corrigido para branco
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textSecondary, // Corrigido para cinza claro
        marginBottom: 24,
        textAlign: "center",
    },
    form: {
        alignItems: "center",
        width: "100%",
        gap: 12,
    },
    error: {
        color: "#DC2626",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
});