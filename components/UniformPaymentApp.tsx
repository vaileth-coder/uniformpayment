"use client";

import { useMemo, useState, useEffect } from "react";
import type {
  CartSelection,
  PaymentMethod,
  Receipt,
  StepId,
  Student,
} from "@/lib/types";
import { itemsForLevel, UNIFORM_ITEMS } from "@/lib/uniforms";
import { formatTzs } from "@/lib/money";

const STEPS: { id: StepId; label: string }[] = [
  { id: "student-id", label: "Student ID" },
  { id: "select-uniform", label: "Select uniform" },
  { id: "invoice", label: "Invoice" },
  { id: "payment", label: "Payment" },
  { id: "receipt", label: "Receipt" },
];

function receiptNo(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const r = Math.floor(10000 + Math.random() * 90000);
  return `UNF-${y}${m}-${r}`;
}

export function UniformPaymentApp() {
  const [step, setStep] = useState<StepId>("student-id");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartSelection[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students");
        if (res.ok) {
          const data = await res.json();
          setStudentsList(data.students || []);
        }
      } catch (e) {
        console.error("Failed to fetch students", e);
      }
    };
    fetchStudents();
  }, []);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const availableItems = useMemo(
    () => (student ? itemsForLevel(student.level) : []),
    [student],
  );

  const lineDetails = useMemo(() => {
    return cart
      .map((c) => {
        const item = UNIFORM_ITEMS.find((u) => u.id === c.itemId);
        if (!item) return null;
        const sub = item.price * c.quantity;
        return {
          item,
          size: c.size,
          quantity: c.quantity,
          sub,
        };
      })
      .filter(Boolean) as {
      item: (typeof UNIFORM_ITEMS)[0];
      size: string;
      quantity: number;
      sub: number;
    }[];
  }, [cart]);

  const total = useMemo(
    () => lineDetails.reduce((s, l) => s + l.sub, 0),
    [lineDetails],
  );

  const handleVerifyStudent = () => {
    const norm = studentIdInput.trim().toUpperCase();
    const found = studentsList.find((s) => s.id === norm);
    if (!found) {
      setIdError("Student ID not found. Please verify the ID or register the student first.");
      setStudent(null);
      return;
    }
    setIdError(null);
    setStudent(found);
    setCart([]);
    setStep("select-uniform");
  };

  const toggleItem = (itemId: string, size: string) => {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.itemId === itemId && c.size === size);
      if (i >= 0) {
        return prev.filter((_, idx) => idx !== i);
      }
      return [...prev, { itemId, size, quantity: 1 }];
    });
  };

  const isSelected = (itemId: string, size: string) =>
    cart.some((c) => c.itemId === itemId && c.size === size);

  const setLineQty = (itemId: string, size: string, qty: number) => {
    if (qty < 1) {
      setCart((prev) =>
        prev.filter((c) => !(c.itemId === itemId && c.size === size)),
      );
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.itemId === itemId && c.size === size ? { ...c, quantity: qty } : c,
      ),
    );
  };

  const confirmPayment = async () => {
    if (!student || lineDetails.length === 0) return;
    const r = {
      receiptNo: receiptNo(),
      paidAt: new Date().toISOString(),
      student,
      lines: lineDetails.map((l) => ({
        name: l.item.name,
        size: l.size,
        quantity: l.quantity,
        unitPrice: l.item.price,
        subtotal: l.sub,
      })),
      total,
      paymentMethod,
    };

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const data = await res.json();
      if (res.ok) {
        setReceipt(data.sale);
        setStep("receipt");
      } else {
        alert(data.error || "Failed to confirm payment");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to confirm payment");
    }
  };

  const startOver = () => {
    setStep("student-id");
    setStudentIdInput("");
    setStudent(null);
    setCart([]);
    setReceipt(null);
    setIdError(null);
  };

  const handleRegisterStudent = (newStudent: Student) => {
    setStudent(newStudent);
    setCart([]);
    setStep("select-uniform");
  };

  return (
    <div className="min-h-screen pb-12">
      <header className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--surface)] via-[var(--surface)] to-[var(--surface-2)]/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <h1 className="bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] bg-clip-text text-xl font-bold text-transparent">
            School Uniform Payment System
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            From Student ID to receipt
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <nav aria-label="Payment steps" className="mb-8">
          <ol className="flex flex-wrap gap-2">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const current = s.id === step;
              return (
                <li
                  key={s.id}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    current
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]/50"
                      : done
                        ? "bg-[var(--secondary-soft)] text-[var(--secondary)]"
                        : "bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      current
                        ? "bg-[var(--accent)] text-white"
                        : done
                          ? "bg-[var(--secondary)] text-white"
                          : "bg-[var(--surface-2)]"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {s.label}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl sm:p-8">
          {step === "student-id" && (
            <StudentIdStep
              value={studentIdInput}
              onChange={setStudentIdInput}
              error={idError}
              onSubmit={handleVerifyStudent}
              studentsList={studentsList}
            />
          )}

          {step === "register-student" && (
            <RegisterStudentStep
              onCancel={() => setStep("student-id")}
              onRegister={handleRegisterStudent}
            />
          )}

          {step === "select-uniform" && student && (
            <SelectUniformStep
              student={student}
              items={availableItems}
              cart={cart}
              isSelected={isSelected}
              onToggle={toggleItem}
              onQty={setLineQty}
              total={total}
              onBack={() => setStep("student-id")}
              onNext={() => {
                if (cart.length === 0) return;
                setStep("invoice");
              }}
              canNext={cart.length > 0}
            />
          )}

          {step === "invoice" && student && (
            <InvoiceStep
              student={student}
              lines={lineDetails}
              total={total}
              onBack={() => setStep("select-uniform")}
              onNext={() => setStep("payment")}
            />
          )}

          {step === "payment" && student && (
            <PaymentStep
              total={total}
              method={paymentMethod}
              onMethod={setPaymentMethod}
              onBack={() => setStep("invoice")}
              onPay={confirmPayment}
            />
          )}

          {step === "receipt" && receipt && (
            <ReceiptStep receipt={receipt} onNew={startOver} />
          )}
        </div>
      </div>
    </div>
  );
}

