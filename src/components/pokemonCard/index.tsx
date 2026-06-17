import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Pokemon, Poder } from "@/@types/pokemon";
import { TYPE_COLORS, STAT_COLORS, COLORS } from "@/constants/Colors";
import { Styles } from "./styles";

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress?: () => void;
  onLongPress?: () => void;
  compact?: boolean;
  highlightedStat?: string | null; // Nova prop para a animação de sorteio
}

export function PokemonCard({
  pokemon,
  onPress,
  onLongPress,
  compact = false,
  highlightedStat = null,
}: PokemonCardProps) {
  const primaryType = pokemon.tipos[0];
  const neonColor = TYPE_COLORS[primaryType] || COLORS.defaultCardBorder;

  // Condição para mostrar os status: ou não é compacto, ou tem um status em destaque/sorteio rolando
  const showStats = !compact || highlightedStat !== null;

  return (
    <TouchableOpacity
      style={[
        Styles.card,
        { borderColor: neonColor, shadowColor: neonColor, padding: 12 },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      activeOpacity={0.7}
    >
      <View style={Styles.cardContent}>
        {/* COLUNA DA ESQUERDA: ID, NOME, TIPOS E STATS */}
        <View style={Styles.leftColumn}>
          {/* HEADER */}
          <View style={Styles.cardHeader}>
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
          
          {/* STATS */}
          {showStats && (
            <View style={Styles.statsContainer}>
              {pokemon.poderes.map((stat: Poder) => {
                const percentage = Math.min((stat.forca / 255) * 100, 100);
                const isCurrentHighlighted = highlightedStat === stat.nome;
                
                // Se for o status sorteado, brilha intensamente, senão fica levemente opaco durante o sorteio
                const barColor = isCurrentHighlighted 
                  ? "#00FF66" 
                  : (highlightedStat ? "#3F3F46" : (STAT_COLORS[stat.nome] || COLORS.defaultStatColor));

                const label =
                  stat.nome === "hp" ? "HP" :
                  stat.nome === "attack" ? "ATK" :
                  stat.nome === "defense" ? "DEF" :
                  stat.nome === "special-attack" ? "SATK" :
                  stat.nome === "special-defense" ? "SDEF" : "SPD";

                return (
                  <View 
                    key={stat.nome} 
                    style={[
                      Styles.statRow, 
                      isCurrentHighlighted && { backgroundColor: "rgba(0, 255, 102, 0.1)", borderRadius: 4, paddingHorizontal: 2 }
                    ]}
                  >
                    <View style={Styles.statInfo}>
                      <Text style={[Styles.statName, isCurrentHighlighted && { color: "#FFFFFF", fontWeight: "900" }]}>
                        {label}
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

        {/* COLUNA DA DIREITA: IMAGEM */}
        <View style={[Styles.rightColumn, compact && { width: 56, height: 56 }]}>
          {pokemon.imagem ? (
            <Image source={{ uri: pokemon.imagem }} style={compact ? Styles.pokemonImageCompact : Styles.pokemonImage} />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}