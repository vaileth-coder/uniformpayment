"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { formatTzs } from "@/lib/money";
import type { Receipt } from "@/lib/types";

interface InventoryStock {
  size: string;
  initial: number;
  sold: number;
  remaining: number;
  _id?: string;
}

interface InventoryItem {
  _id: string;
  itemId: string;
  itemName: string;
  stock: InventoryStock[];
}

export function ReportsView() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Receipt[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"financials" | "inventory" | "eod" | "monthly" | "yearly">("financials");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedYearOnly, setSelectedYearOnly] = useState(currentYear);

  const MONTHS_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const yearsList = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [salesRes, invRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/inventory")
      ]);

      if (salesRes.ok && invRes.ok) {
        const salesData = await salesRes.json();
        const invData = await invRes.json();
        setSales(salesData.sales || []);
        setInventory(invData.inventory || []);
      } else {
        throw new Error("Failed to load reporting data");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleApproveSale = async (id: string) => {
    if (!confirm("Are you sure you want to approve this payment? This will update stock levels.")) return;
    try {
      const res = await fetch("/api/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      if (res.ok) {
        fetchReportsData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to approve payment");
      }
    } catch {
      alert("Failed to approve payment");
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This action cannot be undone and will restock items if approved.")) return;
    try {
      const res = await fetch(`/api/sales?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchReportsData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete transaction");
      }
    } catch {
      alert("Failed to delete transaction");
    }
  };

  // Financial calculations
  const today = new Date().toDateString();
  const approvedSales = sales.filter((s) => s.status === "approved");
  const pendingSales = sales.filter((s) => s.status === "pending");

  const todayApprovedSalesTotal = approvedSales
    .filter((s) => new Date(s.paidAt).toDateString() === today)
    .reduce((sum, s) => sum + s.total, 0);

  const todayPendingSalesTotal = pendingSales
    .filter((s) => new Date(s.paidAt).toDateString() === today)
    .reduce((sum, s) => sum + s.total, 0);

  const todayTransactionsCount = sales.filter(
    (s) => new Date(s.paidAt).toDateString() === today
  ).length;

  // Weekly sales
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklySalesTotal = approvedSales
    .filter((s) => new Date(s.paidAt) >= oneWeekAgo)
    .reduce((sum, s) => sum + s.total, 0);

  // EOD calculations
  const todayTransactions = sales.filter(
    (s) => new Date(s.paidAt).toDateString() === today
  );

  const cashTotal = todayTransactions
    .filter((s) => s.status === "approved" && s.paymentMethod === "cash")
    .reduce((sum, s) => sum + s.total, 0);

  const mobileTotal = todayTransactions
    .filter((s) => s.status === "approved" && s.paymentMethod === "mobile")
    .reduce((sum, s) => sum + s.total, 0);

  const bankTotal = todayTransactions
    .filter((s) => s.status === "approved" && s.paymentMethod === "bank")
    .reduce((sum, s) => sum + s.total, 0);

  // Selected Month calculations
  const monthlyTransactions = sales.filter((s) => {
    const d = new Date(s.paidAt);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
  const monthlyApprovedSales = monthlyTransactions.filter((s) => s.status === "approved");
  const monthlyPendingSales = monthlyTransactions.filter((s) => s.status === "pending");

  const monthlyApprovedSalesTotal = monthlyApprovedSales.reduce((sum, s) => sum + s.total, 0);
  const monthlyPendingSalesTotal = monthlyPendingSales.reduce((sum, s) => sum + s.total, 0);
  const monthlyItemsSoldTotal = monthlyApprovedSales.reduce(
    (sum, s) => sum + s.lines.reduce((lsum, l) => lsum + l.quantity, 0),
    0
  );

  const monthlyCashTotal = monthlyApprovedSales
    .filter((s) => s.paymentMethod === "cash")
    .reduce((sum, s) => sum + s.total, 0);
  const monthlyMobileTotal = monthlyApprovedSales
    .filter((s) => s.paymentMethod === "mobile")
    .reduce((sum, s) => sum + s.total, 0);
  const monthlyBankTotal = monthlyApprovedSales
    .filter((s) => s.paymentMethod === "bank")
    .reduce((sum, s) => sum + s.total, 0);

  // Daily totals breakdown for selected month
  const daysInMonthCount = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyBreakdown = Array.from({ length: daysInMonthCount }, (_, i) => {
    const day = i + 1;
    const dayTransactions = monthlyApprovedSales.filter((s) => new Date(s.paidAt).getDate() === day);
    const totalAmount = dayTransactions.reduce((sum, s) => sum + s.total, 0);
    const count = dayTransactions.length;
    return { day, totalAmount, count };
  }).filter((d) => d.count > 0);

  // Selected Year calculations
  const yearlyTransactions = sales.filter((s) => {
    const d = new Date(s.paidAt);
    return d.getFullYear() === selectedYearOnly;
  });
  const yearlyApprovedSales = yearlyTransactions.filter((s) => s.status === "approved");
  const yearlyPendingSales = yearlyTransactions.filter((s) => s.status === "pending");

  const yearlyApprovedSalesTotal = yearlyApprovedSales.reduce((sum, s) => sum + s.total, 0);
  const yearlyPendingSalesTotal = yearlyPendingSales.reduce((sum, s) => sum + s.total, 0);
  const yearlyItemsSoldTotal = yearlyApprovedSales.reduce(
    (sum, s) => sum + s.lines.reduce((lsum, l) => lsum + l.quantity, 0),
    0
  );

  const yearlyCashTotal = yearlyApprovedSales
    .filter((s) => s.paymentMethod === "cash")
    .reduce((sum, s) => sum + s.total, 0);
  const yearlyMobileTotal = yearlyApprovedSales
    .filter((s) => s.paymentMethod === "mobile")
    .reduce((sum, s) => sum + s.total, 0);
  const yearlyBankTotal = yearlyApprovedSales
    .filter((s) => s.paymentMethod === "bank")
    .reduce((sum, s) => sum + s.total, 0);

  // Monthly breakdown for selected year
  const monthlyBreakdown = Array.from({ length: 12 }, (_, monthIdx) => {
    const monthTransactions = yearlyApprovedSales.filter((s) => new Date(s.paidAt).getMonth() === monthIdx);
    const totalAmount = monthTransactions.reduce((sum, s) => sum + s.total, 0);
    const count = monthTransactions.length;
    return { monthName: MONTHS_NAMES[monthIdx], totalAmount, count };
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-[var(--muted)]">Loading reports dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-500">
        <p className="font-bold">{error}</p>
        <button
          onClick={fetchReportsData}
          className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white hover:brightness-110"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Navigation Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] p-6 text-white shadow-lg">
        <div>
          <h2 className="text-xl font-bold">Welcome, {user?.name}</h2>
          <p className="mt-1 text-xs text-white/80">
            Monitor real-time finances, stock levels, and verify cashier transactions.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap rounded-lg bg-black/20 p-1 gap-1">
          <button
            onClick={() => setActiveTab("financials")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "financials" ? "bg-white text-[var(--secondary)] shadow-sm" : "hover:bg-white/10"
            }`}
          >
            Miamala & Fedha
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "inventory" ? "bg-white text-[var(--secondary)] shadow-sm" : "hover:bg-white/10"
            }`}
          >
            Stoku/Mzigo
          </button>
          <button
            onClick={() => setActiveTab("eod")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "eod" ? "bg-white text-[var(--secondary)] shadow-sm" : "hover:bg-white/10"
            }`}
          >
            Ripoti ya Jioni
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "monthly" ? "bg-white text-[var(--secondary)] shadow-sm" : "hover:bg-white/10"
            }`}
          >
            Ripoti ya Mwezi
          </button>
          <button
            onClick={() => setActiveTab("yearly")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "yearly" ? "bg-white text-[var(--secondary)] shadow-sm" : "hover:bg-white/10"
            }`}
          >
            Ripoti ya Mwaka
          </button>
        </div>
      </div>

      {activeTab === "financials" && (
        <>
          {/* Dashboard Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Leo (Approved / Inasubiri)
              </h3>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">
                {formatTzs(todayApprovedSalesTotal)}
              </p>
              {todayPendingSalesTotal > 0 && (
                <p className="mt-1 text-xs text-amber-500 font-semibold">
                  + {formatTzs(todayPendingSalesTotal)} inasubiri
                </p>
              )}
            </div>
            
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Mauzo ya Wiki Hii
              </h3>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">
                {formatTzs(weeklySalesTotal)}
              </p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Mauzo yaliyothibitishwa pekee</p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Miamala ya Leo
              </h3>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">
                {todayTransactionsCount}
              </p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Approved & Pending</p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h3 className="text-base font-bold text-[var(--text)]">
                Orodha ya Miamala ya Sare (All Transactions)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-3">Receipt No</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Payment Info</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[var(--muted)]">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale: Receipt) => (
                      <tr key={sale._id!} className="hover:bg-[var(--surface-2)]/30 text-xs">
                        <td className="px-5 py-4 font-mono font-bold text-[var(--secondary)]">
                          {sale.receiptNo}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[var(--text)]">{sale.student.fullName}</p>
                          <p className="text-[10px] text-[var(--muted)]">{sale.student.id} | {sale.student.className}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="capitalize font-medium text-[var(--text)]">{sale.paymentMethod}</p>
                          <p className="text-[10px] text-[var(--muted)]">
                            {new Date(sale.paidAt).toLocaleString("en-TZ", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-bold text-[var(--text)]">
                          {formatTzs(sale.total)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            sale.status === "approved"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                          }`}>
                            {sale.status === "approved" ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {sale.status === "pending" && (
                              <button
                                onClick={() => handleApproveSale(sale._id!)}
                                className="rounded bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-green-600 transition"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSale(sale._id!)}
                              className="rounded border border-[var(--border)] bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "inventory" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[var(--text)]">Usimamizi wa Stoku & Mzigo</h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Hapa inaonyesha idadi ya mzigo uliotoka (sold) na mzigo uliobaki store kwa kila saizi ya sare.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {inventory.map((item) => (
              <div key={item._id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-4 space-y-3">
                <h4 className="text-sm font-bold text-[var(--text)] border-b border-[var(--border)] pb-2 flex items-center justify-between">
                  <span>{item.itemName}</span>
                  <span className="text-xs font-mono text-[var(--muted)]">{item.itemId}</span>
                </h4>
                
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[var(--muted)] font-semibold border-b border-[var(--border)]/60">
                      <th className="pb-1.5">Size</th>
                      <th className="pb-1.5 text-center">Mwanzo (Initial)</th>
                      <th className="pb-1.5 text-center">Uliotoka (Sold)</th>
                      <th className="pb-1.5 text-right">Uliobaki (Remaining)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/40">
                    {item.stock.map((st) => (
                      <tr key={st._id} className="hover:bg-[var(--surface-2)]/50">
                        <td className="py-2 font-bold text-[var(--text)]">{st.size}</td>
                        <td className="py-2 text-center text-[var(--muted)]">{st.initial}</td>
                        <td className="py-2 text-center font-semibold text-blue-400">{st.sold}</td>
                        <td className="py-2 text-right">
                          <span className={`font-bold ${
                            st.remaining < 5 ? "text-red-400 animate-pulse font-extrabold" : "text-green-400"
                          }`}>
                            {st.remaining}
                          </span>
                          {st.remaining < 5 && (
                            <span className="ml-1 text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-full px-1.5 py-0.5 font-bold uppercase tracking-widest">
                              Low
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "eod" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-6">
          {/* EOD Report Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">Ripoti ya Siku ya Jioni (End-of-Day Report)</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Taarifa kamili ya leo: {new Date().toLocaleDateString("en-TZ", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:brightness-110 flex items-center gap-1.5 shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0a2.25 2.25 0 0 1-2.25 2.25H8.59A2.25 2.25 0 0 1 6.34 18m11.318-4.171A42.415 42.415 0 0 0 12 13.3a42.415 42.415 0 0 0-5.658.53m11.318 0a3 3 0 0 0-3.658-2.53h-.03a4.5 4.5 0 0 0-3.63 0H8.59A3 3 0 0 0 4.93 13.8m11.318-4.171V7.5A2.25 2.25 0 0 0 14 5.25H10A2.25 2.25 0 0 0 7.75 7.5v2.13m2.22 3.658h3.93" />
              </svg>
              Print / PDF
            </button>
          </div>

          {/* EOD Numbers Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-green-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-green-400 tracking-wider">Jumla ya Fedha (Approved)</h4>
              <p className="mt-1 text-xl font-black text-green-500">{formatTzs(todayApprovedSalesTotal)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-amber-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Jumla Inasubiri (Pending)</h4>
              <p className="mt-1 text-xl font-black text-amber-500">{formatTzs(todayPendingSalesTotal)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-blue-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Miamala ya Leo</h4>
              <p className="mt-1 text-xl font-black text-blue-400">{todayTransactions.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-purple-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Sare Zilizouzwa Leo</h4>
              <p className="mt-1 text-xl font-black text-purple-400">
                {todayTransactions
                  .filter((s) => s.status === "approved")
                  .reduce((sum, s) => sum + s.lines.reduce((lsum, l) => lsum + l.quantity, 0), 0)}
              </p>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Mgawanyiko wa Malipo (Approved Only)</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Cash
                </span>
                <span className="font-bold text-[var(--text)]">{formatTzs(cashTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span> Mobile Money
                </span>
                <span className="font-bold text-[var(--text)]">{formatTzs(mobileTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span> Bank Transfer
                </span>
                <span className="font-bold text-[var(--text)]">{formatTzs(bankTotal)}</span>
              </div>
            </div>
          </div>

          {/* Today's Transactions Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Miamala yote ya leo</h4>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--surface-2)] uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-2.5">Receipt</th>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5">Items Purchased</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {todayTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[var(--muted)]">
                        Hujafanya malipo yoyote leo.
                      </td>
                    </tr>
                  ) : (
                    todayTransactions.map((sale: Receipt) => (
                      <tr key={sale._id!} className="hover:bg-[var(--surface-2)]/20">
                        <td className="px-4 py-3 font-mono font-semibold text-[var(--secondary)]">{sale.receiptNo}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-[var(--text)]">{sale.student.fullName}</span>
                          <span className="block text-[10px] text-[var(--muted)]">{sale.student.className}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate">
                          {sale.lines.map((l) => `${l.name} (${l.size}) x${l.quantity}`).join(", ")}
                        </td>
                        <td className="px-4 py-3 capitalize">{sale.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            sale.status === "approved" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {sale.status === "approved" ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[var(--text)]">{formatTzs(sale.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "monthly" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-6">
          {/* Header & Selectors */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">Ripoti ya Mwezi (Monthly Report)</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Uchambuzi wa mwezi: {MONTHS_NAMES[selectedMonth]} {selectedYear}
              </p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text)] outline-none"
              >
                {MONTHS_NAMES.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text)] outline-none"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:brightness-110 flex items-center gap-1.5 shadow"
              >
                Print
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-green-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-green-400 tracking-wider">Approved Sales</h4>
              <p className="mt-1 text-xl font-black text-green-500">{formatTzs(monthlyApprovedSalesTotal)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-amber-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Pending Sales</h4>
              <p className="mt-1 text-xl font-black text-amber-500">{formatTzs(monthlyPendingSalesTotal)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-blue-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Transactions</h4>
              <p className="mt-1 text-xl font-black text-blue-400">{monthlyTransactions.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-purple-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Uniforms Sold</h4>
              <p className="mt-1 text-xl font-black text-purple-400">{monthlyItemsSoldTotal}</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Njia za Malipo (Approved Only)</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)]">Cash</span>
                <span className="font-bold text-[var(--text)]">{formatTzs(monthlyCashTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)]">Mobile Money</span>
                <span className="font-bold text-[var(--text)]">{formatTzs(monthlyMobileTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)]">Bank Transfer</span>
                <span className="font-bold text-[var(--text)]">{formatTzs(monthlyBankTotal)}</span>
              </div>
            </div>
          </div>

          {/* Daily breakdown table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Mauzo ya Kila Siku (Daily Breakdown)</h4>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--surface-2)] uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-2.5">Tarehe (Day)</th>
                    <th className="px-4 py-2.5">Idadi ya Miamala</th>
                    <th className="px-4 py-2.5 text-right">Jumla ya Fedha (Approved)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {dailyBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-[var(--muted)]">
                        Hakuna mauzo yoyote yaliyofanyika mwezi huu.
                      </td>
                    </tr>
                  ) : (
                    dailyBreakdown.map((d) => (
                      <tr key={d.day} className="hover:bg-[var(--surface-2)]/20">
                        <td className="px-4 py-3 font-semibold text-[var(--text)]">
                          {d.day} {MONTHS_NAMES[selectedMonth]} {selectedYear}
                        </td>
                        <td className="px-4 py-3">{d.count}</td>
                        <td className="px-4 py-3 text-right font-bold text-[var(--text)]">{formatTzs(d.totalAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "yearly" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-6">
          {/* Header & Selectors */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">Ripoti ya Mwaka (Yearly Report)</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Uchambuzi wa mwaka: {selectedYearOnly}
              </p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedYearOnly}
                onChange={(e) => setSelectedYearOnly(Number(e.target.value))}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text)] outline-none"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white hover:brightness-110 flex items-center gap-1.5 shadow"
              >
                Print
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-green-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-green-400 tracking-wider">Approved Sales</h4>
              <p className="mt-1 text-xl font-black text-green-500">{formatTzs(yearlyApprovedSalesTotal)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-amber-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Pending Sales</h4>
              <p className="mt-1 text-xl font-black text-amber-500">{formatTzs(yearlyPendingSalesTotal)}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-blue-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Transactions</h4>
              <p className="mt-1 text-xl font-black text-blue-400">{yearlyTransactions.length}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-purple-500/5 p-4">
              <h4 className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Uniforms Sold</h4>
              <p className="mt-1 text-xl font-black text-purple-400">{yearlyItemsSoldTotal}</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Njia za Malipo (Approved Only)</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)]">Cash</span>
                <span className="font-bold text-[var(--text)]">{formatTzs(yearlyCashTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)]">Mobile Money</span>
                <span className="font-bold text-[var(--text)]">{formatTzs(yearlyMobileTotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-4 py-3 text-xs">
                <span className="font-semibold text-[var(--muted)]">Bank Transfer</span>
                <span className="font-bold text-[var(--text)]">{formatTzs(yearlyBankTotal)}</span>
              </div>
            </div>
          </div>

          {/* Monthly breakdown table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">Mauzo ya Kila Mwezi (Monthly Breakdown)</h4>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--surface-2)] uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-2.5">Mwezi (Month)</th>
                    <th className="px-4 py-2.5">Idadi ya Miamala</th>
                    <th className="px-4 py-2.5 text-right">Jumla ya Fedha (Approved)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {monthlyBreakdown.map((m) => (
                    <tr key={m.monthName} className="hover:bg-[var(--surface-2)]/20">
                      <td className="px-4 py-3 font-semibold text-[var(--text)]">
                        {m.monthName} {selectedYearOnly}
                      </td>
                      <td className="px-4 py-3">{m.count}</td>
                      <td className="px-4 py-3 text-right font-bold text-[var(--text)]">
                        {m.totalAmount > 0 ? formatTzs(m.totalAmount) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
