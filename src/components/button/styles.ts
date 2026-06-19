import { StyleSheet } from "react-native";

export const Styles = StyleSheet.create({
    button: {
        width: "100%",
        height: 52,
        backgroundColor: "#FF3333",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        
        shadowColor: "#FF3333",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: "#4E4E5A",
        shadowOpacity: 0,
        elevation: 0,
    }
});