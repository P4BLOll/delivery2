import React from 'react';
import { View, ViewStyle, FlatList } from 'react-native';
import { style, styles } from "./styles";

interface ListProps {
  data: any[];
  onLoadMore: () => void;
  renderItemContent: (item: any) => React.ReactNode;
  cardStyle?: (item: any) => ViewStyle;
}

export function List({
  data,
  onLoadMore,
  renderItemContent,
  cardStyle,
}: ListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id ?? item.index)}
      numColumns={3} // Força a exibição em 3 colunas
      columnWrapperStyle={styles.columnWrapper} // Controla o espaçamento da linha
      renderItem={({ item }) => (
        <View style={[styles.pokedexCard, cardStyle?.(item)]}>
          {renderItemContent(item)}
        </View>
      )}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.2}
      contentContainerStyle={style.container}
    />
  );
}