import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { Styles } from "./styles";

const BALL_SIZE = 36;
const DURATION = 500;

function PulseBall({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: DURATION,
          useNativeDriver: true,
        }),
        Animated.delay((2 - delay / DURATION) * DURATION),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      <View
        style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: BALL_SIZE / 2,
          borderWidth: 2,
          borderColor: "#FF3333",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "transparent",
          shadowColor: "#FF3333",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: 2,
            backgroundColor: "#FF3333",
          }}
        />
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "#0A0A0C",
            borderWidth: 2,
            borderColor: "#FF3333",
            zIndex: 10,
          }}
        />
      </View>
    </Animated.View>
  );
}

export function PokeballLoading() {
  return (
    <View style={Styles.container}>
      <View style={Styles.row}>
        <PulseBall delay={0} />
        <PulseBall delay={DURATION} />
        <PulseBall delay={DURATION * 2} />
      </View>
    </View>
  );
}
