import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CategoryGridSkeleton } from "../../../components/Skeleton";
import { ErrorState } from "../../../components/ErrorState";
import { Screen } from "../../../components/Screen";
import { apiErrorMessage } from "../../../lib/errors";
import { ProductsStackParamList } from "../../../navigation/types";
import { spacing, typography } from "../../../theme";
import { CategoryGrid } from "../components/CategoryGrid";
import { Hero } from "../components/Hero";
import { useCategories } from "../hooks/useCategories";

type Props = NativeStackScreenProps<ProductsStackParamList, "ProductList">;

/**
 * Home tab landing screen — mirrors the web edition's homepage
 * (cosmetics-store-web src/app/page.tsx): a full-bleed hero photo with the
 * brand title/CTA overlaid, then a "Shop by category" tile grid. Browsing
 * still lives only on the Search tab (ProductListScreen) so the two don't
 * duplicate the same list — tapping "Shop now" or a category tile just
 * jumps there, optionally pre-filtered.
 */
export function HomeScreen({ navigation }: Props) {
  const categoriesQuery = useCategories();

  // getParent() resolves the navigate() overload set to `never` here because
  // the parent's param list can't be statically inferred from this screen —
  // a known React Navigation typing limitation, not a real type error, so
  // it's cast through a plain function type like the rest of this codebase
  // casts cross-navigator calls with `as never`.
  function goToShop(category?: string) {
    const navigate = navigation.getParent()?.navigate as
      | ((screen: string, params?: object) => void)
      | undefined;
    navigate?.(
      "SearchTab",
      category ? { screen: "ProductList", params: { initialCategory: category } } : undefined
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Hero onShopNow={() => goToShop()} />

        <View style={styles.section}>
          <Text style={[typography.subtitle, styles.sectionTitle]}>Shop by category</Text>
          {categoriesQuery.isPending ? (
            <CategoryGridSkeleton />
          ) : categoriesQuery.isError ? (
            <ErrorState message={apiErrorMessage(categoriesQuery.error)} onRetry={() => categoriesQuery.refetch()} />
          ) : (
            <CategoryGrid categories={categoriesQuery.data?.categories ?? []} onSelect={goToShop} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xxl },
  section: { paddingTop: spacing.xl },
  sectionTitle: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
});
