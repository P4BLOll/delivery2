import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Pokemon, Poder } from "@/@types/pokemon";
import { TYPE_COLORS, STAT_COLORS, COLORS } from "@/constants/Colors";
import { Styles } from "./styles";

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress?: () => void;
  compact?: boolean;
}

export function PokemonCard({
  pokemon,
  onPress,
  compact = false,
}: PokemonCardProps) {
  const primaryType = pokemon.tipos[0];
  const neonColor = TYPE_COLORS[primaryType] || COLORS.defaultCardBorder;

  return (
    <TouchableOpacity
      style={[
        Styles.card,
        {
          borderColor: neonColor,
          shadowColor: neonColor,
          padding: compact ? 8 : 12,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          Styles.cardContent,
          compact && { flexDirection: "column", alignItems: "center" },
        ]}
      >
        {/* COLUNA DA ESQUERDA: INFORMAÇÕES E STATUS */}
        <View
          style={[
            Styles.leftColumn,
            compact && {
              flex: 1,
              paddingRight: 0,
              width: "100%",
              alignItems: "center",
            },
          ]}
        >
          {/* HEADER DO CARD: ID, NOME E TIPOS */}
          <View
            style={[
              Styles.cardHeader,
              compact && { flexDirection: "column", gap: 4, marginBottom: 4 },
            ]}
          >
            <Text style={Styles.pokemonId}>#{pokemon.index}</Text>
            <Text style={Styles.pokemonName} numberOfLines={1}>
              {pokemon.nome}
            </Text>

            <View style={Styles.typesContainer}>
              {pokemon.tipos.map((tipo: string) => {
                const badgeColor = TYPE_COLORS[tipo] || COLORS.defaultTypeBadge;
                return (
                  <View
                    key={tipo}
                    style={[Styles.typeBadge, { backgroundColor: badgeColor }]}
                  >
                    <Text style={Styles.typeText}>{tipo}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* CONTAINER DOS STATUS BAR */}
          {!compact && (
            <View style={Styles.statsContainer}>
              {pokemon.poderes.map((stat: Poder) => {
                const percentage = Math.min((stat.forca / 255) * 100, 100);
                const barColor =
                  STAT_COLORS[stat.nome] || COLORS.defaultStatColor;

                return (
                  <View key={stat.nome} style={Styles.statRow}>
                    <View style={Styles.statInfo}>
                      <Text style={Styles.statName}>
                        {stat.nome === "hp"
                          ? "HP"
                          : stat.nome === "attack"
                            ? "ATK"
                            : stat.nome === "defense"
                              ? "DEF"
                              : stat.nome === "special-attack"
                                ? "SATK"
                                : stat.nome === "special-defense"
                                  ? "SDEF"
                                  : "SPD"}
                      </Text>
                      <Text style={[Styles.statValue, { color: barColor }]}>
                        {stat.forca}
                      </Text>
                    </View>

                    <View style={Styles.progressBarBackground}>
                      <View
                        style={[
                          Styles.progressBarFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                            shadowColor: barColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 4,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* COLUNA DA DIREITA: IMAGEM DO POKÉMON */}
        <View
          style={[
            Styles.rightColumn,
            compact && { height: 60, width: 60, marginTop: 4, flex: 0 },
          ]}
        >
          {pokemon.imagem && (
            // CORRIGIDO: de styles para Styles com letra maiúscula
            <Image
              source={{ uri: pokemon.imagem }}
              style={Styles.pokemonImage}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
