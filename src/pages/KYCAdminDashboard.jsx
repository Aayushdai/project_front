import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, X, AlertCircle, Calendar, User, FileText } from "lucide-react";

const getApi = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
  return backendUrl.replace('/api/', '');
};

export default function KYCAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKyc, setActiveKyc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("pending"); // pending, approved, rejected

  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate("/profile");
      return;
    }
    fetchPendingKycs();
  }, [user, navigate]);

  const fetchPendingKycs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/users/api/kyc/pending/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setKycs(data.kyc_submissions || []);
      }
    } catch (err) {
      console.error("Failed to fetch KYC submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profileId) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/users/api/kyc/${profileId}/action/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setKycs((prev) => prev.filter((k) => k.id !== profileId));
        setActiveKyc(null);
        alert("KYC approved successfully!");
      } else {
        alert("Failed to approve KYC");
      }
    } catch (err) {
      console.error("Error approving KYC:", err);
      alert("Error approving KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (profileId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API}/users/api/kyc/${profileId}/action/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject", reason: rejectionReason }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setKycs((prev) => prev.filter((k) => k.id !== profileId));
        setActiveKyc(null);
        setRejectionReason("");
        alert("KYC rejected successfully!");
      } else {
        alert("Failed to reject KYC");
      }
    } catch (err) {
      console.error("Error rejecting KYC:", err);
      alert("Error rejecting KYC");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !user.is_staff) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0ece4]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-400 border-t-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ece4] py-12 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Admin
        </button>

        <h1 className="text-4xl font-bold text-[#111827] mb-2">KYC Verification</h1>
        <p className="text-gray-600 mb-8">Review and approve/reject user KYC submissions</p>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-8">
          {["pending", "approved", "rejected"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm capitalize transition ${
                filter === type
                  ? "bg-orange-500 text-white"
                  : "bg-white border border-[#e2ddd6] text-gray-600 hover:border-orange-500"
              }`}
            >
              {type} ({kycs.length})
            </button>
          ))}
        </div>

        {/* Content */}
        {activeKyc ? (
          // Detail view
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#111827]">
                {activeKyc.first_name} {activeKyc.last_name}
              </h2>
              <button
                onClick={() => setActiveKyc(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Left column - User info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                  User Information
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Username", value: activeKyc.username },
                    { label: "Email", value: activeKyc.email },
                    { label: "First Name", value: activeKyc.first_name },
                    { label: "Last Name", value: activeKyc.last_name },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                      <p className="text-sm text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column - Document info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                  Document Information
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Citizenship", value: activeKyc.citizenship },
                    { label: "Passport Number", value: activeKyc.passport_no },
                    {
                      label: "Passport Expiry",
                      value: activeKyc.passport_expiry ? new Date(activeKyc.passport_expiry).toLocaleDateString() : "—",
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                      <p className="text-sm text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Passport Photo */}
            {activeKyc.passport_photo && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                  Passport Photo
                </h3>
                <img
                  src={activeKyc.passport_photo}
                  alt="Passport"
                  className="max-w-full h-auto rounded-lg border border-[#e2ddd6]"
                />
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-[#e2ddd6] pt-8">
              <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                Action
              </h3>

              {/* Rejection reason textarea */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the KYC is being rejected..."
                  className="w-full border border-[#e2ddd6] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveKyc(null)}
                  className="px-6 py-3 rounded-lg border border-[#e2ddd6] text-gray-600 font-semibold hover:border-orange-500 hover:text-orange-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(activeKyc.id)}
                  disabled={submitting || !rejectionReason.trim()}
                  className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(activeKyc.id)}
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          </div>
        ) : kycs.length > 0 ? (
          // List view
          <div className="grid gap-4">
            {kycs.map((kyc) => (
              <div
                key={kyc.id}
                onClick={() => setActiveKyc(kyc)}
                className="bg-white rounded-xl border border-[#e2ddd6] p-6 hover:shadow-lg hover:border-orange-500 cursor-pointer transition"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar and user info */}
                  <div className="flex items-start gap-4 flex-1">
                    {kyc.profile_picture && (
                      <img
                        src={kyc.profile_picture}
                        alt={kyc.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#111827]">
                        {kyc.first_name} {kyc.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">@{kyc.username}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileText className="w-4 h-4" />
                          {kyc.passport_no}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Expires: {new Date(kyc.passport_expiry).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <User className="w-4 h-4" />
                          {kyc.citizenship}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action hints */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Click to review</span>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1">
                        <X className="w-3 h-3" /> Reject
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approve
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="bg-white rounded-2xl border border-[#e2ddd6] p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-50 p-4">
                <AlertCircle className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#111827] mb-2">No Pending KYC Submissions</h3>
            <p className="text-gray-600">All KYC submissions have been reviewed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
