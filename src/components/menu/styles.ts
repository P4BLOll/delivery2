import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";

export const Styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        flexDirection: "row",
    },
    clickableOverlay: {
        flex: 0.3,
    },
    menuContainer: {
        flex: 0.7,
        backgroundColor: "#0F0F12",
        paddingTop: 60,
        paddingHorizontal: 20,
        justifyContent: "space-between",
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 32,
        gap: 14,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FF3333",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#FF3333",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
    },
    userInfo: {
        flex: 1,
        justifyContent: "center",
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    username: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "bold",
        textTransform: "capitalize",
    },
    navLinks: {
        flex: 1,
        marginTop: 16,
        gap: 12,
    },
    linkItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#16161A",
        gap: 12,
    },
    linkText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    logoutButton: {
        backgroundColor: "#DC2626", // Mantém a cor de alerta vermelha escura específica para a ação de sair
        shadowColor: "#DC2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
});