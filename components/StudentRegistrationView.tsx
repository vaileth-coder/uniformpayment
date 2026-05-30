"use client";

import { useState } from "react";
import { Student } from "@/lib/types";
import { registerStudent, allStudents } from "@/lib/students";

export function StudentRegistrationView() {
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("");
  const [level, setLevel] = useState<"primary" | "secondary">("primary");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = "STU" + String(Math.floor(Math.random() * 900) + 100);
    const newStudent: Student = { id, fullName, className, level };
    registerStudent(newStudent);
    
    setSuccessMsg(`Student ${fullName} registered successfully with ID: ${id}`);
    setFullName("");
    setClassName("");
    setLevel("primary");
    
    setTimeout(() => {
      setSuccessMsg("");
    }, 5000);
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl sm:p-8">
      <h2 className="text-xl font-bold text-[var(--text)] mb-6">
        Register New Student
      </h2>
      
      {successMsg && (
        <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-500">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
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
        
        <div className="mt-6 pt-4">
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-bold text-white hover:brightness-110"
          >
            Register Student
          </button>
        </div>
      </form>
    </div>
  );
}
