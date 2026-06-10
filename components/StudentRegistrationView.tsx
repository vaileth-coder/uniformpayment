"use client";

import { useState, useEffect } from "react";
import { Student } from "@/lib/types";

export function StudentRegistrationView() {
  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("");
  const [level, setLevel] = useState<"primary" | "secondary">("primary");
  const [successMsg, setSuccessMsg] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = "STU" + String(Math.floor(Math.random() * 900) + 100);
    const newStudent = { id, fullName, className, level };
    
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Student ${fullName} registered successfully with ID: ${id}`);
        setFullName("");
        setClassName("");
        setLevel("primary");
        fetchStudents();
      } else {
        setSuccessMsg(data.error || "Failed to register student");
      }
    } catch {
      setSuccessMsg("Failed to register student");
    }
    
    setTimeout(() => {
      setSuccessMsg("");
    }, 5000);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students?id=${studentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        fetchStudents();
      } else {
        alert(data.error || "Failed to delete student");
      }
    } catch {
      alert("Failed to delete student");
    }
  };

  const primaryStudents = students.filter((s) => s.level === "primary");
  const secondaryStudents = students.filter((s) => s.level === "secondary");

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
        <h3 className="text-lg font-bold text-[var(--text)] mb-6">
          Registered Students ({students.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Level */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text)] mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                Primary Level
              </span>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                {primaryStudents.length}
              </span>
            </h4>
            
            {primaryStudents.length === 0 ? (
              <p className="text-xs text-[var(--muted)] py-4 text-center">
                No primary students registered.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left uppercase text-[var(--muted)]">
                      <th className="pb-2 pr-2">ID</th>
                      <th className="pb-2 pr-2">Full Name</th>
                      <th className="pb-2 pr-2">Class</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/40">
                    {primaryStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[var(--surface-2)]/40">
                        <td className="py-2.5 pr-2 font-mono font-bold text-[var(--secondary)]">
                          {student.id}
                        </td>
                        <td className="py-2.5 pr-2 text-[var(--text)] font-medium">
                          {student.fullName}
                        </td>
                        <td className="py-2.5 pr-2 text-[var(--muted)]">
                          {student.className}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-400 hover:text-red-500 font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Secondary Level */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text)] mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                Secondary Level
              </span>
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400">
                {secondaryStudents.length}
              </span>
            </h4>
            
            {secondaryStudents.length === 0 ? (
              <p className="text-xs text-[var(--muted)] py-4 text-center">
                No secondary students registered.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left uppercase text-[var(--muted)]">
                      <th className="pb-2 pr-2">ID</th>
                      <th className="pb-2 pr-2">Full Name</th>
                      <th className="pb-2 pr-2">Class</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/40">
                    {secondaryStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-[var(--surface-2)]/40">
                        <td className="py-2.5 pr-2 font-mono font-bold text-[var(--secondary)]">
                          {student.id}
                        </td>
                        <td className="py-2.5 pr-2 text-[var(--text)] font-medium">
                          {student.fullName}
                        </td>
                        <td className="py-2.5 pr-2 text-[var(--muted)]">
                          {student.className}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-400 hover:text-red-500 font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
