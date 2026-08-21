import React from "react";
import { ScrollView } from "react-native";
import { Chip } from "../../../components/Chip";
import { spacing } from "../../../theme";

interface CategoryChipRowProps {
  categories: string[];
  selected?: string;
  onSelect: (category?: string) => void;
}

export function CategoryChipRow({ categories, selected, onSelect }: CategoryChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}
    >
      <Chip label="All" selected={!selected} onPress={() => onSelect(undefined)} />
      {categories.map((category) => (
        <Chip key={category} label={category} selected={selected === category} onPress={() => onSelect(category)} />
      ))}
    </ScrollView>
  );
}
