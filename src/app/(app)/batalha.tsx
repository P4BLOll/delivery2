import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Modal, Image, Pressable, Animated } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { getPokemonById, getTeamAndCaptured, updateBackendTeam, addCapturedPokemon } from "@/integration/pokemonIntegration";
import { updateTrainerStats, getTrainerStats, hasSorteado } from "@/integration/authIntegration";
import { Pokemon, Poder } from "@/@types/pokemon";
import { COLORS, TYPE_COLORS } from "@/constants/Colors";
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

// Calcula luminância relativa (WCAG 2.1) para decidir texto preto ou branco no botão preenchido
function getLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

interface RewardModalProps {
  pokemon: Pokemon | null;
  onClose: () => void;
}

function RewardModal({ pokemon, onClose }: RewardModalProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  // Reseta o hover sempre que o modal abre com um novo pokémon
  useEffect(() => {
    if (pokemon) {
      fillAnim.setValue(0);
    }
  }, [pokemon]);

  const handleHoverIn = () => {
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleHoverOut = () => {
    Animated.timing(fillAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  if (!pokemon) return null;

  const primaryType = pokemon.tipos[0];
  const neonColor = TYPE_COLORS[primaryType] || COLORS.defaultCardBorder;
  const btnTextColor = getLuminance(neonColor) > 0.35 ? "#000000" : "#FFFFFF";

  const animatedBg = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", neonColor],
  });

  const animatedTextColor = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [neonColor, btnTextColor],
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.eyebrow}>RECOMPENSA DE VITÓRIA</Text>
          <Text style={modalStyles.title}>Você capturou um novo Pokémon!</Text>

          <View style={[modalStyles.pokemonFrame, { borderColor: neonColor, shadowColor: neonColor }]}>
            {pokemon.imagem ? (
              <Image source={{ uri: pokemon.imagem }} style={modalStyles.pokemonImage} />
            ) : null}
          </View>

          <Text style={modalStyles.pokemonId}>#{pokemon.index}</Text>
          <Text style={modalStyles.pokemonName}>{pokemon.nome}</Text>

          <View style={modalStyles.typesRow}>
            {pokemon.tipos.map((tipo) => (
              <View
                key={tipo}
                style={[modalStyles.typeBadge, { backgroundColor: TYPE_COLORS[tipo] || COLORS.defaultTypeBadge }]}
              >
                <Text style={modalStyles.typeText}>{tipo}</Text>
              </View>
            ))}
          </View>

          <Text style={modalStyles.hint}>Disponível em Meu Time → Pokémon Adquiridos</Text>

          <Pressable
            onPress={onClose}
            onPointerEnter={handleHoverIn}
            onPointerLeave={handleHoverOut}
            onPressIn={handleHoverIn}
            onPressOut={handleHoverOut}
          >
            <Animated.View
              style={[
                modalStyles.button,
                { borderColor: neonColor, backgroundColor: animatedBg },
              ]}
            >
              <Animated.Text style={[modalStyles.buttonText, { color: animatedTextColor }]}>
                CONTINUAR
              </Animated.Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function Batalha() {
  const { userId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [battling, setBattling] = useState(false);
  const [playerTeam, setPlayerTeam] = useState<(Pokemon | null)[]>(Array(MAX_TEAM_SIZE).fill(null));
  const [enemyTeam, setEnemyTeam] = useState<Pokemon[]>([]);
  // Conta nova ainda não sorteou: não há time para batalhar até sortear em /meutime.
  const [needsSorteio, setNeedsSorteio] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [battleOutcome, setBattleOutcome] = useState<"Ganhou" | "Perdeu" | null>(null);
  const [animatingStats, setAnimatingStats] = useState<{ [key: number]: { player: string | null; enemy: string | null } }>({});
  const [rewardPokemon, setRewardPokemon] = useState<Pokemon | null>(null);

  useEffect(() => {
    async function initBattleData() {
      if (!userId) return;
      setLoading(true);
      try {
        const [{ team: backendTeam }, enemies, stats] = await Promise.all([
          getTeamAndCaptured(userId),
          Promise.all(ENEMY_IDS.map(id => getPokemonById(id))),
          getTrainerStats(userId),
        ]);
        // Enquanto a conta não sorteou (level < SORTEADO_LEVEL), o time é tratado
        // como vazio aqui também — o time pré-populado do backend só passa a
        // valer depois do sorteio em /meutime. Estado vem do backend (cross-device).
        const sorteado = hasSorteado(stats?.level);
        const normalized = sorteado
          ? Array(MAX_TEAM_SIZE).fill(null).map((_, i) => backendTeam[i] ?? null)
          : Array(MAX_TEAM_SIZE).fill(null);
        setNeedsSorteio(!sorteado);
        setPlayerTeam(normalized);
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
    if (needsSorteio) {
      Alert.alert(
        "Sem time",
        "Você ainda não tem um time. Vá em Meu Time e sorteie seu time para poder batalhar!",
      );
      return;
    }
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

              // Exibe o popup imediatamente — persistência roda em background
              setRewardPokemon(newPokemon);

              // Background: salva no backend sem bloquear o popup
              Promise.resolve().then(async () => {
                try {
                  await addCapturedPokemon(userId, newPokemon.index).catch(() => {});
                } catch {
                  // falha silenciosa — popup já foi exibido
                }
              });
            } catch (apiError) {
              console.log("Erro ao gerar recompensa:", apiError);
            }
          }        } catch (error) {
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
          {needsSorteio && (
            <Text style={styles.sorteioHint}>
              Você ainda não tem um time. Vá em Meu Time e sorteie para poder batalhar.
            </Text>
          )}
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

      <RewardModal pokemon={rewardPokemon} onClose={() => setRewardPokemon(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  actionRow: { padding: 16, alignItems: 'center' },
  actionBtn: { maxWidth: 400 }, 
  sorteioHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 16,
  },
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 320,
    backgroundColor: "#0F0F12",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#29292E",
    gap: 14,
  },
  eyebrow: {
    color: "#FFE114",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  pokemonFrame: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#1A1A1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
    marginVertical: 4,
  },
  pokemonImage: {
    width: 155,
    height: 155,
    resizeMode: "contain",
  },
  pokemonId: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
  },
  pokemonName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    textTransform: "capitalize",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  typesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 2,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
  },
  button: {
    width: 272,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});