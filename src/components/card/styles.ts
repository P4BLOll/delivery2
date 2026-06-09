import { StyleSheet } from "react-native";

export const Styles = StyleSheet.create({
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#1A1A1E", // Mudado para cinza escuro premium alinhado ao app
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 28,

        alignItems: "center",
        justifyContent: "center",

        // Sombra sutil para dar profundidade no fundo escuro, sem usar bordas lineares
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
});