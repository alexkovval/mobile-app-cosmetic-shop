import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../../../theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, autoFocus }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search products..."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
});
