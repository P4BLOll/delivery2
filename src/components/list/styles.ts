import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const numColumns = 3;
const cardWidth = (width - 32) / numColumns; 

export const style = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 16,
    backgroundColor: '#121214', 
  },
});

export const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12, 
  },
  pokedexCard: {
    width: cardWidth - 8, 
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1A1A1E', 
    alignItems: 'center',
    justifyContent: 'center',
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