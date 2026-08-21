import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../../theme";
import { formatCents } from "../../../lib/money";
import { resolveImageUrl } from "../../../lib/resolveImageUrl";
import { Product } from "../../../types";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View>
        <Image source={{ uri: resolveImageUrl(product.imageUrl) }} style={styles.image} resizeMode="cover" />
        {outOfStock ? (
          <View style={styles.badge}>
            <Text style={[typography.caption, styles.badgeText]}>Out of stock</Text>
          </View>
        ) : null}
      </View>
      <Text style={[typography.bodyMedium, styles.name]} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={[typography.caption, styles.price]}>{formatCents(product.price)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: "47%", marginBottom: spacing.lg },
  pressed: { opacity: 0.8 },
  image: { width: "100%", height: 140, borderRadius: radii.md, backgroundColor: colors.skeleton },
  badge: {
    position: "absolute",
    left: spacing.sm,
    top: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { color: colors.white },
  name: { marginTop: spacing.sm, color: colors.text },
  price: { marginTop: 2, color: colors.textMuted },
});
