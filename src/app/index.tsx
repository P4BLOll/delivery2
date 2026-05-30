import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";

export default function Index() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [loginErrado, setLoginErrado] = useState(false);

    function verificarLogin() {
        const loginCorreto = usuario === "Neyma" && senha === "123";

        setLoginErrado(!loginCorreto);

        if (loginCorreto) {
            router.push("/pokedex");
        }
    }

    return (
        <View style={styles.container}>
            <Card>
                <Text style={styles.title}>Seja Bem-Vindo!</Text>

                <Text style={styles.subtitle}>
                    Faça login para continuar
                </Text>

                <View style={styles.form}>
                    <Input
                        placeholder="Usuário"
                        value={usuario}
                        onChangeText={setUsuario}
                    />

                    <Input
                        placeholder="Senha"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                    />

                    {loginErrado && (
                        <Text style={styles.error}>
                            Usuário ou senha incorretos.
                        </Text>
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
        backgroundColor: "#363636",
        padding: 24,
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 8,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 16,
        color: "#6B7280",
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