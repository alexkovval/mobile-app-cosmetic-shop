import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors, radii, spacing, typography } from "../theme";

interface ButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/**
 * The single shared button. Disabling happens SYNCHRONOUSLY via the
 * `disabled` prop the caller controls — this is what lets CheckoutScreen
 * kill double-taps before any async work starts (ARCHITECTURE_PLAN.md §7).
 */
export function Button({ title, onPress, variant = "primary", disabled, loading, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "outline" && styles.outline,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : colors.white} />
      ) : (
        <Text
          style={[
            typography.button,
            variant === "outline" ? { color: colors.primary } : { color: colors.white },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.text },
  outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
