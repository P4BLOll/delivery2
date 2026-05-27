import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle } from "react-native"
import { Styles } from "./styles";

type Props = TouchableOpacityProps & {
    title: string;
    style?: StyleProp<ViewStyle>; 
    onPress?: () => void;
}

export function Button({ title, style, ...rest }: Props) {
    return (
        <TouchableOpacity 
            activeOpacity={0.5} 
            style={[Styles.button, style]} 
            {...rest}>
            <Text style={Styles.title}>{title}</Text>
        </TouchableOpacity>
    )
}