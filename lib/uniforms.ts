import type { SchoolLevel, UniformItem } from "./types";

export const UNIFORM_ITEMS: UniformItem[] = [
  {
    id: "u1",
    name: "School shirt / blouse",
    description: "White or school-color shirt",
    level: "both",
    price: 28000,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "u2",
    name: "Trousers / skirt",
    description: "School trousers or skirt",
    level: "both",
    price: 32000,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "u3",
    name: "Sweater / jersey",
    description: "School sweater with emblem",
    level: "both",
    price: 45000,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "u4",
    name: "School tie",
    description: "School tie (secondary)",
    level: "secondary",
    price: 8000,
    sizes: ["One size"],
  },
  {
    id: "u5",
    name: "School socks",
    description: "Pack of 2 pairs of school socks",
    level: "both",
    price: 12000,
    sizes: ["S", "M", "L"],
  },
  {
    id: "u6",
    name: "School shoes",
    description: "Black school shoes",
    level: "both",
    price: 55000,
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
  },
  {
    id: "u7",
    name: "PE kit (sports)",
    description: "Sports T-shirt and shorts",
    level: "both",
    price: 38000,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "u8",
    name: "Full uniform set",
    description: "Complete set: shirt, trousers/skirt, sweater",
    level: "both",
    price: 95000,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

export function itemsForLevel(level: SchoolLevel): UniformItem[] {
  return UNIFORM_ITEMS.filter(
    (u) => u.level === "both" || u.level === level,
  );
}
