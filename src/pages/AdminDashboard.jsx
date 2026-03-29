import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/users";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetModal, setResetModal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const PAGE_SIZE = 20;

  // Check if user is admin
  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: search.trim(), page, page_size: PAGE_SIZE },
      });

      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (error) {
      showMessage("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleResetPassword = async (user) => {
    setSelectedUser(user);
    setResetModal(true);
    setTempPassword("");
  };

  const confirmReset = async () => {
    setResetting(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/admin/reset-password/`,
        { user_id: selectedUser.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTempPassword(response.data.temporary_password);
      showMessage(`Password reset for ${selectedUser.username}!`, "success");
    } catch (error) {
      showMessage("Failed to reset password", "error");
    } finally {
      setResetting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    showMessage("Copied to clipboard!", "success");
  };

  const closeResetModal = () => {
    setResetModal(false);
    setSelectedUser(null);
    setTempPassword("");
  };

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0e0d] via-[#1a1815] to-[#0f0e0d]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f0e0d]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="font-['Montserrat'] text-3xl font-light text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/50">Manage users and reset passwords</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 animate-[slideDown_0.3s_ease] ${
              messageType === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by username, email, or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-[#f0c27a]/50 focus:bg-white/10"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 backdrop-blur">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-white/50">
                      {loading ? "Loading..." : "No users found"}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="transition hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {u.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            u.profile_status === "approved"
                              ? "bg-green-500/20 text-green-300"
                              : u.profile_status === "pending"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {u.profile_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="rounded-lg bg-[#f0c27a]/20 px-3 py-2 text-xs font-medium text-[#f0c27a] transition hover:bg-[#f0c27a]/30"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-white/50">
              Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, totalUsers)} of {totalUsers} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition disabled:opacity-50 hover:bg-white/5"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-10 w-10 rounded-lg text-sm transition ${
                      p === page
                        ? "bg-[#f0c27a] text-[#0f0e0d]"
                        : "border border-white/10 text-white hover:bg-white/5"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition disabled:opacity-50 hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#0f0e0d] p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-light text-white">
              Reset Password
            </h2>

            {!tempPassword ? (
              <>
                <p className="mb-6 text-sm text-white/70">
                  Are you sure you want to reset the password for{" "}
                  <strong>{selectedUser?.username}</strong>?
                </p>
                <p className="mb-6 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 border border-yellow-500/20">
                  A temporary password will be generated. Make sure to share it
                  securely with the user.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={closeResetModal}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-white transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReset}
                    disabled={resetting}
                    className="flex-1 rounded-lg bg-[#f0c27a] px-4 py-2 font-medium text-[#0f0e0d] transition hover:brightness-110 disabled:opacity-50"
                  >
                    {resetting ? "Resetting..." : "Confirm Reset"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-white/70">
                  Temporary password generated successfully!
                </p>

                <div className="mb-6 rounded-lg border border-[#f0c27a]/30 bg-[#f0c27a]/10 p-4">
                  <p className="mb-2 text-xs uppercase tracking-widest text-white/50">
                    Temporary Password
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-[#f0c27a]">
                      {tempPassword}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="rounded-lg bg-[#f0c27a]/20 px-3 py-2 text-sm text-[#f0c27a] transition hover:bg-[#f0c27a]/30"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <p className="mb-6 rounded-lg bg-blue-500/10 px-4 py-3 text-sm text-blue-200 border border-blue-500/20">
                  <strong>Important:</strong> Share this password securely with the user. They should change it after their first login.
                </p>

                <button
                  onClick={closeResetModal}
                  className="w-full rounded-lg bg-[#f0c27a] px-4 py-2 font-medium text-[#0f0e0d] transition hover:brightness-110"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
