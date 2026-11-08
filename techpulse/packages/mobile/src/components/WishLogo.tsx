import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color: string;
  accent: string;
  animated?: boolean;
}

/** Wordmark inspired by the Matcha Style poster: round, heavy, playful. Flanked by sparkle sprays. */
export function WishLogo({ size = 48, color, accent, animated = true }: Props) {
  const scale = useSharedValue(animated ? 0.6 : 1);
  const sparkle = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) return;
    scale.value = withSpring(1, { damping: 10, mass: 1, stiffness: 160 });
    sparkle.value = withDelay(250, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [animated, scale, sparkle]);

  const word = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const spark = useAnimatedStyle(() => ({ opacity: sparkle.value, transform: [{ scale: 0.6 + sparkle.value * 0.4 }] }));

  const sparkPath = "M 0 -10 L 2 -3 L 10 0 L 2 3 L 0 10 L -2 3 L -10 0 L -2 -3 Z";

  return (
    <View style={styles.row}>
      <Animated.View style={[spark, { width: size * 0.4, height: size }]}>
        <Svg width="100%" height="100%" viewBox="-12 -24 24 48">
          <Path d={sparkPath} fill={accent} transform="translate(0,-14) scale(0.5)" />
          <Path d={sparkPath} fill={accent} transform="translate(-4,0) scale(0.7)" />
          <Path d={sparkPath} fill={accent} transform="translate(4,14) scale(0.5)" />
        </Svg>
      </Animated.View>
      <Animated.Text
        style={[
          word,
          {
            fontFamily: "TitanOne",
            fontSize: size,
            color,
            letterSpacing: -size * 0.03,
            textShadowColor: accent + "55",
            textShadowOffset: { width: 0, height: size * 0.08 },
            textShadowRadius: size * 0.15,
          },
        ]}
      >
        wish
      </Animated.Text>
      <Animated.View style={[spark, { width: size * 0.4, height: size, transform: [{ scaleX: -1 }] }]}>
        <Svg width="100%" height="100%" viewBox="-12 -24 24 48">
          <Path d={sparkPath} fill={accent} transform="translate(0,-14) scale(0.5)" />
          <Path d={sparkPath} fill={accent} transform="translate(-4,0) scale(0.7)" />
          <Path d={sparkPath} fill={accent} transform="translate(4,14) scale(0.5)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

/** Small pill-shaped version used inside the header. */
export function WishMark({ color, accent, size = 20 }: { color: string; accent: string; size?: number }) {
  return (
    <View style={styles.row}>
      <Text style={{ fontFamily: "TitanOne", fontSize: size, color, letterSpacing: -size * 0.03 }}>wish</Text>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: accent, marginLeft: 4 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
