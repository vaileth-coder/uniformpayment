"use client";

import { useState, useEffect } from "react";

interface SystemUser {
  _id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
}

export function UserManagementView() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seller");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setFormSuccess("User created successfully!");
      // Reset form
      setName("");
      setUsername("");
      setPassword("");
      setRole("seller");

      // Refresh user list
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)]">
          User Management
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Add new accountants and sellers to the system.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Add User Form */}
        <div className="md:col-span-1">
          <form
            onSubmit={handleAddUser}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-bold text-[var(--text)]">
              Add New User
            </h3>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {formSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[var(--text)]">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="seller">Seller / Cashier</option>
                  <option value="accountant">Accountant</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>

        {/* User List */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h3 className="text-lg font-bold text-[var(--text)]">
                System Users
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-[var(--muted)]">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-[var(--muted)]">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-[var(--surface-2)]/50">
                        <td className="px-6 py-4 font-medium text-[var(--text)]">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 text-[var(--text)]">
                          {u.username}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            u.role === 'director' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'accountant' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--muted)]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
