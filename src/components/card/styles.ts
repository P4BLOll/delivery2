import { StyleSheet } from "react-native";

export const Styles = StyleSheet.create({
    card: {
        width: "100%",
        maxWidth: 400,
        minHeight: 500,

        backgroundColor: "#cecece",
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 28,

        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
    },
});