import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { getPokemon } from "@/integration/pokemonIntegration";
import { Pokemon } from "@/@types/pokemon";
import { List } from "@/components/list";
import { COLORS } from "@/constants/Colors";
import { Menu } from "@/components/menu";

import { Header } from "@/components/header";
import { PokemonCard } from "@/components/pokemonCard";

export default function Pokedex() {
  const [loading, setLoading] = useState(true);
  const [pokemons, setPokemon] = useState<Pokemon[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPokemon(151);
        setPokemon(data);
      } catch (error) {
        console.log("Erro ao carregar pokemons", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleLoadMore() {
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.activityIndicator} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Pokédex" onMenuPress={() => setMenuOpen(true)} />

      <List
        data={pokemons}
        onLoadMore={handleLoadMore}
        cardStyle={() => ({
          backgroundColor: "transparent",
          padding: 0,
          borderRadius: 14,
        })}
        renderItemContent={(pokemon) => (
          <PokemonCard
            pokemon={pokemon}
            onPress={() => {}}
          />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
