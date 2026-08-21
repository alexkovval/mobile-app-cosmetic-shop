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
import { useRegister } from "../hooks/useRegister";
import { RegisterFormValues, registerSchema } from "../validation/authSchemas";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const register = useRegister();
  const {
    control,
    handleSubmit,
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    register.mutate(values, {
      onError: (err) => {
        // "Email already registered" maps onto the email field specifically —
        // the one case in this app's error handling where the server error
        // has an obvious owning field. See ARCHITECTURE_PLAN.md §9.
        if (isApiError(err) && err.kind === "conflict") {
          setError("email", { message: apiErrorMessage(err) });
        }
      },
    });
  });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={typography.displaySmall}>Create your account</Text>
        <Text style={[typography.body, styles.subtitle]}>Just a few details to get started.</Text>

        <View style={styles.form}>
          <TextField control={control} name="name" label="Name" placeholder="Jane Doe" autoComplete="name" />
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
            autoComplete="password-new"
            placeholder="At least 8 characters"
          />

          {register.isError && !(isApiError(register.error) && register.error.kind === "conflict") ? (
            <Text style={[typography.caption, styles.formError]}>
              {apiErrorMessage(register.error)}
            </Text>
          ) : null}

          <Button
            title="Create account"
            onPress={onSubmit}
            loading={register.isPending}
            style={{ marginTop: spacing.sm }}
          />
          <Button
            title="Back to login"
            variant="outline"
            onPress={() => navigation.navigate("Login")}
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
