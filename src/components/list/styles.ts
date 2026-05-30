import { StyleSheet, Dimensions } from 'react-native';

// Calcula a largura da tela para dividir os cards dinamicamente
const { width } = Dimensions.get('window');
const numColumns = 3;
const cardWidth = (width - 32) / numColumns; // 32 representa o padding lateral total

export const style = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 16,
    backgroundColor: '#121214', // Fundo principal da página em Dark Mode
  },
});

export const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12, // Espaçamento vertical entre as fileiras de Pokémon
  },
  pokedexCard: {
    width: cardWidth - 8, // Ajusta o tamanho subtraindo as margens laterais
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1A1A1E', // Card escuro e minimalista (sem bordas)
    alignItems: 'center',
    justifyContent: 'center',
    
    // Sombra extremamente sutil para dar profundidade no fundo escuro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
});