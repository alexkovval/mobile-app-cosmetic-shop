import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/TextField";
import { apiErrorMessage, isApiError } from "../../../lib/errors";
import { colors, spacing, typography } from "../../../theme";
import { AuthStackParamList } from "../../../navigation/types";
import { useLogin } from "../hooks/useLogin";
import { LoginFormValues, loginSchema } from "../validation/authSchemas";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const login = useLogin();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onError: (err) => {
        // Server-side validation errors get mapped onto the relevant field
        // where possible, per ARCHITECTURE_PLAN.md §9 — a wrong-credentials
        // 401 here is generic enough that a form-level message reads better
        // than blaming one specific field.
        if (isApiError(err) && err.kind !== "unauthorized") {
          setError("email", { message: apiErrorMessage(err) });
        }
      },
    });
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={typography.displaySmall}>Welcome back</Text>
        <Text style={[typography.body, styles.subtitle]}>Log in to continue shopping.</Text>

        <View style={styles.form}>
          <TextField
            control={control}
            name="email"
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <TextField
            control={control}
            name="password"
            label="Password"
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
          />

          {login.isError && isApiError(login.error) && login.error.kind === "unauthorized" ? (
            <Text style={[typography.caption, styles.formError]}>
              {apiErrorMessage(login.error)}
            </Text>
          ) : null}

          <Button title="Log in" onPress={onSubmit} loading={login.isPending} style={{ marginTop: spacing.sm }} />
          <Button
            title="Create an account"
            variant="outline"
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: "center" },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  form: { marginTop: spacing.md },
  formError: { color: colors.error, marginBottom: spacing.md },
});
