"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { LoginScreen } from "@/components/LoginScreen";
import { DashboardLayout } from "@/components/DashboardLayout";
import { UniformPaymentApp } from "@/components/UniformPaymentApp";
import { ReportsView } from "@/components/ReportsView";
import { UserManagementView } from "@/components/UserManagementView";

export default function Home() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"sales" | "reports" | "users">("sales");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Seller View
  if (user.role === "seller") {
    return (
      <DashboardLayout>
        <UniformPaymentApp />
      </DashboardLayout>
    );
  }

  // Accountant View
  if (user.role === "accountant") {
    return (
      <DashboardLayout>
        <ReportsView />
      </DashboardLayout>
    );
  }

  // Director View
  if (user.role === "director") {
    return (
      <DashboardLayout>
        <div className="mb-6 flex space-x-2 border-b border-[var(--border)] pb-2">
          <button
            onClick={() => setActiveTab("sales")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "sales"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            Sales Module
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "reports"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "users"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            User Management
          </button>
        </div>

        {activeTab === "sales" && <UniformPaymentApp />}
        {activeTab === "reports" && <ReportsView />}
        {activeTab === "users" && <UserManagementView />}
      </DashboardLayout>
    );
  }

  return null;
}
