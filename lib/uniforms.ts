import type { SchoolLevel, UniformItem } from "./types";

export const UNIFORM_ITEMS: UniformItem[] = [
  {
    id: "u1",
    name: "Shati / blouse ya shule",
    description: "Shati nyeupe au rangi ya shule",
    level: "both",
    price: 28000,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "u2",
    name: "Suruali / sketi",
    description: "Suruali au sketi ya shule",
    level: "both",
    price: 32000,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "u3",
    name: "Sweta / jersey",
    description: "Sweta ya shule yenye nembo",
    level: "both",
    price: 45000,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "u4",
    name: "Tie / tai",
    description: "Tai ya shule (sekondari)",
    level: "secondary",
    price: 8000,
    sizes: ["Moja"],
  },
  {
    id: "u5",
    name: "Socks / soksi",
    description: "Jozi 2 za soksi za shule",
    level: "both",
    price: 12000,
    sizes: ["S", "M", "L"],
  },
  {
    id: "u6",
    name: "Shoes / viatu vya shule",
    description: "Viatu vyeusi vya shule",
    level: "both",
    price: 55000,
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
  },
  {
    id: "u7",
    name: "PE kit (michezo)",
    description: "T-shirt na suruali ya michezo",
    level: "both",
    price: 38000,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "u8",
    name: "Sare kamili (seti)",
    description: "Seti kamili: shati, suruali/sketi, sweta",
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