function StudentIdStep({
  value,
  onChange,
  error,
  onSubmit,
  studentsList,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  onSubmit: () => void;
  studentsList: Student[];
}) {
  return (
    <section aria-labelledby="step1-h">
      <h2 id="step1-h" className="text-lg font-semibold text-[var(--text)]">
        Step 1: Student ID
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Enter the student number to verify their details and continue to uniform
        selection.
      </p>
      <label className="mt-6 block">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Student ID
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="e.g. STU001"
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 font-mono text-lg tracking-wide text-[var(--text)] outline-none focus:border-[var(--accent)]"
          autoFocus
        />
      </label>
      {error ? (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--muted)]">
        <strong className="text-[var(--text)]">Sample IDs:</strong>{" "}
        {studentsList.map((s) => s.id).join(", ")}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-bold text-white hover:brightness-110 sm:w-auto sm:px-10"
        >
          Verify and continue
        </button>
      </div>
    </section>
  );
}

function RegisterStudentStep({
  onCancel,
  onRegister,
}: {
  onCancel: () => void;
  onRegister: (student: Student) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("");
  const [level, setLevel] = useState<"primary" | "secondary">("primary");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = "STU" + String(Math.floor(Math.random() * 900) + 100);
    onRegister({ id, fullName, className, level });
  };

  return (
    <section aria-labelledby="register-h">
      <h2 id="register-h" className="text-lg font-semibold text-[var(--text)]">
        Register New Student
      </h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Full Name
          </span>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
            autoFocus
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Class Name
          </span>
          <input
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Grade 1"
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            School Level
          </span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as "primary" | "secondary")}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
        </label>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[var(--accent)] px-8 py-2.5 text-sm font-bold text-white hover:brightness-110"
          >
            Register & Continue
          </button>
        </div>
      </form>
    </section>
  );
}

