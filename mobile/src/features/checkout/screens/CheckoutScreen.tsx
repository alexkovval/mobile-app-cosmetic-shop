import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/TextField";
import { useToast } from "../../../components/Toast";
import { apiErrorMessage } from "../../../lib/errors";
import { generateIdempotencyKey } from "../../../lib/idempotency";
import { formatCents } from "../../../lib/money";
import { CartStackParamList } from "../../../navigation/types";
import { colors, spacing, typography } from "../../../theme";
import { useCart } from "../../cart/hooks/useCart";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { estimateOrderTotals } from "../lib/estimateTotals";
import { CheckoutFormValues, checkoutSchema } from "../validation/checkoutSchemas";

type Props = NativeStackScreenProps<CartStackParamList, "Checkout">;

export function CheckoutScreen({ navigation, route }: Props) {
  const cartQuery = useCart();
  const createOrder = useCreateOrder();
  const { showToast } = useToast();

  // Generated once per checkout ATTEMPT — i.e. once per mount of this
  // screen — and reused for every retry within that attempt. This is what
  // lets "network failed, tap Place order again" land on the same order
  // instead of creating a second one; the three-layer guard from
  // ARCHITECTURE_PLAN.md §7 is this key + the isSubmitting flag below + the
  // backend's unique constraint on it. Backing all the way out to Cart and
  // starting over is a genuinely new attempt, so it correctly gets a fresh
  // key on the next mount.
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  // Layer 1: flips synchronously on tap, before any async work starts, so a
  // rapid double-tap's second press is already blocked.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
  });

  // CardScanScreen hands its (mocked) result back by navigating here with
  // new params — see navigation/types.ts — rather than a non-serializable
  // callback prop. Consume it once, then clear it so it doesn't re-fire.
  useEffect(() => {
    if (route.params?.scannedCard) {
      setValue("cardNumber", route.params.scannedCard.number, { shouldValidate: true });
      setValue("expiry", route.params.scannedCard.expiry, { shouldValidate: true });
      navigation.setParams({ scannedCard: undefined });
    }
  }, [route.params?.scannedCard, setValue, navigation]);

  const subtotal = cartQuery.data?.subtotal ?? 0;
  const totals = estimateOrderTotals(subtotal);
  const cartIsEmpty = (cartQuery.data?.items.length ?? 0) === 0;
  const busy = isSubmitting || createOrder.isPending;

  const onSubmit = handleSubmit((values) => {
    if (busy) return;
    setIsSubmitting(true);

    createOrder.mutate(
      {
        idempotencyKey: idempotencyKeyRef.current,
        shippingInfo: {
          fullName: values.fullName,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2 || undefined,
          city: values.city,
          postalCode: values.postalCode,
          country: values.country,
        },
        // Only the last 4 digits ever leave the device — see
        // backend/src/modules/orders/orders.schema.ts.
        cardLast4: values.cardNumber.slice(-4),
      },
      {
        onSuccess: (data) => {
          // replace (not navigate) so Back from the confirmation screen
          // can't land the user back on a stale checkout form.
          navigation.replace("OrderConfirmation", { order: data.order });
        },
        onError: (err) => {
          setIsSubmitting(false);
          showToast(apiErrorMessage(err));
        },
      }
    );
  });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={typography.title}>Shipping address</Text>
        <View style={styles.section}>
          <TextField control={control} name="fullName" label="Full name" autoComplete="name" />
          <TextField control={control} name="addressLine1" label="Address line 1" autoComplete="street-address" />
          <TextField control={control} name="addressLine2" label="Address line 2 (optional)" />
          <TextField control={control} name="city" label="City" />
          <TextField control={control} name="postalCode" label="Postal code" keyboardType="number-pad" />
          <TextField control={control} name="country" label="Country" />
        </View>

        <Text style={typography.title}>Payment</Text>
        <View style={styles.section}>
          <TextField
            control={control}
            name="cardNumber"
            label="Card number"
            keyboardType="number-pad"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <TextField control={control} name="expiry" label="Expiry (MM/YY)" placeholder="MM/YY" maxLength={5} />
            </View>
            <View style={styles.half}>
              <TextField
                control={control}
                name="cvv"
                label="CVV"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
              />
            </View>
          </View>
          <Button
            title="Scan card instead"
            variant="outline"
            onPress={() => navigation.navigate("CardScan")}
            style={styles.scanButton}
          />
          <Text style={[typography.caption, styles.mockNote]}>
            Demo only — no real payment is processed and no card data is stored.
          </Text>
        </View>

        <View style={styles.summary}>
          <SummaryRow label="Subtotal" value={totals.subtotal} />
          <SummaryRow label="Tax" value={totals.tax} />
          <SummaryRow label="Shipping" value={totals.shipping} />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={totals.total} bold />
        </View>

        <Button
          title={busy ? "Placing order..." : "Place order"}
          onPress={onSubmit}
          loading={busy}
          disabled={busy || cartIsEmpty}
          style={styles.placeOrder}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={bold ? typography.subtitle : typography.body}>{label}</Text>
      <Text style={bold ? typography.subtitle : typography.body}>{formatCents(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: { marginTop: spacing.md, marginBottom: spacing.lg },
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  scanButton: { marginTop: spacing.xs },
  mockNote: { color: colors.textMuted, marginTop: spacing.sm },
  summary: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  placeOrder: { marginBottom: spacing.lg },
});
