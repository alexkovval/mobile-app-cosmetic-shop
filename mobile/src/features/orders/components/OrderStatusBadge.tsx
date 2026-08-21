import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../../../theme";
import { OrderStatus } from "../../../types";

const STATUS_STYLE: Record<OrderStatus, { bg: string; fg: string; label: string }> = {
  paid: { bg: colors.successMuted, fg: colors.success, label: "Paid" },
  pending: { bg: colors.warningMuted, fg: colors.warning, label: "Pending" },
  failed: { bg: colors.errorMuted, fg: colors.error, label: "Failed" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { bg, fg, label } = STATUS_STYLE[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[typography.caption, styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: { fontWeight: "600" },
});
