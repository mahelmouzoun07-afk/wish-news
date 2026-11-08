import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export type IconName =
  | "feed" // Flux: éclair pulsé
  | "digest" // Essentiel: journal qui s'ouvre
  | "favorite" // Signet qui s'enfonce
  | "settings" // Engrenages qui tournent
  | "ai" // Noyau neuronal
  | "fintech" // Pièce qui tombe
  | "startups-us" // Fusée qui monte
  | "startups-africa" // Globe
  | "crypto" // Bitcoin
  | "tech" // Puce qui clignote
  | "innovation" // Ampoule qui s'allume
  | "search"
  | "close"
  | "chevron"
  | "share"
  | "external"
  | "back"
  | "youtube"
  | "article"
  | "sun"
  | "moon"
  | "sparkle"
  | "funding"
  | "live";

interface Props {
  name: IconName;
  size?: number;
  color: string;
  accent?: string;
  playing?: boolean;
  delay?: number;
}

export function AnimatedIcon({ name, size = 24, color, accent, playing = true, delay = 0 }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!playing) {
      cancelAnimation(t);
      t.value = 0;
      return;
    }
    const duration = DURATIONS[name] ?? 2400;
    t.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })), -1, false),
    );
    return () => cancelAnimation(t);
  }, [name, playing, delay, t]);

  const main = accent ?? color;
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  const Renderer = useMemo(() => RENDERERS[name], [name]);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Renderer t={t} color={color} accent={main} stroke={stroke} />
      </Svg>
    </View>
  );
}

const DURATIONS: Partial<Record<IconName, number>> = {
  feed: 1800,
  digest: 3200,
  favorite: 2600,
  settings: 6000,
  ai: 3000,
  fintech: 2800,
  "startups-us": 2600,
  "startups-africa": 8000,
  crypto: 2400,
  tech: 1400,
  innovation: 2400,
  live: 1200,
  sparkle: 2000,
};

type RenderProps = {
  t: Animated.SharedValue<number>;
  color: string;
  accent: string;
  stroke: { stroke: string; strokeWidth: number; strokeLinecap: "round"; strokeLinejoin: "round" };
};

