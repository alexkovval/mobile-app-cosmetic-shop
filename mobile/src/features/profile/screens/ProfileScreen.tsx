import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { Screen } from "../../../components/Screen";
import { useAuthStore } from "../../../state/authStore";
import { colors, spacing, typography } from "../../../theme";

// Basic account info + logout — intentionally minimal per
// ARCHITECTURE_PLAN.md §12 (profile editing is out of MVP scope).
export function ProfileScreen() {
  const { user, clearSession } = useAuthStore();

  return (
    <Screen style={styles.container}>
      <Text style={typography.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={typography.subtitle}>{user?.name}</Text>
        <Text style={[typography.body, styles.muted]}>{user?.email}</Text>
      </View>
      <Button title="Log out" variant="outline" onPress={() => clearSession()} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muted: { color: colors.textMuted, marginTop: spacing.xs },
});
