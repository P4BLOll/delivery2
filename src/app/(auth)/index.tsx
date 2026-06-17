import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/Colors";

type Mode = "login" | "register";

export default function Index() {
    const [mode, setMode] = useState<Mode>("login");
    const [name, setName] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(false);

    const { signIn, signUp } = useAuth();

    function resetForm() {
        setName("");
        setSenha("");
        setErro(null);
    }

    function toggleMode() {
        resetForm();
        setMode((prev) => (prev === "login" ? "register" : "login"));
    }

    async function handleSubmit() {
        if (!name.trim() || !senha.trim()) {
            setErro("Preencha todos os campos.");
            return;
        }

        setCarregando(true);
        setErro(null);

        try {
            if (mode === "login") {
                const success = await signIn(name.trim(), senha);
                if (success) {
                    router.replace("/pokedex");
                } else {
                    setErro("Usuário ou senha incorretos.");
                }
            } else {
                const success = await signUp(name.trim(), senha);
                if (success) {
                    setErro(null);
                    resetForm();
                    setMode("login");
                } else {
                    setErro("Não foi possível criar a conta. Tente novamente.");
                }
            }
        } catch {
            setErro("Erro inesperado. Verifique sua conexão.");
        } finally {
            setCarregando(false);
        }
    }

    const isLogin = mode === "login";

    return (
        <View style={styles.container}>
            <Card>
                <Text style={styles.title}>
                    {isLogin ? "Seja Bem-Vindo!" : "Criar Conta"}
                </Text>
                <Text style={styles.subtitle}>
                    {isLogin
                        ? "Faça login para continuar"
                        : "Preencha os dados para se registrar"}
                </Text>

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

                    {erro && <Text style={styles.error}>{erro}</Text>}

                    <Button
                        title={isLogin ? "Entrar" : "Cadastrar"}
                        onPress={handleSubmit}
                        isLoading={carregando}
                    />

                    <TouchableOpacity onPress={toggleMode} style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>
                            {isLogin
                                ? "Não tem conta? "
                                : "Já tem conta? "}
                            <Text style={styles.toggleLink}>
                                {isLogin ? "Cadastre-se" : "Faça login"}
                            </Text>
                        </Text>
                    </TouchableOpacity>
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
        backgroundColor: COLORS.background,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
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
    toggleContainer: {
        marginTop: 4,
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textAlign: "center",
    },
    toggleLink: {
        color: "#FF3333",
        fontWeight: "bold",
    },
});
