import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import {
  getPokemonById,
  getBackendTeam,
  updateBackendTeam,
  addCapturedPokemon,
  deleteCapturedPokemon,
} from "@/integration/pokemonIntegration";
import { useTeamStorage, loadTeamFromStorage } from "@/hooks/useTeamStorage";
import { Pokemon } from "@/@types/pokemon";
import { COLORS } from "@/constants/Colors";
import { Menu } from "@/components/menu";
import { PokemonCard } from "@/components/pokemonCard";
import { Button } from "@/components/button";
import { Header } from "@/components/header";

const MAX_TEAM_SIZE = 5;
const MAX_CAPTURES = 5;

export default function MeuTime() {
  const { userId } = useAuth();
  const { persist } = useTeamStorage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [team, setTeam] = useState<(Pokemon | null)[]>(
    Array(MAX_TEAM_SIZE).fill(null),
  );
  const [bench, setBench] = useState<Pokemon[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      setLoading(true);
      try {
        const cached = await loadTeamFromStorage(MAX_TEAM_SIZE);
        if (cached) {
          setTeam(cached.team);
          setBench(cached.bench);
        }
        const backendTeam = await getBackendTeam(userId);
        const hasData = backendTeam.some((p) => p !== null);
        if (hasData) {
          const normalized = Array(MAX_TEAM_SIZE)
            .fill(null)
            .map((_, i) => backendTeam[i] ?? null);
          setTeam(normalized);
          await persist(normalized, cached?.bench ?? []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const totalCaptured = team.filter(Boolean).length + bench.length;
  const canCapture = totalCaptured < MAX_CAPTURES;

  const handleObtainPokemon = async () => {
    if (rolling || !userId) return;
    if (!canCapture) {
      Alert.alert("Limite atingido!", `Você já tem ${MAX_CAPTURES} Pokémon.`);
      return;
    }
    const slot = team.findIndex((p) => p === null);
    if (slot === -1) {
      Alert.alert("Time Cheio!", "Toque em um Pokémon do time para removê-lo.");
      return;
    }
    setRolling(true);
    try {
      const randomId = Math.floor(Math.random() * 1025) + 1;
      const pokemon = await getPokemonById(randomId);
      const duplicate =
        team.some((p) => p?.index === pokemon.index) ||
        bench.some((p) => p.index === pokemon.index);
      if (duplicate) {
        Alert.alert(
          "Epa!",
          `${pokemon.nome.toUpperCase()} já está na coleção!`,
        );
        return;
      }
      const nextTeam = [...team];
      nextTeam[slot] = pokemon;
      setTeam(nextTeam);
      persist(nextTeam, bench);
      addCapturedPokemon(userId, pokemon.index).catch(() => {});
      updateBackendTeam(userId, "0", pokemon.index).catch(() => {});
    } catch {
      Alert.alert("Erro", "Falha ao sortear. Verifique sua conexão.");
    } finally {
      setRolling(false);
    }
  };

  const handleSlotPress = (index: number) => {
    const pokemon = team[index];
    if (!pokemon || !userId) return;
    const nextTeam = [...team];
    nextTeam[index] = null;
    const nextBench = [...bench, pokemon];
    setTeam(nextTeam);
    setBench(nextBench);
    persist(nextTeam, nextBench);
    updateBackendTeam(userId, pokemon.index, "0").catch(() => {});
  };

  const handleBenchToTeam = (pokemon: Pokemon) => {
    const slot = team.findIndex((p) => p === null);
    if (slot === -1) {
      Alert.alert("Time Cheio!", "Remova um Pokémon do time primeiro.");
      return;
    }
    if (!userId) return;
    const nextTeam = [...team];
    nextTeam[slot] = pokemon;
    const nextBench = bench.filter((p) => p.index !== pokemon.index);
    setTeam(nextTeam);
    setBench(nextBench);
    persist(nextTeam, nextBench);
    updateBackendTeam(userId, "0", pokemon.index).catch(() => {});
  };

  const handleDeleteFromBench = (pokemon: Pokemon) => {
    if (!userId) return;
    Alert.alert(
      "Remover Pokémon",
      `Remover ${pokemon.nome.toUpperCase()} permanentemente?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            const nextBench = bench.filter((p) => p.index !== pokemon.index);
            setBench(nextBench);
            persist(team, nextBench);
            deleteCapturedPokemon(userId, pokemon.index).catch(() => {});
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF3333" />
      </View>
    );
  }

  const activeTeamCount = team.filter(Boolean).length;

  const teamRows: (Pokemon | null)[][] = [];
  for (let i = 0; i < team.length; i += 2) teamRows.push(team.slice(i, i + 2));

  const benchRows: Pokemon[][] = [];
  for (let i = 0; i < bench.length; i += 2)
    benchRows.push(bench.slice(i, i + 2));

  return (
    <View style={styles.container}>
      <Header
        title={`Meu Time (${activeTeamCount}/${MAX_TEAM_SIZE})`}
        onMenuPress={() => setMenuOpen(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Equipe Principal</Text>
          {teamRows.map((row, rowIndex) => {
            const isAlone =
              rowIndex === teamRows.length - 1 && row.length === 1;
            return (
              <View key={rowIndex} style={styles.row}>
                {row.map((pokemon, colIndex) => {
                  const globalIndex = rowIndex * 2 + colIndex;
                  return (
                    <View
                      key={globalIndex}
                      style={[
                        styles.slotWrapper,
                        isAlone && styles.slotWrapperFull,
                      ]}
                    >
                      {pokemon ? (
                        <PokemonCard
                          pokemon={pokemon}
                          onPress={() => handleSlotPress(globalIndex)}
                        />
                      ) : (
                        <View style={styles.emptySlot}>
                          <Text style={styles.emptySlotText}>Vazio</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        <View style={styles.actionRow}>
          <Button
            title={`Obter Pokémon (${totalCaptured}/${MAX_CAPTURES})`}
            onPress={handleObtainPokemon}
            isLoading={rolling}
            disabled={!canCapture}
          />
        </View>

        <View style={styles.benchHeader}>
          <Text style={styles.sectionTitle}>Reserva ({bench.length})</Text>
          {bench.length > 0 && (
            <Text style={styles.benchHint}>
              Toque para voltar ao time · Segure para remover
            </Text>
          )}
        </View>

        {bench.length === 0 ? (
          <View style={styles.emptyBench}>
            <Text style={styles.emptyBenchText}>
              Reserva vazia. Pokémons removidos do time aparecem aqui.
            </Text>
          </View>
        ) : (
          benchRows.map((row, rowIndex) => {
            const isAlone =
              rowIndex === benchRows.length - 1 && row.length === 1;
            return (
              <View key={rowIndex} style={styles.row}>
                {row.map((pokemon) => (
                  <View
                    key={pokemon.index}
                    style={[
                      styles.slotWrapper,
                      isAlone && styles.slotWrapperFull,
                    ]}
                  >
                    <PokemonCard
                      pokemon={pokemon}
                      onPress={() => handleBenchToTeam(pokemon)}
                      onLongPress={() => handleDeleteFromBench(pokemon)}
                    />
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 32 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  teamSection: { padding: 12, backgroundColor: "#0F0F12" },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  slotWrapper: { flex: 1 },
  slotWrapperFull: { flex: 1 },
  emptySlot: {
    minHeight: 170,
    backgroundColor: "#1A1A1E",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#29292E",
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlotText: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600" },
  actionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  benchHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  benchHint: { color: COLORS.textMuted, fontSize: 11, marginBottom: 8 },
  emptyBench: { paddingTop: 32, alignItems: "center", paddingHorizontal: 32 },
  emptyBenchText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
