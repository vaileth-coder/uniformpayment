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
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
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
      setShowPassword(false);

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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setFormError("");
    setFormSuccess("");
    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccess("User deleted successfully!");
        fetchUsers();
      } else {
        setFormError(data.error || "Failed to delete user");
      }
    } catch {
      setFormError("Failed to delete user");
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] pl-3 pr-10 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[var(--muted)] hover:text-[var(--text)]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[var(--muted)] hover:text-[var(--text)]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                    <th className="px-6 py-3 text-right">Actions</th>
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
                        <td className="px-6 py-4 text-right">
                          {u.role !== "director" && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-400 hover:text-red-500 font-semibold text-xs transition"
                            >
                              Delete
                            </button>
                          )}
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
