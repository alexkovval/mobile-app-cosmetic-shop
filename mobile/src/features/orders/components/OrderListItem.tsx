import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDate } from "../../../lib/formatDate";
import { formatCents } from "../../../lib/money";
import { colors, radii, spacing, typography } from "../../../theme";
import { Order } from "../../../types";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function OrderListItem({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.row}>
        <Text style={[typography.bodyMedium, styles.orderId]}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
      <Text style={[typography.caption, styles.date]}>{formatDate(order.createdAt)}</Text>
      <Text style={[typography.subtitle, styles.total]}>{formatCents(order.total)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { color: colors.text },
  date: { color: colors.textMuted, marginTop: spacing.xs },
  total: { marginTop: spacing.sm },
});
