import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { colors, radii, spacing, typography } from "../theme";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Reserved for transient, non-blocking notices only (e.g. "showing cached
 * cart data") — per ARCHITECTURE_PLAN.md §9, anything blocking gets an
 * ErrorState instead, since a toast can disappear before it's read.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(msg);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
          setMessage(null)
        );
      }, 2500);
    },
    [opacity]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
          <Text style={[typography.body, styles.text]}>{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    maxWidth: "85%",
  },
  text: { color: colors.white, textAlign: "center" },
});
