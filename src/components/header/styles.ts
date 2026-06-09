import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";

export const Styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    backgroundColor: "transparent", // Fundo flutuante premium integrado ao app
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  rightSpacer: {
    width: 36, // Largura exata da PokeballButton (36) para garantir que o título fique perfeitamente centralizado
  },
});