function SelectUniformStep({
  student,
  items,
  cart,
  isSelected,
  onToggle,
  onQty,
  total,
  onBack,
  onNext,
  canNext,
}: {
  student: Student;
  items: ReturnType<typeof itemsForLevel>;
  cart: CartSelection[];
  isSelected: (itemId: string, size: string) => boolean;
  onToggle: (itemId: string, size: string) => void;
  onQty: (itemId: string, size: string, qty: number) => void;
  total: number;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <section aria-labelledby="step2-h">
      <h2 id="step2-h" className="text-lg font-semibold text-[var(--text)]">
        Step 2: Select uniform
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--text)]">{student.fullName}</span>{" "}
        · {student.className} · ID {student.id}
      </p>
      <ul className="mt-6 space-y-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[var(--text)]">{item.name}</h3>
                <p className="text-xs text-[var(--muted)]">{item.description}</p>
              </div>
              <span className="font-bold text-[var(--secondary)]">
                {formatTzs(item.price)}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase text-[var(--muted)]">
              Select size
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.sizes.map((size) => {
                const sel = isSelected(item.id, size);
                const line = cart.find(
                  (c) => c.itemId === item.id && c.size === size,
                );
                return (
                  <div key={size} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggle(item.id, size)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                        sel
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40"
                      }`}
                    >
                      {size}
                    </button>
                    {sel && line ? (
                      <div className="flex items-center rounded-lg border border-[var(--border)]">
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          onClick={() =>
                            onQty(item.id, size, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          onClick={() =>
                            onQty(item.id, size, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-right text-sm">
        Running total:{" "}
        <span className="text-lg font-bold text-[var(--text)]">
          {formatTzs(total)}
        </span>
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="rounded-xl bg-[var(--accent)] px-8 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-40"
        >
          Continue to invoice
        </button>
      </div>
    </section>
  );
}

function InvoiceStep({
  student,
  lines,
  total,
  onBack,
  onNext,
}: {
  student: Student;
  lines: {
    item: { name: string; price: number };
    size: string;
    quantity: number;
    sub: number;
  }[];
  total: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section aria-labelledby="step3-h">
      <h2 id="step3-h" className="text-lg font-semibold text-[var(--text)]">
        Step 3: Invoice summary
      </h2>
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
        <p>
          <span className="text-[var(--muted)]">Student:</span>{" "}
          <span className="font-semibold text-[var(--text)]">
            {student.fullName}
          </span>
        </p>
        <p className="mt-1">
          <span className="text-[var(--muted)]">Student ID:</span> {student.id}
        </p>
        <p className="mt-1">
          <span className="text-[var(--muted)]">Class:</span> {student.className}
        </p>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted)]">
            <th className="pb-2 pr-2">Uniform</th>
            <th className="pb-2 pr-2">Size</th>
            <th className="pb-2 pr-2 text-center">Qty</th>
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {lines.map((l, i) => (
            <tr key={i}>
              <td className="py-3 pr-2 text-[var(--text)]">{l.item.name}</td>
              <td className="py-3 pr-2 text-[var(--muted)]">{l.size}</td>
              <td className="py-3 pr-2 text-center">{l.quantity}</td>
              <td className="py-3 text-right font-medium text-[var(--text)]">
                {formatTzs(l.sub)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="pt-4 text-right font-bold text-[var(--text)]">
              Total
            </td>
            <td className="pt-4 text-right text-lg font-bold text-[var(--secondary)]">
              {formatTzs(total)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-[var(--accent)] px-8 py-2.5 text-sm font-bold text-white hover:brightness-110"
        >
          Continue to payment
        </button>
      </div>
    </section>
  );
}

function PaymentStep({
  total,
  method,
  onMethod,
  onBack,
  onPay,
}: {
  total: number;
  method: PaymentMethod;
  onMethod: (m: PaymentMethod) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  const methods: { id: PaymentMethod; label: string; hint: string }[] = [
    { id: "mobile", label: "Mobile (M-Pesa / mix)", hint: "Pay via school mobile number" },
    { id: "bank", label: "Bank transfer", hint: "School bank account number" },
    { id: "cash", label: "Cash", hint: "School office / uniform shop" },
  ];

  return (
    <section aria-labelledby="step4-h">
      <h2 id="step4-h" className="text-lg font-semibold text-[var(--text)]">
        Step 4: Make payment
      </h2>
      <p className="mt-2 text-2xl font-bold text-[var(--secondary)]">
        {formatTzs(total)}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Choose a payment method (demo system — no real online payment).
      </p>
      <ul className="mt-6 space-y-2">
        {methods.map((m) => (
          <li key={m.id}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                method === m.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] hover:border-[var(--accent)]/30"
              }`}
            >
              <input
                type="radio"
                name="pay"
                checked={method === m.id}
                onChange={() => onMethod(m.id)}
                className="mt-1"
              />
              <span>
                <span className="font-semibold text-[var(--text)]">
                  {m.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {m.hint}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onPay}
          className="rounded-xl bg-[var(--accent)] px-8 py-2.5 text-sm font-bold text-white hover:brightness-110"
        >
          Confirm payment
        </button>
      </div>
    </section>
  );
}

