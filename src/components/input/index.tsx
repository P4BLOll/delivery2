import { TextInput, TextInputProps } from "react-native"
import { Styles } from "./styles";

type Props = TextInputProps & {
    placeholder: string;
}

export function Input({...rest}: Props) {
    return (
        <TextInput
            style={Styles.input}
            {...rest}
        />
    )
}