import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/Colors";
import { Menu } from "@/components/menu";

// IMPORTAÇÃO DA NAVBAR MODULAR
import { Header } from "@/components/header";

export default function Perfil() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Chamada Limpa da Navbar */}
      <Header
        title="Perfil do Treinador"
        onMenuPress={() => setMenuOpen(true)}
      />

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarLargeText}>
            {user ? user.substring(0, 2).toUpperCase() : "TR"}
          </Text>
        </View>

        <Text style={styles.welcomeLabel}>Bem-vindo de volta,</Text>
        <Text style={styles.trainerName}>{user || "Treinador"}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Classe</Text>
            <Text style={styles.infoValue}>Mestre Pokémon</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Região</Text>
            <Text style={styles.infoValue}>Kanto</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Status</Text>
            <Text style={[styles.infoValue, { color: "#00FF66" }]}>Online</Text>
          </View>
        </View>
      </View>

      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1A1A1E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#FF3333",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarLargeText: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "900",
  },
  welcomeLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  trainerName: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 32,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#1A1A1E",
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoKey: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
  },
});