function ReceiptStep({
  receipt,
  onNew,
}: {
  receipt: Receipt;
  onNew: () => void;
}) {
  const dateStr = new Date(receipt.paidAt).toLocaleString("en-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const methodLabel =
    receipt.paymentMethod === "mobile"
      ? "Mobile money"
      : receipt.paymentMethod === "bank"
        ? "Bank"
        : "Cash";

  return (
    <section aria-labelledby="step5-h">
      <div className="flex items-center gap-3 text-[var(--accent)]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xl">
          ✓
        </span>
        <h2 id="step5-h" className="text-lg font-semibold text-[var(--text)]">
          Step 5: Receipt — payment complete
        </h2>
      </div>
      <article className="mt-6 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 font-mono text-sm">
        <p className="text-center text-xs uppercase tracking-widest text-[var(--muted)]">
          Official receipt (sample)
        </p>
        <div className="text-center mt-1.5 mb-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            receipt.status === "approved"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            {receipt.status === "approved" ? "Approved (Imethibitishwa)" : "Pending Approval (Inasubiri)"}
          </span>
        </div>
        <p className="mt-2 text-center text-lg font-bold text-[var(--secondary)]">
          {receipt.receiptNo}
        </p>
        <p className="mt-1 text-center text-xs text-[var(--muted)]">{dateStr}</p>
        <hr className="my-4 border-[var(--border)]" />
        <p>
          <span className="text-[var(--muted)]">Student ID:</span>{" "}
          {receipt.student.id}
        </p>
        <p>
          <span className="text-[var(--muted)]">Name:</span>{" "}
          {receipt.student.fullName}
        </p>
        <p>
          <span className="text-[var(--muted)]">Class:</span>{" "}
          {receipt.student.className}
        </p>
        <hr className="my-4 border-[var(--border)]" />
        <ul className="space-y-2">
          {receipt.lines.map((l, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span className="text-[var(--text)]">
                {l.name} ({l.size}) ×{l.quantity}
              </span>
              <span>{formatTzs(l.subtotal)}</span>
            </li>
          ))}
        </ul>
        <hr className="my-4 border-[var(--border)]" />
        <p className="flex justify-between text-base font-bold">
          <span>TOTAL</span>
          <span className="text-[var(--secondary)]">{formatTzs(receipt.total)}</span>
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Payment: {methodLabel}
        </p>
      </article>
      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Save your receipt number for your records. Thank you!
      </p>
      <button
        type="button"
        onClick={onNew}
        className="mt-6 w-full rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] py-3 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10"
      >
        New payment (another student)
      </button>
    </section>
  );
}
