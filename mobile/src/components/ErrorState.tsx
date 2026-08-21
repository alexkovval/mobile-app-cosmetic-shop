import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";
import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * The one place "couldn't reach the server" gets rendered. Always paired
 * with a retry action wired to the query's refetch() — see
 * ARCHITECTURE_PLAN.md §9 (blocking issues get an ErrorState, not a toast).
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.subtitle, styles.title]}>Something went wrong</Text>
      <Text style={[typography.body, styles.message]}>{message}</Text>
      {onRetry ? <Button title="Retry" onPress={onRetry} style={{ marginTop: spacing.lg }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  title: { color: colors.error, textAlign: "center" },
  message: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xs },
});
