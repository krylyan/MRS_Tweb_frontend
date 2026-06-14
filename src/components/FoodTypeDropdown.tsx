import { UtensilsCrossed } from "lucide-react";
import { DarkMenuDropdown } from "./DarkMenuDropdown";
import type { MealItemType } from "../types/meal";

export type FoodTypeFilter = "all" | MealItemType;

const FOOD_TYPE_OPTIONS: Array<{ value: FoodTypeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "Prepared", label: "Meals" },
  { value: "Simple", label: "Products" },
];

interface FoodTypeDropdownProps {
  value: FoodTypeFilter;
  onChange: (value: FoodTypeFilter) => void;
  accent?: "emerald" | "amber";
  className?: string;
}

export function FoodTypeDropdown({
  value,
  onChange,
  accent = "emerald",
  className = "",
}: FoodTypeDropdownProps) {
  return (
    <DarkMenuDropdown
      value={value}
      options={FOOD_TYPE_OPTIONS}
      onChange={onChange}
      icon={UtensilsCrossed}
      accent={accent}
      className={className}
    />
  );
}
