import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import {
  getPokemonById,
  getBackendTeam,
  updateBackendTeam,
} from "@/integration/pokemonIntegration";
import { Pokemon } from "@/@types/pokemon";
import { COLORS } from "@/constants/Colors";
import { Menu } from "@/components/menu";
import { PokemonCard } from "@/components/pokemonCard";
import { Button } from "@/components/button";
import { Header } from "@/components/header";

const MAX_TEAM_SIZE = 6;

export default function MeuTime() {
  const { userId } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);
  
  const [team, setTeam] = useState<(Pokemon | null)[]>(
    Array(MAX_TEAM_SIZE).fill(null),
  );
  
  const [acquired, setAcquired] = useState<Pokemon[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      try {
        setLoading(true);
        
        const backendTeam = await getBackendTeam(userId);
        if (backendTeam) setTeam(backendTeam);

        const savedAcquired = await AsyncStorage.getItem("@PokeApp:acquired");
        if (savedAcquired) setAcquired(JSON.parse(savedAcquired));

      } catch (e) {
        console.log("Erro ao sincronizar dados com o servidor:", e);
        Alert.alert("Erro", "Não foi possível carregar seu time do servidor.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem("@PokeApp:acquired", JSON.stringify(acquired))
      .catch((e) => console.log("Erro ao salvar Pokémons adquiridos:", e));
  }, [acquired, loading]);

  const handleObtainPokemon = async () => {
    if (rolling || !userId) return;
    setRolling(true);
    try {
      const randomId = Math.floor(Math.random() * 1025) + 1;
      const pokemon = await getPokemonById(randomId);

      const alreadyOwned =
        team.some((p) => p?.index === pokemon.index) ||
        acquired.some((p) => p.index === pokemon.index);

      if (alreadyOwned) {
        Alert.alert(
          "Epa!",
          `${pokemon.nome.toUpperCase()} já está na sua coleção! Tente novamente.`,
        );
        return;
      }

      setAcquired((prev) => [...prev, pokemon]);
      Alert.alert(
        "Capturado! 🎉",
        `${pokemon.nome.toUpperCase()} foi adicionado aos seus Pokémon adquiridos.`,
      );
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Falha ao conectar com a rede Pokémon.");
    } finally {
      setRolling(false);
    }
  };

  const handleSelectAcquired = async (pokemon: Pokemon) => {
    const slot = team.findIndex((p) => p === null);
    if (slot === -1) {
      Alert.alert(
        "Time Cheio!",
        "Remova um Pokémon do time antes de adicionar um novo.",
      );
      return;
    }

    if (!userId) return;

    try {
      setLoading(true);
      await updateBackendTeam(userId, "0", pokemon.index);

      setTeam((prev) => {
        const t = [...prev];
        t[slot] = pokemon;
        return t;
      });
      setAcquired((prev) => prev.filter((p) => p.index !== pokemon.index));
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "O servidor rejeitou a alteração do time.");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotPress = async (index: number) => {
    const pokemon = team[index];
    if (!pokemon || !userId) return;

    try {
      setLoading(true);
      await updateBackendTeam(userId, pokemon.index, "0");

      setTeam((prev) => {
        const t = [...prev];
        t[index] = null;
        return t;
      });
      setAcquired((prev) => [...prev, pokemon]);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível remover o Pokémon do time no servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && team.every(p => p === null) && acquired.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF3333" />
      </View>
    );
  }

  const activeTeamCount = team.filter(Boolean).length;

  return (
    <View style={styles.container}>
      <Header
        title={`Meu Time (${activeTeamCount}/${MAX_TEAM_SIZE})`}
        onMenuPress={() => setMenuOpen(true)}
      />

      <FlatList
        data={acquired}
        keyExtractor={(item) => item.index}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponent={
          <View>
            <View style={styles.teamSection}>
              <Text style={styles.sectionTitle}>Equipe Principal</Text>
              <View style={styles.slotsGrid}>
                {team.map((pokemon, index) => (
                  <View key={index} style={styles.cardContainer}>
                    {pokemon ? (
                      <PokemonCard
                        pokemon={pokemon}
                        onPress={() => handleSlotPress(index)}
                      />
                    ) : (
                      <View style={styles.emptySlotCard}>
                        <Text style={styles.emptySlotText}>Vazio</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionContainer}>
              <Button
                title="Obter Pokémon"
                onPress={handleObtainPokemon}
                isLoading={rolling}
              />
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { marginHorizontal: 16, marginTop: 16 },
              ]}
            >
              Pokémon Adquiridos ({acquired.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Nenhum Pokémon na reserva. Use o botão acima para sortear!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <PokemonCard
              pokemon={item}
              onPress={() => handleSelectAcquired(item)}
            />
          </View>
        )}
      />

      <Menu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  teamSection: {
    padding: 16,
    backgroundColor: "#0F0F12",
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
  },
  cardContainer: {
    width: "31.5%",
  },
  emptySlotCard: {
    width: "100%",
    height: 125, 
    backgroundColor: "#1A1A1E",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#29292E",
  },
  emptySlotText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyListContainer: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyListText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});