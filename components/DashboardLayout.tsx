"use client";

import { useAuth } from "@/lib/AuthContext";
import React from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-[var(--text)]">
              Uniform Payment
            </h1>
            <span className="hidden rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold capitalize text-[var(--muted)] sm:inline-block">
              Role: {user?.role}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--text)]">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
