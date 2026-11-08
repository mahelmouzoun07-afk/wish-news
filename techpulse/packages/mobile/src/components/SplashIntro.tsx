import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useApp } from "@/lib/AppContext";
import { FONTS } from "@/lib/theme";
import { ShaderBackground } from "./ShaderBackground";
import { WishLogo } from "./WishLogo";

/**
 * Entrance animation (~2.3s total) :
 * 1. Shader background fades in.
 * 2. Logo springs in with a sparkle burst.
 * 3. Tagline types itself in.
 * 4. Everything exits by scaling into a soft flash that reveals the feed.
 */
export function SplashIntro({ onFinish }: { onFinish: () => void }) {
  const { theme, t } = useApp();
  const progress = useSharedValue(0);
  const tagline = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    tagline.value = withDelay(650, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    exit.value = withDelay(
      1900,
      withSequence(
        withTiming(1, { duration: 450, easing: Easing.in(Easing.cubic) }, () => {
          runOnJS(onFinish)();
        }),
      ),
    );
  }, [progress, tagline, exit, onFinish]);

  const bg = useAnimatedStyle(() => ({ opacity: progress.value * (1 - exit.value) }));
  const logo = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
    transform: [{ scale: 1 + exit.value * 1.4 }, { translateY: -exit.value * 10 }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value * (1 - exit.value),
    transform: [{ translateY: interpolate(tagline.value, [0, 1], [10, 0]) }],
  }));
  const flash = useAnimatedStyle(() => ({ opacity: interpolate(exit.value, [0, 0.6, 1], [0, 0.2, 0]) }));

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.bg }]} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFillObject, bg]}>
        <ShaderBackground palette={theme.mesh} />
      </Animated.View>
      <View style={styles.center}>
        <Animated.View style={logo}>
          <WishLogo size={92} color={theme.text} accent={theme.accent} animated />
        </Animated.View>
        <Animated.Text style={[taglineStyle, { fontFamily: FONTS.bodyBold, color: theme.textMuted, fontSize: 14, marginTop: 10, textAlign: "center", paddingHorizontal: 24 }]}>
          {t.tagline}
        </Animated.Text>
      </View>
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.text }, flash]} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
