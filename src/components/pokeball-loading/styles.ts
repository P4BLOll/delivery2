import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
});
