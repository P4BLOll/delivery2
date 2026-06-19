import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Animated, Easing } from "react-native";
import { Styles } from "./styles";

interface PokeballButtonProps {
  onPress: () => void;
}

export function PokeballButton({ onPress }: PokeballButtonProps) {
  const [capturing, setCapturing] = useState(false);

  const wobbleAnimation = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const startCaptureAnimation = () => {
    if (capturing) return;
    setCapturing(true);

    Animated.sequence([
      Animated.timing(wobbleAnimation, {
        toValue: 1,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(wobbleAnimation, {
        toValue: -1,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(wobbleAnimation, {
        toValue: 1,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(wobbleAnimation, {
        toValue: -1,
        duration: 80,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(wobbleAnimation, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnimation, {
          toValue: 10,
          duration: 300,
          easing: Easing.out(Easing.elastic(1.5)),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(200),
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setCapturing(false);
      onPress();
    });
  };

  const rotate = wobbleAnimation.interpolate({
    inputRange: [-1, 0, 1, 10],
    outputRange: ["-20deg", "0deg", "20deg", "0deg"],
  });

  const scale = wobbleAnimation.interpolate({
    inputRange: [-1, 0, 1, 10],
    outputRange: [1, 1, 1, 1.15],
  });

  return (
    <TouchableOpacity
      onPress={startCaptureAnimation}
      activeOpacity={0.7}
      disabled={capturing}
    >
      <Animated.View
        style={[Styles.container, { transform: [{ rotate }, { scale }] }]}
      >
        <View style={Styles.centerLine} />
        <View style={Styles.outerCenterCircle}>
          <View style={Styles.innerCenterCircle} />
        </View>
        <Animated.View
          style={[Styles.successIndicator, { opacity: successOpacity }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
