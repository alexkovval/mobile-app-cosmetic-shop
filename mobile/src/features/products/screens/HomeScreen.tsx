import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Button } from "../../../components/Button";
import { Screen } from "../../../components/Screen";
import { ProductsStackParamList } from "../../../navigation/types";
import { colors, spacing, typography } from "../../../theme";
import { PromoBanner } from "../components/PromoBanner";

type Props = NativeStackScreenProps<ProductsStackParamList, "ProductList">;

/**
 * Home tab landing screen — branding + the new-customer promo only, no
 * search field or product grid here by design (moved to the Search tab's
 * ProductListScreen so the two don't duplicate the same list). "Shop now"
 * is the one path from Home into browsing.
 */
export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[typography.heroTitle, styles.title]}>Bloom Beauty</Text>
        <Text style={[typography.heroSubtitle, styles.subtitle]}>
          Clean, considered skincare and makeup essentials — curated for your everyday glow.
        </Text>

        <PromoBanner />

        <Button
          title="Shop now"
          onPress={() => navigation.getParent()?.navigate("SearchTab" as never)}
          style={styles.cta}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  title: { color: colors.heroTitle },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.heroSubtitle },
  cta: { marginTop: spacing.sm },
});
