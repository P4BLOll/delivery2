import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";

export const Styles = StyleSheet.create({
  // ADICIONADO: Toda a estrutura estática do card foi movida para aqui
  card: {
    borderWidth: 1.5,
    backgroundColor: '#000000',
    borderRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
    width: '100%', // Aqui dentro, o '100%' é validado nativamente pelo React Native
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
    flexWrap: 'wrap',
  },
  pokemonId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  pokemonName: {
    fontSize: 14,
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
    flexWrap: 'wrap',
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