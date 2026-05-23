"use client";

import { useAuth } from "@/lib/AuthContext";
import { formatTzs } from "@/lib/money";

export function ReportsView() {
  const { user } = useAuth();

  // Mock data for the report
  const todaySales = 450000;
  const weeklySales = 2100000;
  const transactions = 15;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] p-8 text-white shadow-xl">
        <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
        <p className="mt-2 text-white/80">
          Here is the summary of sales and transactions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Today's Sales
          </h3>
          <p className="mt-2 text-3xl font-bold text-[var(--text)]">
            {formatTzs(todaySales)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            This Week
          </h3>
          <p className="mt-2 text-3xl font-bold text-[var(--text)]">
            {formatTzs(weeklySales)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Transactions (Today)
          </h3>
          <p className="mt-2 text-3xl font-bold text-[var(--text)]">
            {transactions}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[var(--text)]">
          Recent Activity
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Mock data. Connect to database to view real transaction history.
        </p>
      </div>
    </div>
  );
}
