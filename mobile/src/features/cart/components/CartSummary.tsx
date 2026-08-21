import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { formatCents } from "../../../lib/money";
import { colors, spacing, typography } from "../../../theme";

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
  disabled?: boolean;
}

export function CartSummary({ subtotal, onCheckout, disabled }: CartSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={typography.body}>Subtotal</Text>
        <Text style={typography.subtitle}>{formatCents(subtotal)}</Text>
      </View>
      <Text style={[typography.caption, styles.note]}>Tax and shipping calculated at checkout.</Text>
      <Button title="Proceed to Checkout" onPress={onCheckout} disabled={disabled} style={{ marginTop: spacing.md }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  note: { color: colors.textMuted, marginTop: spacing.xs },
});
