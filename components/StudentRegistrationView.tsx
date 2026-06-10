"use client";

import { useState, useEffect } from "react";
import { Student } from "@/lib/types";
import { registerStudent, allStudents } from "@/lib/students";

export function StudentRegistrationView() {
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("");
  const [level, setLevel] = useState<"primary" | "secondary">("primary");
  const [successMsg, setSuccessMsg] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    setStudents([...allStudents]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = "STU" + String(Math.floor(Math.random() * 900) + 100);
    const newStudent: Student = { id, fullName, className, level };
    registerStudent(newStudent);
    setStudents([...allStudents]);
    
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

      <div className="mt-8 border-t border-[var(--border)] pt-8">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4">
          Registered Students ({students.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted)]">
                <th className="pb-3 pr-4">Student ID</th>
                <th className="pb-3 pr-4">Full Name</th>
                <th className="pb-3 pr-4">Class</th>
                <th className="pb-3">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-[var(--surface-2)]/50">
                  <td className="py-3 pr-4 font-mono font-bold text-[var(--secondary)]">
                    {student.id}
                  </td>
                  <td className="py-3 pr-4 text-[var(--text)] font-medium">
                    {student.fullName}
                  </td>
                  <td className="py-3 pr-4 text-[var(--muted)]">
                    {student.className}
                  </td>
                  <td className="py-3 capitalize text-[var(--muted)]">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      student.level === "primary"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-purple-500/10 text-purple-400"
                    }`}>
                      {student.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
