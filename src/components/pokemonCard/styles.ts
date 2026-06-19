import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/Colors";

export const Styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    backgroundColor: '#000000',
    borderRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center', 
  },
  leftColumn: {
    flex: 0.62, 
    paddingRight: 4,
  },
  rightColumn: {
    flex: 0.38,
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
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  pokemonImageCompact: {
    width: 85, 
    height: 85,
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
    marginBottom: 3,
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
  },
});