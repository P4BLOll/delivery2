import { View, Text, StyleSheet } from "react-native";
import { Card } from "@/components/card";

export default function Dashboard() {
    return (
        <View style={styles.container}>
            <Card>
                <Text style={styles.title}>Dashboard</Text>

                <Text style={styles.subtitle}>
                    Você entrou com sucesso.
                </Text>

                <Text style={styles.description}>
                    Essa é a tela principal do sistema.
                </Text>
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
        fontSize: 32,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 12,
    },

    subtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0e7917",
        marginBottom: 8,
        textAlign: "center",
    },

    description: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
    },
});