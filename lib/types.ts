export type SchoolLevel = "primary" | "secondary";

export interface Student {
  id: string;
  fullName: string;
  className: string;
  level: SchoolLevel;
}

export interface UniformItem {
  id: string;
  name: string;
  description: string;
  level: SchoolLevel | "both";
  price: number;
  sizes: string[];
}

export interface CartSelection {
  itemId: string;
  size: string;
  quantity: number;
}

export type PaymentMethod = "cash" | "mobile" | "bank";

export interface Receipt {
  receiptNo: string;
  paidAt: string;
  student: Student;
  lines: { name: string; size: string; quantity: number; unitPrice: number; subtotal: number }[];
  total: number;
  paymentMethod: PaymentMethod;
}

export type StepId =
  | "student-id"
  | "select-uniform"
  | "invoice"
  | "payment"
  | "receipt";
