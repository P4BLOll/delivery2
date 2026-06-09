import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { COLORS } from "@/constants/Colors";
import { Styles } from "./styles";

type Props = TextInputProps & {
    placeholder: string;
}

export function Input({ ...rest }: Props) {
    return (
        <TextInput
            style={Styles.input}
            placeholderTextColor={COLORS.textSecondary} // Garante visibilidade do placeholder no dark mode
            {...rest}
        />
    );
}