import React, { useEffect, useState } from 'react';
import { getPokemon } from '@/integration/pokemonIntegration';
import { Pokemon } from '@/@types/pokemon';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { List } from '@/components/list';
import { COLORS, TYPE_COLORS, STAT_COLORS } from '@/constants/Colors';

export default function Pokedex() {
  const [loading, setLoading] = useState(true);
  const [pokemons, setPokemon] = useState<Pokemon[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPokemon(721);
        setPokemon(data);
      } catch (error) {
        console.log('Erro ao carregar pokemons', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleLoadMore() {
    console.log('Carregar mais pokemons');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.activityIndicator}
        />
      </View>
    );
  }

  return (
    <List
      data={pokemons}
      onLoadMore={handleLoadMore}
      cardStyle={(pokemon) => {
        const primaryType = pokemon.tipos[0];
        const neonColor =
        TYPE_COLORS[primaryType] ||
        COLORS.defaultCardBorder;
        return {
          borderColor: neonColor,
          borderWidth: 1.5,
          backgroundColor: '#000000',
          padding: 12,
          borderRadius: 14,
          shadowColor: neonColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 6,
          elevation: 5,
        };
      }}
      renderItemContent={(pokemon) => (
        <View style={styles.cardContent}>
          
          {/* COLUNA DA ESQUERDA: INFORMAÇÕES E STATUS */}
          <View style={styles.leftColumn}>
            
            {/* HEADER: ID, NOME E TIPOS COLADOS EM SEQUÊNCIA */}
            <View style={styles.cardHeader}>
              <Text style={styles.pokemonId}>#{pokemon.index}</Text>
              <Text style={styles.pokemonName} numberOfLines={1}>{pokemon.nome}</Text>
              
              <View style={styles.typesContainer}>
                {pokemon.tipos.map((tipo: string) => {
                  const badgeColor =
                    TYPE_COLORS[tipo] ||
                    COLORS.defaultTypeBadge;
                  return (
                    <View key={tipo} style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
                      <Text style={styles.typeText}>{tipo}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* STATUS CONTAINER */}
            <View style={styles.statsContainer}>
              {pokemon.poderes.map((stat: { nome: string; forca: number }) => {
                const percentage = Math.min((stat.forca / 255) * 100, 100);
                const barColor =
                STAT_COLORS[stat.nome] ||
                COLORS.defaultStatColor;

                return (
                  <View key={stat.nome} style={styles.statRow}>
                    <View style={styles.statInfo}>
                      <Text style={styles.statName}>
                        {stat.nome === 'hp' ? 'HP' : 
                         stat.nome === 'attack' ? 'ATK' : 
                         stat.nome === 'defense' ? 'DEF' : 
                         stat.nome === 'special-attack' ? 'SATK' : 
                         stat.nome === 'special-defense' ? 'SDEF' : 'SPD'}
                      </Text>
                      <Text style={[styles.statValue, { color: barColor }]}>{stat.forca}</Text>
                    </View>
                    
                    <View style={styles.progressBarBackground}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${percentage}%`, 
                            backgroundColor: barColor,
                            shadowColor: barColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 4,
                          }
                        ]} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* COLUNA DA DIREITA: IMAGEM DO POKÉMON GRANDE */}
          <View style={styles.rightColumn}>
            {pokemon.imagem && (
              <Image source={{ uri: pokemon.imagem }} style={styles.pokemonImage} />
            )}
          </View>

        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  cardContent: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },

  leftColumn: {
    flex: 0.65,
    paddingRight: 8,
  },

  rightColumn: {
    flex: 0.35,
    height: 125,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'nowrap',
  },

  pokemonId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },

  pokemonName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'capitalize',
    flexShrink: 1,
  },

  pokemonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  typesContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },

  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  typeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
  },

  statsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },

  statRow: {
    marginBottom: 4,
    width: '100%',
  },

  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  statName: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: '800',
  },

  statValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },

  progressBarBackground: {
    height: 4,
    width: '100%',
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'visible',
  },
});