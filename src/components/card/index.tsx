import React from "react";
import { View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { Styles } from "./styles";

type Props = ViewProps & {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function Card({ children, style, ...rest }: Props) {
    return (
        <View style={[Styles.card, style]} {...rest}>
            {children}
        </View>
    );
}