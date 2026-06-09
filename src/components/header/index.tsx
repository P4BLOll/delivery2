import React from 'react';
import { View, Text } from 'react-native';
import { PokeballButton } from '../pokeball';
import { Styles } from './styles';

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
}

export function Header({ title, onMenuPress }: HeaderProps) {
  return (
    <View style={Styles.container}>
      <PokeballButton onPress={onMenuPress} />
      <Text style={Styles.title}>{title}</Text>
      <View style={Styles.rightSpacer} />
    </View>
  );
}