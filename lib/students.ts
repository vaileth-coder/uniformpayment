import type { Student } from "./types";

/** Wanafunzi wa mfano — tumia ID: STU001, STU002, STU003 */
export const DEMO_STUDENTS: Student[] = [
  {
    id: "STU001",
    fullName: "Amina Hassan Juma",
    className: "Darasa la 5",
    level: "primary",
  },
  {
    id: "STU002",
    fullName: "John Michael Mwenda",
    className: "Kidato cha 2",
    level: "secondary",
  },
  {
    id: "STU003",
    fullName: "Neema Godfrey Lyimo",
    className: "Darasa la 7",
    level: "primary",
  },
  {
    id: "STU004",
    fullName: "Kelvin Peter Msigwa",
    className: "Kidato cha 4",
    level: "secondary",
  },
];

export function findStudent(id: string): Student | null {
  const norm = id.trim().toUpperCase();
  return DEMO_STUDENTS.find((s) => s.id === norm) ?? null;
}
