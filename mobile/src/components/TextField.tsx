import React from "react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme";

interface TextFieldProps<TForm extends FieldValues> extends Omit<TextInputProps, "value" | "onChangeText"> {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label: string;
}

/**
 * Wraps RHF's Controller so every form (login, register, shipping, card)
 * gets inline field-level errors from the same Zod schema that gates
 * submission — see ARCHITECTURE_PLAN.md §6/§9. Uncontrolled-by-RHF means
 * only this field re-renders per keystroke, not the whole screen.
 */
export function TextField<TForm extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: TextFieldProps<TForm>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={[typography.caption, styles.label]}>{label}</Text>
          <TextInput
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            style={[styles.input, error && styles.inputError]}
            placeholderTextColor={colors.textMuted}
            {...inputProps}
          />
          {error ? <Text style={[typography.caption, styles.errorText]}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { color: colors.textMuted, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, marginTop: spacing.xs },
});
