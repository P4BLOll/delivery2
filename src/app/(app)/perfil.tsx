import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/Colors";
import { Menu } from "@/components/menu";
import { Header } from "@/components/header";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { getTrainerStats, TrainerStats } from "@/integration/authIntegration";

export default function Perfil() {
  const { user, userId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Campos formulário de edição de credenciais
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadStats() {
      if (!userId) return;
      try {
        const data = await getTrainerStats(userId);
        setStats(data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [userId]);

  function handleStartEdit() {
    setNewUsername(user ?? "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
  }


  return (
    <View style={styles.container}>
      <Header title="Perfil do Treinador" onMenuPress={() => setMenuOpen(true)} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF3333" />
        </View>
      ) : (
        <View style={styles.profileContainer}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarLargeText}>
              {user ? user.substring(0, 2).toUpperCase() : "TR"}
            </Text>
          </View>

          <Text style={styles.welcomeLabel}>Bem-vindo de volta,</Text>
          <Text style={styles.trainerName}>{user || "Treinador"}</Text>

          {/* Stats — sempre somente leitura */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Nível do Treinador</Text>
              <Text style={styles.infoValue}>Lv. {stats?.level || "1"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Vitórias</Text>
              <Text style={[styles.infoValue, { color: "#00FF66" }]}>
                {stats?.vitorias || "0"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Derrotas</Text>
              <Text style={[styles.infoValue, { color: "#FF3333" }]}>
                {stats?.derrotas || "0"}
              </Text>
            </View>
          </View>
        </View>
      )}

      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
    gap: 16,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1A1A1E",
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: -8,
  },
  trainerName: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginTop: -8,
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
  editButton: {
    width: "100%",
    backgroundColor: "#FF3333",
    shadowColor: "#FF3333",
  },
  editBox: {
    width: "100%",
    backgroundColor: "#1A1A1E",
    borderRadius: 12,
    padding: 20,
    gap: 14,
  },
  editTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  editField: {
    gap: 6,
  },
  editLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  editActions: {
    gap: 10,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#16A34A",
    shadowColor: "#16A34A",
  },
  cancelButton: {
    backgroundColor: "#3F3F46",
    shadowColor: "transparent",
  },
});
