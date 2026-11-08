import { useEffect, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, G, RadialGradient, Rect, Stop } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);

interface Props {
  palette: [string, string, string, string];
  intensity?: number;
}

/** Aurora mesh gradient: three bleeding radial blobs drifting in a smooth loop. */
export function ShaderBackground({ palette, intensity = 1 }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [t]);

  // Three blobs follow phase-shifted sine paths — the last frame matches the first for a seamless loop.
  const blobA = useAnimatedProps(() => ({
    transform: [
      { translateX: Math.sin(t.value * Math.PI * 2) * 60 },
      { translateY: Math.cos(t.value * Math.PI * 2) * 40 },
    ] as never,
  }));
  const blobB = useAnimatedProps(() => ({
    transform: [
      { translateX: Math.cos(t.value * Math.PI * 2 + 1.5) * 70 },
      { translateY: Math.sin(t.value * Math.PI * 2 + 1.5) * 50 },
    ] as never,
  }));
  const blobC = useAnimatedProps(() => ({
    transform: [
      { translateX: Math.sin(t.value * Math.PI * 2 + 3) * 50 },
      { translateY: Math.cos(t.value * Math.PI * 2 + 3) * 60 },
    ] as never,
  }));

  const grainDots = useMemo(() => {
    // A sparse static grain layer to break the gradient banding.
    const dots: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 70; i++) {
      dots.push({ x: Math.random() * 400, y: Math.random() * 600, r: Math.random() * 0.8 + 0.2 });
    }
    return dots;
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg
        style={StyleSheet.absoluteFillObject}
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <RadialGradient id="g0" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={palette[0]} stopOpacity={0.9 * intensity} />
            <Stop offset="1" stopColor={palette[0]} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g1" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={palette[1]} stopOpacity={0.85 * intensity} />
            <Stop offset="1" stopColor={palette[1]} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g2" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={palette[2]} stopOpacity={0.85 * intensity} />
            <Stop offset="1" stopColor={palette[2]} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={600} fill={palette[3]} />
        <AnimatedG animatedProps={blobA}>
          <Circle cx={120} cy={160} r={260} fill="url(#g0)" />
        </AnimatedG>
        <AnimatedG animatedProps={blobB}>
          <Circle cx={320} cy={260} r={300} fill="url(#g1)" />
        </AnimatedG>
        <AnimatedG animatedProps={blobC}>
          <Circle cx={200} cy={460} r={280} fill="url(#g2)" />
        </AnimatedG>
        {grainDots.map((d, i) => (
          <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={0.12} />
        ))}
      </Svg>
    </View>
  );
}
