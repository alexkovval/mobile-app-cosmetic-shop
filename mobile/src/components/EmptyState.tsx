import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Reused for "no products match," "your cart is empty," "no orders yet," etc. */
export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.subtitle, styles.title]}>{title}</Text>
      {message ? <Text style={[typography.body, styles.message]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="outline" style={{ marginTop: spacing.lg }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  title: { color: colors.text, textAlign: "center" },
  message: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xs },
});
