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

    const { signIn, signOut } = useAuth();

    function verificarLogin() {
        const success = signIn(name, senha);
        if (success) {
            router.replace('/pokedex');
        } else {
            setLoginErrado(true);
            return signOut();
        }
    }

    return (
        <View style={styles.container}>
            <Card>
                <Text style={styles.title}>Seja Bem-Vindo!</Text>
                <Text style={styles.subtitle}>Faça login para continuar</Text>

                <View style={styles.form}>
                    <Input placeholder="Usuário" value={name} onChangeText={setName} />
                    <Input placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

                    {loginErrado && (
                        <Text style={styles.error}>Usuário ou senha incorretos.</Text>
                    )}

                    <Button title="Entrar" onPress={verificarLogin} />
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