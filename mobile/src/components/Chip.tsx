import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing, typography } from "../theme";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      <Text style={[typography.caption, styles.labelBase, selected ? styles.labelSelected : styles.label]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    // Fixed height (not minHeight) + alignSelf so this chip can't be
    // stretched taller by the parent ScrollView row's default cross-axis
    // "stretch" behavior — that stretch was the actual cause of the
    // selected chip rendering visibly taller/more oval than its siblings.
    alignSelf: "flex-start",
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  labelBase: { includeFontPadding: false },
  label: { color: colors.text },
  labelSelected: { color: colors.white, fontWeight: "600" },
});
