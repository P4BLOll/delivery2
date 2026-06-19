import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle, ActivityIndicator } from "react-native";
import { Styles } from "./styles";

type Props = TouchableOpacityProps & {
    title: string;
    style?: StyleProp<ViewStyle>; 
    isLoading?: boolean;
}

export function Button({ title, style, isLoading, disabled, ...rest }: Props) {
    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={[Styles.button, (disabled || isLoading) && Styles.disabled, style]} 
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <Text style={Styles.title}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}