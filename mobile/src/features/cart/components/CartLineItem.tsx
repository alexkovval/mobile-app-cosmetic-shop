import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { formatCents } from "../../../lib/money";
import { resolveImageUrl } from "../../../lib/resolveImageUrl";
import { colors, radii, spacing, typography } from "../../../theme";
import { CartItem } from "../../../types";

interface CartLineItemProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  /** True while a mutation for THIS specific line is in flight. */
  busy?: boolean;
}

export function CartLineItem({ item, onIncrement, onDecrement, onRemove, busy }: CartLineItemProps) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: resolveImageUrl(item.product.imageUrl) }} style={styles.image} resizeMode="cover" />
      <View style={styles.details}>
        <Text style={typography.bodyMedium} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={[typography.caption, styles.price]}>{formatCents(item.product.price)}</Text>

        <View style={styles.controls}>
          <Pressable onPress={onDecrement} disabled={busy} style={[styles.stepperButton, busy && styles.disabled]}>
            <Text style={styles.stepperText}>−</Text>
          </Pressable>
          <Text style={[typography.bodyMedium, styles.quantity]}>{item.quantity}</Text>
          <Pressable onPress={onIncrement} disabled={busy} style={[styles.stepperButton, busy && styles.disabled]}>
            <Text style={styles.stepperText}>+</Text>
          </Pressable>

          <Pressable onPress={onRemove} disabled={busy} style={styles.removeButton}>
            <Text style={[typography.caption, styles.removeText]}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  image: { width: 72, height: 72, borderRadius: radii.md, backgroundColor: colors.skeleton },
  details: { flex: 1, marginLeft: spacing.md, justifyContent: "center" },
  price: { color: colors.textMuted, marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: { fontSize: 16, color: colors.text },
  quantity: { marginHorizontal: spacing.md, minWidth: 16, textAlign: "center" },
  removeButton: { marginLeft: spacing.lg },
  removeText: { color: colors.error },
  disabled: { opacity: 0.4 },
});
