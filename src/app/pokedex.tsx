import React, { useEffect, useState } from 'react';
import { getPokemon } from '@/integration/pokemonIntegration';
import { Pokemon } from '@/@types/pokemon';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { List } from '@/components/list';

const TYPE_COLORS: { [key: string]: string } = {
  normal: '#A8A77A',
  fire: '#FF4216',
  water: '#3393FF',
  grass: '#46C03E',
  electric: '#FFE114',
  ice: '#44DEC9',
  fighting: '#E03058',
  poison: '#B556D6',
  ground: '#E88547',
  flying: '#8FA9DE',
  psychic: '#FF5261',
  bug: '#89C81A',
  rock: '#CDBD8C',
  ghost: '#5669C9',
  dragon: '#0076E6',
  dark: '#4F4756',
  steel: '#5092A8',
  fairy: '#FF8BE6',
};

const STAT_COLORS: { [key: string]: string } = {
  'hp': '#00FF66',
  'attack': '#FF4500',
  'defense': '#FFFF00',
  'special-attack': '#00FFFF',
  'special-defense': '#2600ff',
  'speed': '#FF007F',
};

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
        <ActivityIndicator size="large" color="#FF3333" />
      </View>
    );
  }

  return (
    <List
      data={pokemons}
      onLoadMore={handleLoadMore}
      cardStyle={(pokemon) => {
        const primaryType = pokemon.tipos[0];
        const neonColor = TYPE_COLORS[primaryType] || '#29292E';
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
                  const badgeColor = TYPE_COLORS[tipo] || '#718096';
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
                const barColor = STAT_COLORS[stat.nome] || '#4B5563'; 

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
    backgroundColor: '#0A0A0C',
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
    gap: 6, // Define um espaço fixo e sutil entre o ID, o Nome e as Badges
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
  pokemonId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4E4E5A',
  },
  pokemonName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    flexShrink: 1, // Se o nome for gigantesco, ele comprime um pouco para preservar os tipos
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
    // Retirado o 'marginLeft: auto' para que fique colado ao nome
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  statsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#16161A', 
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
    color: '#71717A',
    fontWeight: '800',
  },
  statValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 4,
    width: '100%',
    backgroundColor: '#16161A', 
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'visible', 
  },
});