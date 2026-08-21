import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii } from "../theme";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** A single pulsing placeholder block — deliberately simple, no animation library. */
export function Skeleton({ width = "100%", height = 16, radius = radii.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
    />
  );
}

/** Grid of ProductCard-shaped skeletons for ProductListScreen's loading state. */
export function ProductGridSkeleton() {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton height={140} radius={radii.md} />
          <Skeleton height={14} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={14} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 16 },
  card: { width: "47%" },
});
