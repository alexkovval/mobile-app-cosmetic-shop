import { QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ToastProvider } from "./src/components/Toast";
import { queryClient } from "./src/lib/queryClient";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuthStore } from "./src/state/authStore";

// No custom font to load anymore — the Home screen's serif wordmark
// (Playfair Display) went away with the warm/pink beauty theme in favor of
// the web edition's plain system-font look (see theme/typography.ts), so
// there's no async font-loading gate to wait on before the first render.
export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
