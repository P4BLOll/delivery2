import React, { useState, useEffect, useCallback, useRef } from "react";
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
  getTeamAndCaptured,
  updateBackendTeam,
  deleteCapturedPokemon,
  addCapturedPokemon,
  getPokemonById,
} from "@/integration/pokemonIntegration";
import { getTrainerStats, updateTrainerStats, SORTEADO_LEVEL, hasSorteado } from "@/integration/authIntegration";
import { Pokemon } from "@/@types/pokemon";
import { COLORS } from "@/constants/Colors";
import { Menu } from "@/components/menu";
import { PokemonCard } from "@/components/pokemonCard";
import { Header } from "@/components/header";
import { Button } from "@/components/button";

const MAX_TEAM_SIZE = 5;
const POKEDEX_SIZE = 151;

type SelectionSource = "team" | "won";
interface Selection {
  source: SelectionSource;
  index: number;
  pokemon: Pokemon;
}

export default function MeuTime() {
  const { userId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortearing, setSortearing] = useState(false);
  const [swapping, setSwapping] = useState(false);
  // Se true, o usuário ainda não sorteou: exibe tela vazia + botão
  const [needsSorteio, setNeedsSorteio] = useState(false);
  const [team, setTeam] = useState<(Pokemon | null)[]>(
    Array(MAX_TEAM_SIZE).fill(null),
  );
  const [wonPokemons, setWonPokemons] = useState<Pokemon[]>([]);
  const [selected, setSelected] = useState<Selection | null>(null);

  // Token de fetch para descartar respostas obsoletas
  const fetchTokenRef = useRef(0);

  const loadFromBackend = useCallback(async (showSpinner = true) => {
    if (!userId) return;
    const currentToken = ++fetchTokenRef.current;
    if (showSpinner) setLoading(true);
    try {
      const [{ team: backendTeam, captured }, stats] = await Promise.all([
        getTeamAndCaptured(userId),
        getTrainerStats(userId),
      ]);
      if (currentToken !== fetchTokenRef.current) return;
      const normalizedTeam = Array(MAX_TEAM_SIZE)
        .fill(null)
        .map((_, i) => backendTeam[i] ?? null);
      setTeam(normalizedTeam);
      setWonPokemons(captured);
      // Estado vem exclusivamente do backend (fonte única de verdade):
      // enquanto o nível indicar conta nova (level 1), exibe a tela vazia com
      // o botão de sorteio; a partir do sorteio (level >= 2), exibe o time
      // persistido — igual em qualquer dispositivo, aba anônima ou refresh.
      const alreadySorteado = hasSorteado(stats?.level);
      setNeedsSorteio(!alreadySorteado || normalizedTeam.every((p) => p === null));
    } catch {
      if (currentToken !== fetchTokenRef.current) return;
      if (showSpinner) {
        Alert.alert("Erro", "Não foi possível carregar o time. Verifique sua conexão.");
      }
    } finally {
      if (currentToken === fetchTokenRef.current && showSpinner) {
        setLoading(false);
      }
    }
  }, [userId]);

  // Na montagem: carrega o time sempre do backend (fonte única de verdade)
  useEffect(() => {
    loadFromBackend(true);
  }, [loadFromBackend]);

  const clearSelection = () => setSelected(null);

  const executeSwap = async (teamPokemon: Pokemon, wonPokemon: Pokemon) => {
    setSwapping(true);
    setSelected(null);
    ++fetchTokenRef.current;

    const prevTeam = [...team];
    const prevWon = [...wonPokemons];

    const nextTeam = team.map((p) =>
      p?.index === teamPokemon.index ? wonPokemon : p,
    );
    const nextWon = wonPokemons.map((p) =>
      p.index === wonPokemon.index ? teamPokemon : p,
    );
    setTeam(nextTeam);
    setWonPokemons(nextWon);

    try {
      await updateBackendTeam(userId!, teamPokemon.index, wonPokemon.index);
    } catch {
      setTeam(prevTeam);
      setWonPokemons(prevWon);
      Alert.alert("Erro", "Não foi possível realizar a troca. Tente novamente.");
    } finally {
      setSwapping(false);
    }
  };

  const handleTeamPress = (index: number) => {
    const pokemon = team[index];
    if (!pokemon || swapping) return;
    if (selected?.source === "won") { executeSwap(pokemon, selected.pokemon); return; }
    if (selected?.source === "team" && selected.index === index) { clearSelection(); return; }
    setSelected({ source: "team", index, pokemon });
  };

  const handleWonPress = (index: number) => {
    const pokemon = wonPokemons[index];
    if (!pokemon || swapping) return;
    if (selected?.source === "team") { executeSwap(selected.pokemon, pokemon); return; }
    if (selected?.source === "won" && selected.index === index) { clearSelection(); return; }
    setSelected({ source: "won", index, pokemon });
  };

  const handleDeleteFromWon = (pokemon: Pokemon) => {
    if (!userId) return;
    if (selected?.source === "won" && selected.pokemon.index === pokemon.index) {
      clearSelection();
    }
    Alert.alert(
      "Remover Pokémon",
      `Remover ${pokemon.nome.toUpperCase()} permanentemente?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            setWonPokemons((prev) => prev.filter((p) => p.index !== pokemon.index));
            try {
              await deleteCapturedPokemon(userId, pokemon.index);
            } catch {
              Alert.alert("Erro", "Não foi possível remover o Pokémon.");
              await loadFromBackend(false);
            }
          },
        },
      ],
    );
  };

  /**
   * Sorteia 5 pokémons aleatórios da PokéAPI e os coloca na Equipe Principal.
   *
   * O backend exige que o newPokemon esteja em captured antes do swap, e o
   * swap sempre move o removedPokemon para captured. Para manter os adquiridos
   * limpos, após cada swap deletamos imediatamente o pokémon deslocado.
   *
   * Fluxo:
   *   1. Busca o time atual do backend (5 slots já populados pelo registro)
   *   2. Sorteia 5 IDs únicos sem conflito com os existentes
   *   3. Para cada slot i:
   *      a. Adiciona newPokemon[i] como captured
   *      b. Faz swap(team[i] → newPokemon[i])  — team[i] vai para captured
   *      c. Deleta team[i] de captured          — adquiridos ficam limpos
   *   4. Atualiza a UI e recarrega do backend
   */
  const handleSortearTime = async () => {
    if (!userId) return;
    setSortearing(true);
    try {
      // 1. Time atual do backend
      const { team: backendTeam } = await getTeamAndCaptured(userId);
      const currentTeam = backendTeam
        .filter((p): p is Pokemon => p !== null)
        .slice(0, MAX_TEAM_SIZE);

      const usedIds = new Set(currentTeam.map((p) => p.index));

      // 2. Sorteia 5 IDs únicos sem conflito
      const available = Array.from({ length: POKEDEX_SIZE }, (_, i) => i + 1)
        .filter((id) => !usedIds.has(String(id)));
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      const newIds = available.slice(0, MAX_TEAM_SIZE);

      if (newIds.length < MAX_TEAM_SIZE) {
        Alert.alert("Erro", "Não foi possível sortear pokémons suficientes.");
        return;
      }

      // 3. Para cada slot: add captured → swap → delete displaced
      const newPokemons: Pokemon[] = [];
      for (let i = 0; i < currentTeam.length; i++) {
        const pokemon = await getPokemonById(newIds[i]);
        newPokemons.push(pokemon);

        // a. Coloca o novo em captured (requisito do backend para o swap)
        await addCapturedPokemon(userId, pokemon.index);

        // b. Swap: o slot do time recebe o novo, o antigo vai para captured
        await updateBackendTeam(userId, currentTeam[i].index, pokemon.index);

        // c. Remove o antigo de captured — mantém adquiridos limpos
        await deleteCapturedPokemon(userId, currentTeam[i].index);
      }

      // 4. Marca no backend que o time já foi configurado e atualiza a UI.
      //    O nível do treinador passa a >= SORTEADO_LEVEL, sinalizando em
      //    qualquer dispositivo que a conta já sorteou (preserva vitórias/derrotas).
      const currentStats = await getTrainerStats(userId);
      await updateTrainerStats(userId, {
        level: String(Math.max(SORTEADO_LEVEL, Number(currentStats.level) || 1)),
        vitorias: currentStats.vitorias,
        derrotas: currentStats.derrotas,
      });
      setNeedsSorteio(false);
      setTeam(newPokemons);
      setWonPokemons([]);
      await loadFromBackend(false);
    } catch {
      Alert.alert("Erro", "Não foi possível sortear o time. Tente novamente.");
    } finally {
      setSortearing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF3333" />
      </View>
    );
  }

  const activeTeamCount = team.filter(Boolean).length;

  const swapHint = selected
    ? selected.source === "team"
      ? `Toque em um Pokémon Adquirido para trocar com ${selected.pokemon.nome}`
      : `Toque em um Pokémon do Time para trocar com ${selected.pokemon.nome}`
    : null;

  const teamRows: (Pokemon | null)[][] = [];
  for (let i = 0; i < team.length; i += 2) teamRows.push(team.slice(i, i + 2));

  const wonRows: Pokemon[][] = [];
  for (let i = 0; i < wonPokemons.length; i += 2)
    wonRows.push(wonPokemons.slice(i, i + 2));

  return (
    <View style={styles.container}>
      <Header
        title={`Meu Time (${activeTeamCount}/${MAX_TEAM_SIZE})`}
        onMenuPress={() => setMenuOpen(true)}
      />

      {swapHint && (
        <View style={styles.swapBanner}>
          <Text style={styles.swapBannerText} numberOfLines={2}>
            {swapHint}
          </Text>
          <Text style={styles.swapBannerCancel} onPress={clearSelection}>
            Cancelar
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── EQUIPE PRINCIPAL ── */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Equipe Principal</Text>

          {needsSorteio ? (
            // Conta nova: exibe slots vazios + botão de sorteio
            <View>
              <View style={styles.row}>
                <View style={styles.slotWrapper}><View style={styles.emptySlot}><Text style={styles.emptySlotText}>Vazio</Text></View></View>
                <View style={styles.slotWrapper}><View style={styles.emptySlot}><Text style={styles.emptySlotText}>Vazio</Text></View></View>
              </View>
              <View style={styles.row}>
                <View style={styles.slotWrapper}><View style={styles.emptySlot}><Text style={styles.emptySlotText}>Vazio</Text></View></View>
                <View style={styles.slotWrapper}><View style={styles.emptySlot}><Text style={styles.emptySlotText}>Vazio</Text></View></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.slotWrapper, styles.slotWrapperFull]}>
                  <View style={styles.emptySlot}><Text style={styles.emptySlotText}>Vazio</Text></View>
                </View>
              </View>
              <Button
                title="Sortear Meu Time"
                onPress={handleSortearTime}
                isLoading={sortearing}
                style={styles.sortearBtn}
              />
            </View>
          ) : (
            teamRows.map((row, rowIndex) => {
              const isAlone = rowIndex === teamRows.length - 1 && row.length === 1;
              return (
                <View key={rowIndex} style={styles.row}>
                  {row.map((pokemon, colIndex) => {
                    const globalIndex = rowIndex * 2 + colIndex;
                    const isSelected =
                      selected?.source === "team" && selected.index === globalIndex;
                    const isTarget =
                      selected?.source === "won" && pokemon !== null;
                    return (
                      <View
                        key={globalIndex}
                        style={[styles.slotWrapper, isAlone && styles.slotWrapperFull]}
                      >
                        {pokemon ? (
                          <View
                            style={[
                              styles.selectionWrapper,
                              isSelected && styles.selectionActive,
                              isTarget && styles.selectionTarget,
                            ]}
                          >
                            <PokemonCard
                              pokemon={pokemon}
                              onPress={() => handleTeamPress(globalIndex)}
                            />
                          </View>
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
            })
          )}
        </View>

        {/* ── POKÉMON ADQUIRIDOS ── */}
        {!needsSorteio && (
          <>
            <View style={styles.benchHeader}>
              <Text style={[styles.sectionTitle, { color: "#00FF66" }]}>
                Pokémon Adquiridos ({wonPokemons.length})
              </Text>
              {wonPokemons.length > 0 && !selected && (
                <Text style={styles.benchHint}>
                  Toque para iniciar troca com o time • Segure para remover
                </Text>
              )}
            </View>

            {wonPokemons.length === 0 ? (
              <View style={styles.emptyBench}>
                <Text style={styles.emptyBenchText}>
                  Nenhum Pokémon guardado nesta área ainda. Vença lutas na Arena!
                </Text>
              </View>
            ) : (
              wonRows.map((row, rowIndex) => {
                const isAlone = rowIndex === wonRows.length - 1 && row.length === 1;
                return (
                  <View key={`won-row-${rowIndex}`} style={styles.row}>
                    {row.map((pokemon, colIndex) => {
                      const globalIndex = rowIndex * 2 + colIndex;
                      const isSelected =
                        selected?.source === "won" && selected.index === globalIndex;
                      const isTarget = selected?.source === "team";
                      return (
                        <View
                          key={`won-${pokemon.index}`}
                          style={[styles.slotWrapper, isAlone && styles.slotWrapperFull]}
                        >
                          <View
                            style={[
                              styles.selectionWrapper,
                              isSelected && styles.selectionActive,
                              isTarget && !isSelected && styles.selectionTarget,
                            ]}
                          >
                            <PokemonCard
                              pokemon={pokemon}
                              onPress={() => handleWonPress(globalIndex)}
                              onLongPress={() => handleDeleteFromWon(pokemon)}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })
            )}
          </>
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
  swapBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1C1C1E",
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  swapBannerText: {
    flex: 1,
    color: "#E8C84A",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  swapBannerCancel: {
    color: "#FF3333",
    fontSize: 13,
    fontWeight: "800",
    paddingLeft: 12,
  },
  selectionWrapper: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectionActive: {
    borderColor: "#E8C84A",
    shadowColor: "#E8C84A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  selectionTarget: {
    borderColor: "#00FF66",
    shadowColor: "#00FF66",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
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
  emptyBench: {
    paddingVertical: 24,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyBenchText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  sortearBtn: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#FF3333",
    shadowColor: "#FF3333",
  },
});
