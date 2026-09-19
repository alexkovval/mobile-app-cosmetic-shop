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
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.text} />
      ) : (
        <Text
          style={[
            typography.button,
            variant === "primary" ? { color: colors.white } : { color: colors.text },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

// primary = solid dark (bg-neutral-900/white text), secondary = light gray
// fill (bg-neutral-100/dark text), outline = bordered only — mirrors the
// web edition's Button.tsx primary/secondary variants, plus a bordered
// style for icon-ish controls like the quantity stepper (same job as the
// web CartLineItem's `border border-neutral-300` +/- buttons).
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
  secondary: { backgroundColor: colors.surfaceMuted },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
