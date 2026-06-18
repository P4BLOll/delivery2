import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import {
  getBackendTeam,
  updateBackendTeam,
  deleteCapturedPokemon,
} from "@/integration/pokemonIntegration";
import { Pokemon } from "@/@types/pokemon";
import { COLORS } from "@/constants/Colors";
import { Menu } from "@/components/menu";
import { PokemonCard } from "@/components/pokemonCard";
import { Header } from "@/components/header";

const MAX_TEAM_SIZE = 5;

export default function MeuTime() {
  const { userId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<(Pokemon | null)[]>(
    Array(MAX_TEAM_SIZE).fill(null),
  );
  const [wonPokemons, setWonPokemons] = useState<Pokemon[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      setLoading(true);
      try {
        const rawLocalTeam = await AsyncStorage.getItem("@PokeApp:team");
        const rawLocalWon = await AsyncStorage.getItem("@PokeApp:won");
        
        let localTeam = rawLocalTeam ? JSON.parse(rawLocalTeam) : null;
        let localWon = rawLocalWon ? JSON.parse(rawLocalWon) : [];

        setWonPokemons(localWon);

        if (localTeam) {
          setTeam(Array(MAX_TEAM_SIZE).fill(null).map((_, i) => localTeam[i] ?? null));
        }

        const backendTeam = await getBackendTeam(userId);
        const hasData = backendTeam.some((p) => p !== null);
        if (hasData) {
          const normalized = Array(MAX_TEAM_SIZE)
            .fill(null)
            .map((_, i) => backendTeam[i] ?? null);
          setTeam(normalized);
          
          await AsyncStorage.setItem("@PokeApp:team", JSON.stringify(normalized));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleSlotPress = async (index: number) => {
    const pokemon = team[index];
    if (!pokemon || !userId) return;
    
    const nextTeam = [...team];
    nextTeam[index] = null;
    const nextWon = [...wonPokemons, pokemon];
    
    setTeam(nextTeam);
    setWonPokemons(nextWon);

    await AsyncStorage.setItem("@PokeApp:team", JSON.stringify(nextTeam));
    await AsyncStorage.setItem("@PokeApp:won", JSON.stringify(nextWon));

    await updateBackendTeam(userId, pokemon.index, "0").catch(() => {});
  };

  const handleWonToTeam = async (pokemon: Pokemon) => {
    const slot = team.findIndex((p) => p === null);
    if (slot === -1) {
      Alert.alert("Time Cheio!", "Remova um Pokémon da Equipe Principal primeiro para liberar uma vaga.");
      return;
    }
    if (!userId) return;

    const nextTeam = [...team];
    nextTeam[slot] = pokemon;
    const nextWon = wonPokemons.filter((p) => p.index !== pokemon.index);

    setTeam(nextTeam);
    setWonPokemons(nextWon);

    await AsyncStorage.setItem("@PokeApp:team", JSON.stringify(nextTeam));
    await AsyncStorage.setItem("@PokeApp:won", JSON.stringify(nextWon));

    await updateBackendTeam(userId, "0", pokemon.index).catch(() => {});
  };

  const handleDeleteFromWon = (pokemon: Pokemon) => {
    if (!userId) return;
    Alert.alert(
      "Remover Pokémon",
      `Remover ${pokemon.nome.toUpperCase()} permanentemente?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const nextWon = wonPokemons.filter((p) => p.index !== pokemon.index);
            setWonPokemons(nextWon);
            await AsyncStorage.setItem("@PokeApp:won", JSON.stringify(nextWon));
            await deleteCapturedPokemon(userId, pokemon.index).catch(() => {});
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

  const wonRows: Pokemon[][] = [];
  for (let i = 0; i < wonPokemons.length; i += 2) wonRows.push(wonPokemons.slice(i, i + 2));

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
            const isAlone = rowIndex === teamRows.length - 1 && row.length === 1;
            return (
              <View key={rowIndex} style={styles.row}>
                {row.map((pokemon, colIndex) => {
                  const globalIndex = rowIndex * 2 + colIndex;
                  return (
                    <View key={globalIndex} style={[styles.slotWrapper, isAlone && styles.slotWrapperFull]}>
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
        <View style={styles.benchHeader}>
          <Text style={[styles.sectionTitle, { color: "#00FF66" }]}>Pokémon Adquiridos ({wonPokemons.length})</Text>
          {wonPokemons.length > 0 && (
            <Text style={styles.benchHint}>Toque para mover ao time principal • Segure para remover</Text>
          )}
        </View>
        {wonPokemons.length === 0 ? (
          <View style={styles.emptyBench}>
            <Text style={styles.emptyBenchText}>Nenhum Pokémon guardado nesta área ainda. Vença lutas na Arena!</Text>
          </View>
        ) : (
          wonRows.map((row, rowIndex) => {
            const isAlone = rowIndex === wonRows.length - 1 && row.length === 1;
            return (
              <View key={`won-row-${rowIndex}`} style={styles.row}>
                {row.map((pokemon) => (
                  <View key={`won-${pokemon.index}`} style={[styles.slotWrapper, isAlone && styles.slotWrapperFull]}>
                    <PokemonCard
                      pokemon={pokemon}
                      onPress={() => handleWonToTeam(pokemon)}
                      onLongPress={() => handleDeleteFromWon(pokemon)}
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
  row: { flexDirection: "row", gap: 8, marginBottom: 8, paddingHorizontal: 12 },
  slotWrapper: { flex: 1 },
  slotWrapperFull: { flex: 0.5 },
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
  benchHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  benchHint: { color: COLORS.textMuted, fontSize: 11, marginBottom: 8 },
  emptyBench: { paddingVertical: 24, alignItems: "center", paddingHorizontal: 32 },
  emptyBenchText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});