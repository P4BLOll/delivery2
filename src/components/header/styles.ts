import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";

export const Styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  rightSpacer: {
    width: 36, 
  },
});