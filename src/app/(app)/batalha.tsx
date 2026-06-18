import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { getPokemonById, updateBackendTeam, addCapturedPokemon } from "@/integration/pokemonIntegration";
import { updateTrainerStats, getTrainerStats } from "@/integration/authIntegration";
import { Pokemon, Poder } from "@/@types/pokemon";
import { COLORS } from "@/constants/Colors";
import { Header } from "@/components/header";
import { Menu } from "@/components/menu";
import { Button } from "@/components/button";
import { PokemonCard } from "@/components/pokemonCard";

const MAX_TEAM_SIZE = 5;
const ENEMY_IDS = [25, 6, 150, 448, 94];

interface RoundResult {
  playerPoke: Pokemon | null;
  enemyPoke: Pokemon;
  winner: "player" | "enemy" | "draw";
  playerStat: Poder | null;
  enemyStat: Poder;
}

export default function Batalha() {
  const { userId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [battling, setBattling] = useState(false);
  const [playerTeam, setPlayerTeam] = useState<(Pokemon | null)[]>(Array(MAX_TEAM_SIZE).fill(null));
  const [enemyTeam, setEnemyTeam] = useState<Pokemon[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [battleOutcome, setBattleOutcome] = useState<"Ganhou" | "Perdeu" | null>(null);
  const [animatingStats, setAnimatingStats] = useState<{ [key: number]: { player: string | null; enemy: string | null } }>({});

  useEffect(() => {
    async function initBattleData() {
      if (!userId) return;
      setLoading(true);
      try {
        const rawTeam = await AsyncStorage.getItem("@PokeApp:team");
        if (rawTeam) {
          const parsedTeam = JSON.parse(rawTeam);
          const normalized = Array(MAX_TEAM_SIZE).fill(null).map((_, i) => parsedTeam[i] ?? null);
          setPlayerTeam(normalized);
        }

        const enemyPromises = ENEMY_IDS.map(id => getPokemonById(id));
        const enemies = await Promise.all(enemyPromises);
        setEnemyTeam(enemies);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados da batalha.");
      } finally {
        setLoading(false);
      }
    }
    initBattleData();
  }, [userId]);

  const handleStartBattle = async () => {
    const activeCount = playerTeam.filter(Boolean).length;
    if (activeCount < 3) {
      Alert.alert("Time incompleto", "Você precisa de pelo menos 3 Pokémon principais para batalhar!");
      return;
    }
    setBattling(true);
    setBattleOutcome(null);
    setResults([]);
    const animationDuration = 2000;
    const intervalSpeed = 120;

    const intervalId = setInterval(() => {
      const currentAnimState: typeof animatingStats = {};
      for (let i = 0; i < MAX_TEAM_SIZE; i++) {
        const pPoke = playerTeam[i];
        const ePoke = enemyTeam[i];
        const randomPlayerStatName = pPoke?.poderes[Math.floor(Math.random() * pPoke.poderes.length)]?.nome || null;
        const randomEnemyStatName = ePoke.poderes[Math.floor(Math.random() * ePoke.poderes.length)].nome;
        currentAnimState[i] = {
          player: randomPlayerStatName,
          enemy: randomEnemyStatName,
        };
      }
      setAnimatingStats(currentAnimState);
    }, intervalSpeed);

    setTimeout(async () => {
      clearInterval(intervalId);
      const roundResults: RoundResult[] = [];
      const finalAnimState: typeof animatingStats = {};
      let playerWins = 0;
      let enemyWins = 0;

      for (let i = 0; i < MAX_TEAM_SIZE; i++) {
        const pPoke = playerTeam[i];
        const ePoke = enemyTeam[i];
        const pStat = pPoke ? pPoke.poderes[Math.floor(Math.random() * pPoke.poderes.length)] : null;
        const eStat = ePoke.poderes[Math.floor(Math.random() * ePoke.poderes.length)];
        const pPower = pStat ? pStat.forca : 0;
        const ePower = eStat.forca;

        let winner: "player" | "enemy" | "draw" = "draw";
        if (pPower > ePower) {
          winner = "player";
          playerWins++;
        } else if (ePower > pPower) {
          winner = "enemy";
          enemyWins++;
        }

        roundResults.push({
          playerPoke: pPoke,
          enemyPoke: ePoke,
          winner,
          playerStat: pStat,
          enemyStat: eStat,
        });

        finalAnimState[i] = {
          player: pStat?.nome || null,
          enemy: eStat.nome,
        };
      }

      setAnimatingStats(finalAnimState);
      const finalOutcome = playerWins > enemyWins ? "Ganhou" : "Perdeu";
      setResults(roundResults);
      setBattleOutcome(finalOutcome);

      if (userId) {
        try {
          const currentStats = await getTrainerStats(userId);
          const vitoriasAtualizadas = finalOutcome === "Ganhou" ? String(Number(currentStats.vitorias) + 1) : currentStats.vitorias;
          const derrotasAtualizadas = finalOutcome === "Perdeu" ? String(Number(currentStats.derrotas) + 1) : currentStats.derrotas;
          
          await updateTrainerStats(userId, {
            level: currentStats.level,
            vitorias: vitoriasAtualizadas,
            derrotas: derrotasAtualizadas,
          });

          if (finalOutcome === "Ganhou") {
            try {
              const randomRewardId = Math.floor(Math.random() * 1025) + 1;
              const newPokemon = await getPokemonById(randomRewardId);
              
              await addCapturedPokemon(userId, newPokemon.index).catch(() => {});
              
              const rawWon = await AsyncStorage.getItem("@PokeApp:won");
              const currentWon: Pokemon[] = rawWon ? JSON.parse(rawWon) : [];
              
              if (!currentWon.some(p => p.index === newPokemon.index)) {
                currentWon.push(newPokemon);
                await AsyncStorage.setItem("@PokeApp:won", JSON.stringify(currentWon));
              }
            } catch (apiError) {
              console.log("Erro ao gerar recompensa em background:", apiError);
            }
          }
        } catch (error) {
          console.log("Erro ao salvar status pós-batalha.");
        }
      }
      setBattling(false);
    }, animationDuration);
  };

  const formatStatName = (name: string) => {
    if (name === "hp") return "HP";
    if (name === "attack") return "ATK";
    if (name === "defense") return "DEF";
    if (name === "special-attack") return "S.ATK";
    if (name === "special-defense") return "S.DEF";
    if (name === "speed") return "SPD";
    return name.toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF3333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Arena de Batalha" onMenuPress={() => setMenuOpen(true)} />
      {battleOutcome ? (
        <View style={styles.outcomeContainer}>
          <Text style={[styles.outcomeTitle, battleOutcome === "Ganhou" ? styles.winText : styles.lossText]}>
            RESULTADO: VOCÊ {battleOutcome.toUpperCase()}!
          </Text>
          <Button title="Batalhar Novamente" onPress={() => { setBattleOutcome(null); setResults([]); setAnimatingStats({}); }} style={styles.actionBtn} />
        </View>
      ) : (
        <View style={styles.actionRow}>
          <Button title="Iniciar Batalha" onPress={handleStartBattle} isLoading={battling} style={styles.actionBtn} />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.columnsContainer}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Meu Time</Text>
            {playerTeam.map((playerPoke, index) => {
              const round = results[index];
              const currentAnimation = animatingStats[index];
              return (
                <View key={`player-${index}`} style={styles.battleCardWrapper}>
                  <Text style={styles.roundLabel}>ROUND {index + 1}</Text>
                  {playerPoke ? (
                    <PokemonCard 
                      pokemon={playerPoke}
                      compact={false}
                      highlightedStat={currentAnimation?.player}
                    />
                  ) : (
                    <View style={styles.emptySlot}><Text style={styles.emptyText}>Vazio</Text></View>
                  )}
                  {round && round.playerStat && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.powerText}>
                        Sorteado: <Text style={styles.statHighlight}>{formatStatName(round.playerStat.nome)}</Text> ({round.playerStat.forca})
                      </Text>
                      <Text style={[styles.resultText, round.winner === "player" ? styles.winText : round.winner === "enemy" ? styles.lossText : styles.drawText]}>
                        {round.winner === "player" ? "Ganhou" : round.winner === "enemy" ? "Perdeu" : "Empate"}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.column}>
            <Text style={[styles.columnTitle, { color: "#FF3333" }]}>Time Inimigo</Text>
            {enemyTeam.map((enemyPoke, index) => {
              const round = results[index];
              const currentAnimation = animatingStats[index];
              return (
                <View key={`enemy-${index}`} style={styles.battleCardWrapper}>
                  <Text style={styles.roundLabel}>ROUND {index + 1}</Text>
                  <PokemonCard 
                    pokemon={enemyPoke}
                    compact={false}
                    highlightedStat={currentAnimation?.enemy}
                  />
                  {round && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.powerText}>
                        Sorteado: <Text style={styles.statHighlight}>{formatStatName(round.enemyStat.nome)}</Text> ({round.enemyStat.forca})
                      </Text>
                      <Text style={[styles.resultText, round.winner === "enemy" ? styles.winText : round.winner === "player" ? styles.lossText : styles.drawText]}>
                        {round.winner === "enemy" ? "Ganhou" : round.winner === "player" ? "Perdeu" : "Empate"}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  actionRow: { padding: 16, alignItems: 'center' },
  actionBtn: { maxWidth: 400 }, 
  scrollContent: { paddingBottom: 42 },
  columnsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
    width: "100%",
  },
  column: {
    flex: 1, 
    gap: 16,
  },
  columnTitle: {
    color: "#00FF66",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 4,
    textTransform: "uppercase"
  },
  battleCardWrapper: {
    backgroundColor: "#1A1A1E",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#29292E",
  },
  roundLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  emptySlot: {
    width: "100%",
    height: 180,
    backgroundColor: "#121214",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  powerText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  statHighlight: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  outcomeContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#0F0F12",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  outcomeTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  winText: { color: "#00FF66" },
  lossText: { color: "#FF3333" },
  drawText: { color: COLORS.textSecondary },
});