const RENDERERS: Record<IconName, (p: RenderProps) => JSX.Element> = {
  feed: ({ t, color, accent, stroke }) => {
    // Lightning bolt that pulses with a glowing halo.
    const halo = useAnimatedProps(() => ({ r: 6 + t.value * 6, opacity: 0.6 - t.value * 0.6 }));
    const bolt = useAnimatedProps(() => ({ opacity: 0.75 + Math.abs(0.5 - t.value) * 0.5 }));
    return (
      <>
        <AnimatedCircle cx={12} cy={12} r={6} fill={accent} animatedProps={halo} />
        <AnimatedPath animatedProps={bolt} d="M13 3 L5 13 h5 l-1 8 l8-10 h-5 l1-8z" fill={accent} {...stroke} />
      </>
    );
  },
  digest: ({ t, color, accent, stroke }) => {
    // Pages flipping open like a newspaper.
    const page = useAnimatedProps(() => ({ transform: [{ rotateY: `${t.value * 80 - 40}deg` }] as never }));
    return (
      <>
        <Rect x={4} y={5} width={16} height={14} rx={1.5} fill="transparent" {...stroke} />
        <AnimatedG animatedProps={page} originX={12} originY={12}>
          <Rect x={11.5} y={5} width={0.6} height={14} fill={accent} />
        </AnimatedG>
        <Path d="M7 9 h4 M7 12 h4 M13 9 h4 M13 12 h4 M7 15 h10" stroke={color} strokeWidth={1.2} />
      </>
    );
  },
  favorite: ({ t, color, accent, stroke }) => {
    // Bookmark that gets pushed down with a little bounce.
    const bookmark = useAnimatedProps(() => ({ transform: [{ translateY: Math.sin(t.value * Math.PI * 2) * 1.2 }] as never }));
    return (
      <AnimatedG animatedProps={bookmark}>
        <Path d="M7 4 h10 v16 l-5-4 l-5 4 z" fill={accent + "33"} {...stroke} />
      </AnimatedG>
    );
  },
  settings: ({ t, color, accent }) => {
    // Two meshing gears rotating in opposite directions.
    const left = useAnimatedProps(() => ({ transform: [{ rotate: `${t.value * 360}deg` }] as never }));
    const right = useAnimatedProps(() => ({ transform: [{ rotate: `${-t.value * 360}deg` }] as never }));
    const gear =
      "M0 -6 L1.2 -5 L2.5 -5.5 L3 -4 L4.5 -3.5 L4 -2 L5 -1 L5 1 L4 2 L4.5 3.5 L3 4 L2.5 5.5 L1.2 5 L0 6 L-1.2 5 L-2.5 5.5 L-3 4 L-4.5 3.5 L-4 2 L-5 1 L-5 -1 L-4 -2 L-4.5 -3.5 L-3 -4 L-2.5 -5.5 L-1.2 -5 Z";
    return (
      <>
        <AnimatedG animatedProps={left} originX={9} originY={10}>
          <G translateX={9} translateY={10}>
            <Path d={gear} fill={color} />
            <Circle cx={0} cy={0} r={2} fill={accent} />
          </G>
        </AnimatedG>
        <AnimatedG animatedProps={right} originX={17} originY={16}>
          <G translateX={17} translateY={16} scale={0.7}>
            <Path d={gear} fill={accent} />
            <Circle cx={0} cy={0} r={2} fill={color} />
          </G>
        </AnimatedG>
      </>
    );
  },
  ai: ({ t, accent, color }) => {
    // Neural node with orbiting satellites.
    const orbit = useAnimatedProps(() => ({ transform: [{ rotate: `${t.value * 360}deg` }] as never }));
    const pulse = useAnimatedProps(() => ({ r: 3 + Math.sin(t.value * Math.PI * 2) * 1.2 }));
    return (
      <>
        <AnimatedG animatedProps={orbit} originX={12} originY={12}>
          <Circle cx={12} cy={4} r={1.6} fill={accent} />
          <Circle cx={20} cy={12} r={1.6} fill={color} />
          <Circle cx={12} cy={20} r={1.6} fill={accent} />
          <Circle cx={4} cy={12} r={1.6} fill={color} />
          <Path d="M12 4 L12 20 M4 12 L20 12 M6 6 L18 18 M18 6 L6 18" stroke={color} strokeWidth={0.8} opacity={0.4} />
        </AnimatedG>
        <AnimatedCircle cx={12} cy={12} animatedProps={pulse} fill={accent} />
      </>
    );
  },
  fintech: ({ t, accent, color, stroke }) => {
    // Coin falling into place with ripples.
    const coin = useAnimatedProps(() => ({ transform: [{ translateY: -4 + t.value * 4 }, { scale: 1 - t.value * 0.05 }] as never }));
    const ring = useAnimatedProps(() => ({ r: 6 + t.value * 4, opacity: 0.4 - t.value * 0.4 }));
    return (
      <>
        <AnimatedCircle cx={12} cy={14} r={6} fill="transparent" stroke={accent} strokeWidth={1.5} animatedProps={ring} />
        <AnimatedG animatedProps={coin}>
          <Circle cx={12} cy={12} r={6} fill={accent} />
          <Path d="M10 9 h3 a2 2 0 1 1 0 4 h-3 M10 9 v8 M10 13 h3 a2 2 0 1 1 0 4 h-3" {...stroke} stroke={color} />
        </AnimatedG>
      </>
    );
  },
  "startups-us": ({ t, accent, color, stroke }) => {
    // Rocket climbing with trailing flame.
    const rocket = useAnimatedProps(() => ({ transform: [{ translateY: 2 - t.value * 4 }] as never }));
    const flame = useAnimatedProps(() => ({ transform: [{ scaleY: 0.5 + t.value * 1.2 }] as never, opacity: 1 - t.value * 0.4 }));
    return (
      <>
        <AnimatedG animatedProps={flame} originX={12} originY={19}>
          <Path d="M10 18 L12 22 L14 18 Z" fill={accent} />
        </AnimatedG>
        <AnimatedG animatedProps={rocket}>
          <Path d="M12 2 C 15 6, 15 12, 12 17 C 9 12, 9 6, 12 2 Z" fill={accent} {...stroke} />
          <Circle cx={12} cy={9} r={1.6} fill={color} />
          <Path d="M9 14 L7 18 L10 16 Z M15 14 L17 18 L14 16 Z" fill={accent} opacity={0.7} />
        </AnimatedG>
      </>
    );
  },
  "startups-africa": ({ t, accent, color }) => {
    // Rotating globe with meridians, a dot blinking on West Africa.
    const spin = useAnimatedProps(() => ({ transform: [{ rotate: `${t.value * 360}deg` }] as never }));
    const blink = useAnimatedProps(() => ({ opacity: 0.4 + Math.abs(0.5 - t.value) }));
    return (
      <>
        <Circle cx={12} cy={12} r={9} fill={accent + "22"} stroke={color} strokeWidth={1.2} />
        <AnimatedG animatedProps={spin} originX={12} originY={12}>
          <Path d="M3 12 h18 M12 3 v18 M5 6 C 9 9, 15 9, 19 6 M5 18 C 9 15, 15 15, 19 18" stroke={color} strokeWidth={0.9} fill="transparent" />
        </AnimatedG>
        <AnimatedCircle cx={10} cy={13} r={1.8} fill={accent} animatedProps={blink} />
      </>
    );
  },
  crypto: ({ t, accent, color, stroke }) => {
    const pulse = useAnimatedProps(() => ({ transform: [{ scale: 0.95 + Math.sin(t.value * Math.PI * 2) * 0.08 }] as never }));
    return (
      <AnimatedG animatedProps={pulse} originX={12} originY={12}>
        <Circle cx={12} cy={12} r={9} fill={accent} />
        <Path d="M9 7 v10 M11 7 v10 M8 10 h5 a2 2 0 0 1 0 4 h-5 M8 14 h6 a2 2 0 0 1 0 4 h-6" {...stroke} stroke={color} />
      </AnimatedG>
    );
  },
  tech: ({ t, accent, color }) => {
    const blink = useAnimatedProps(() => ({ opacity: 0.5 + Math.abs(0.5 - t.value) * 1 }));
    return (
      <>
        <Rect x={6} y={6} width={12} height={12} rx={1.5} fill={accent + "33"} stroke={color} strokeWidth={1.5} />
        <Path d="M9 3 v3 M12 3 v3 M15 3 v3 M9 18 v3 M12 18 v3 M15 18 v3 M3 9 h3 M3 12 h3 M3 15 h3 M18 9 h3 M18 12 h3 M18 15 h3" stroke={color} strokeWidth={1.2} />
        <AnimatedRect x={9} y={9} width={6} height={6} rx={1} fill={accent} animatedProps={blink} />
      </>
    );
  },
  innovation: ({ t, accent, color, stroke }) => {
    // Lightbulb filament glowing up and down.
    const glow = useAnimatedProps(() => ({ opacity: 0.3 + t.value * 0.7 }));
    return (
      <>
        <Path d="M9 16 h6 M10 19 h4" {...stroke} stroke={color} />
        <Path d="M12 3 C 7 3, 5 7, 7 11 C 8 13, 9 14, 9 16 h6 c 0 -2, 1 -3, 2 -5 C 19 7, 17 3, 12 3 Z" fill="transparent" {...stroke} stroke={color} />
        <AnimatedPath animatedProps={glow} d="M12 3 C 7 3, 5 7, 7 11 C 8 13, 9 14, 9 16 h6 c 0 -2, 1 -3, 2 -5 C 19 7, 17 3, 12 3 Z" fill={accent} />
      </>
    );
  },
  search: ({ stroke, color }) => (
    <>
      <Circle cx={10.5} cy={10.5} r={6.5} fill="transparent" {...stroke} stroke={color} />
      <Path d="M15 15 L20 20" {...stroke} stroke={color} />
    </>
  ),
  close: ({ stroke, color }) => <Path d="M5 5 L19 19 M19 5 L5 19" {...stroke} stroke={color} />,
  chevron: ({ stroke, color }) => <Path d="M9 6 L15 12 L9 18" {...stroke} stroke={color} />,
  share: ({ stroke, color, accent }) => (
    <>
      <Circle cx={6} cy={12} r={2.5} fill={accent} />
      <Circle cx={18} cy={6} r={2.5} fill={color} {...stroke} stroke={color} />
      <Circle cx={18} cy={18} r={2.5} fill={color} {...stroke} stroke={color} />
      <Path d="M8 11 L16 7 M8 13 L16 17" {...stroke} stroke={color} />
    </>
  ),
  external: ({ stroke, color }) => (
    <>
      <Path d="M14 4 h6 v6" {...stroke} stroke={color} />
      <Path d="M20 4 L12 12" {...stroke} stroke={color} />
      <Path d="M18 13 v6 a1 1 0 0 1 -1 1 h-12 a1 1 0 0 1 -1 -1 v-12 a1 1 0 0 1 1 -1 h6" {...stroke} stroke={color} />
    </>
  ),
  back: ({ stroke, color }) => <Path d="M15 6 L9 12 L15 18" {...stroke} stroke={color} />,
  youtube: ({ accent, color }) => (
    <>
      <Rect x={2} y={6} width={20} height={12} rx={3} fill={accent} />
      <Path d="M10 9 L16 12 L10 15 Z" fill={color} />
    </>
  ),
  article: ({ stroke, color, accent }) => (
    <>
      <Rect x={5} y={3} width={14} height={18} rx={1.5} fill={accent + "22"} {...stroke} stroke={color} />
      <Path d="M8 8 h8 M8 12 h8 M8 16 h5" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </>
  ),
  sun: ({ t, accent, color }) => {
    const spin = useAnimatedProps(() => ({ transform: [{ rotate: `${t.value * 360}deg` }] as never }));
    return (
      <>
        <AnimatedG animatedProps={spin} originX={12} originY={12}>
          <Path
            d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5"
            stroke={accent}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </AnimatedG>
        <Circle cx={12} cy={12} r={4.5} fill={accent} />
        <Circle cx={12} cy={12} r={3} fill={color} opacity={0.15} />
      </>
    );
  },
  moon: ({ accent, color }) => (
    <>
      <Path d="M15 3 A 9 9 0 1 0 21 15 C 16 15, 11 10, 15 3 Z" fill={accent} />
      <Circle cx={18} cy={8} r={0.6} fill={color} />
      <Circle cx={16} cy={5} r={0.4} fill={color} />
    </>
  ),
  sparkle: ({ t, accent, color }) => {
    const twinkle = useAnimatedProps(() => ({ transform: [{ scale: 0.6 + t.value * 0.6 }] as never, opacity: 0.4 + t.value * 0.6 }));
    return (
      <>
        <AnimatedG animatedProps={twinkle} originX={12} originY={12}>
          <Path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" fill={accent} />
        </AnimatedG>
        <Circle cx={5} cy={5} r={0.8} fill={color} />
        <Circle cx={20} cy={19} r={0.6} fill={color} />
      </>
    );
  },
  funding: ({ accent, color, stroke }) => (
    <>
      <Path d="M4 20 L10 12 L14 16 L20 6" {...stroke} stroke={accent} />
      <Path d="M20 10 V 6 H 16" {...stroke} stroke={accent} />
      <Circle cx={10} cy={12} r={1.4} fill={color} />
      <Circle cx={14} cy={16} r={1.4} fill={color} />
    </>
  ),
  live: ({ t, accent, color }) => {
    const pulse = useAnimatedProps(() => ({ r: 3 + t.value * 2, opacity: 1 - t.value }));
    const ring = useAnimatedProps(() => ({ r: 5 + t.value * 5, opacity: 0.5 - t.value * 0.5 }));
    return (
      <>
        <AnimatedCircle cx={12} cy={12} animatedProps={ring} fill="transparent" stroke={accent} strokeWidth={1.4} />
        <AnimatedCircle cx={12} cy={12} animatedProps={pulse} fill={accent} />
        <Circle cx={12} cy={12} r={3} fill={accent} />
      </>
    );
  },
};
