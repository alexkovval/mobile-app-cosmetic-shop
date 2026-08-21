import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../../components/Button";
import { ErrorState } from "../../../components/ErrorState";
import { Skeleton } from "../../../components/Skeleton";
import { useToast } from "../../../components/Toast";
import { useAddToCart } from "../../cart/hooks/useAddToCart";
import { apiErrorMessage } from "../../../lib/errors";
import { formatCents } from "../../../lib/money";
import { resolveImageUrl } from "../../../lib/resolveImageUrl";
import { ProductsStackParamList } from "../../../navigation/types";
import { colors, radii, spacing, typography } from "../../../theme";
import { useProduct } from "../hooks/useProduct";

type Props = NativeStackScreenProps<ProductsStackParamList, "ProductDetail">;

// This screen keeps its native header (headerShown: true in
// MainTabNavigator.tsx) — React Navigation already handles the top safe
// area for it, so it deliberately does NOT use the shared <Screen> wrapper
// (which would double the top inset).
export function ProductDetailScreen({ route }: Props) {
  const { productId } = route.params;
  const productQuery = useProduct(productId);
  const addToCart = useAddToCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (productQuery.isPending) {
    return (
      <View style={[styles.flex, styles.padded]}>
        <Skeleton height={260} radius={radii.lg} />
        <Skeleton height={22} width="70%" style={{ marginTop: spacing.lg }} />
        <Skeleton height={16} width="40%" style={{ marginTop: spacing.sm }} />
      </View>
    );
  }

  if (productQuery.isError) {
    return (
      <View style={styles.flex}>
        <ErrorState message={apiErrorMessage(productQuery.error)} onRetry={() => productQuery.refetch()} />
      </View>
    );
  }

  const { product } = productQuery.data;
  const outOfStock = product.stock === 0;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.padded}>
        <Image source={{ uri: resolveImageUrl(product.imageUrl) }} style={styles.image} resizeMode="cover" />
        <Text style={[typography.title, styles.name]}>{product.name}</Text>
        <Text style={[typography.subtitle, styles.price]}>{formatCents(product.price)}</Text>
        <Text style={[typography.body, styles.description]}>{product.description}</Text>

        <Text style={[typography.caption, outOfStock ? styles.outOfStock : styles.inStock]}>
          {outOfStock ? "Out of stock" : `${product.stock} in stock`}
        </Text>

        {!outOfStock ? (
          <View style={styles.quantityRow}>
            <Button title="−" variant="outline" onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={styles.qtyButton} />
            <Text style={[typography.subtitle, styles.qtyValue]}>{quantity}</Text>
            <Button
              title="+"
              variant="outline"
              onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              style={styles.qtyButton}
            />
          </View>
        ) : null}

        <Button
          title={outOfStock ? "Out of stock" : "Add to cart"}
          disabled={outOfStock}
          loading={addToCart.isPending}
          onPress={() =>
            addToCart.mutate(
              { productId: product.id, quantity },
              {
                onSuccess: () => showToast(`Added ${quantity} × ${product.name} to cart`),
                onError: (err) => showToast(apiErrorMessage(err)),
              }
            )
          }
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  padded: { padding: spacing.lg },
  image: { width: "100%", height: 260, borderRadius: radii.lg, backgroundColor: colors.skeleton },
  name: { marginTop: spacing.lg },
  price: { marginTop: spacing.xs, color: colors.primary },
  description: { marginTop: spacing.md, color: colors.textMuted, lineHeight: 21 },
  outOfStock: { color: colors.error, marginTop: spacing.sm },
  inStock: { color: colors.textMuted, marginTop: spacing.sm },
  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg },
  qtyButton: { width: 44, paddingHorizontal: 0 },
  qtyValue: { marginHorizontal: spacing.lg },
});
