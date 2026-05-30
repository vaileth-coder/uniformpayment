import type { Student } from "./types";

/** Demo students — use IDs: STU001, STU002, STU003, STU004 */
export const DEMO_STUDENTS: Student[] = [
  {
    id: "STU001",
    fullName: "Amina Hassan Juma",
    className: "Grade 5",
    level: "primary",
  },
  {
    id: "STU002",
    fullName: "John Michael Mwenda",
    className: "Form 2",
    level: "secondary",
  },
  {
    id: "STU003",
    fullName: "Neema Godfrey Lyimo",
    className: "Grade 7",
    level: "primary",
  },
  {
    id: "STU004",
    fullName: "Kelvin Peter Msigwa",
    className: "Form 4",
    level: "secondary",
  },
];

export const allStudents = [...DEMO_STUDENTS];

export function findStudent(id: string): Student | null {
  const norm = id.trim().toUpperCase();
  return allStudents.find((s) => s.id === norm) ?? null;
}

export function registerStudent(student: Student) {
  allStudents.push(student);
}
