import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MessageCircle, ArrowLeft } from "lucide-react";

const StatsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("visual");
  const [stats, setStats] = useState({
    totalUsers: 1000,
    activeUsers: 820,
    deletedAccounts: 180,
    totalTrips: 3420,
    completedTrips: 2890,
    verifiedUsers: 680,
    nonVerifiedUsers: 320,
  });

  // Sample chart data
  const userGrowthData = [
    { month: "Jan", newUsers: 45 },
    { month: "Feb", newUsers: 58 },
    { month: "Mar", newUsers: 72 },
    { month: "Apr", newUsers: 88 },
    { month: "May", newUsers: 95 },
    { month: "Jun", newUsers: 100 },
    { month: "Jul", newUsers: 98 },
    { month: "Aug", newUsers: 105 },
    { month: "Sep", newUsers: 115 },
    { month: "Oct", newUsers: 110 },
    { month: "Nov", newUsers: 118 },
    { month: "Dec", newUsers: 125 },
  ];

  const tripActivityData = [
    { month: "Jan", total: 250, completed: 180 },
    { month: "Feb", total: 280, completed: 210 },
    { month: "Mar", total: 320, completed: 250 },
    { month: "Apr", total: 300, completed: 240 },
    { month: "May", total: 350, completed: 290 },
    { month: "Jun", total: 380, completed: 310 },
    { month: "Jul", total: 400, completed: 330 },
    { month: "Aug", total: 420, completed: 350 },
    { month: "Sep", total: 450, completed: 380 },
    { month: "Oct", total: 480, completed: 410 },
    { month: "Nov", total: 520, completed: 450 },
    { month: "Dec", total: 600, completed: 520 },
  ];

  const accountBreakdownData = [
    { name: "Verified", value: 680 },
    { name: "Non-Verified", value: 320 },
  ];

  const accountStatusData = [
    { month: "Jan", active: 600, deleted: 50 },
    { month: "Feb", active: 650, deleted: 55 },
    { month: "Mar", active: 700, deleted: 60 },
    { month: "Apr", active: 750, deleted: 65 },
    { month: "May", active: 780, deleted: 75 },
    { month: "Jun", active: 800, deleted: 80 },
    { month: "Jul", active: 810, deleted: 85 },
    { month: "Aug", active: 815, deleted: 90 },
    { month: "Sep", active: 820, deleted: 100 },
    { month: "Oct", active: 825, deleted: 110 },
    { month: "Nov", active: 830, deleted: 120 },
    { month: "Dec", active: 820, deleted: 140 },
  ];

  const COLORS = ["#FF9800", "#4CAF50"];

  return (
    <div style={{ minHeight: "100vh", background: "#111111", fontFamily: "'Syne', sans-serif", color: "#fff" }}>
      {/* Navigation Bar */}
      <div style={{ background: "#1a1a1a", borderBottom: "1px solid #333", padding: "1rem 2rem" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            color: "#999",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        {/* Sidebar */}
        <div style={{
          width: "240px",
          background: "#1a1a1a",
          borderRight: "1px solid #333",
          padding: "2rem 1.5rem",
        }}>
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Menu
            </p>
            <button
              onClick={() => setActiveTab("visual")}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: activeTab === "visual" ? "rgba(76, 175, 80, 0.2)" : "transparent",
                border: activeTab === "visual" ? "2px solid #4CAF50" : "2px solid transparent",
                borderRadius: "8px",
                color: activeTab === "visual" ? "#4CAF50" : "#999",
                fontWeight: activeTab === "visual" ? 600 : 500,
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>📊</span> Graph and chart
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: activeTab === "chat" ? "rgba(76, 175, 80, 0.2)" : "transparent",
                border: activeTab === "chat" ? "2px solid #4CAF50" : "2px solid transparent",
                borderRadius: "8px",
                color: activeTab === "chat" ? "#4CAF50" : "#999",
                fontWeight: activeTab === "chat" ? 600 : 500,
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <MessageCircle size={18} /> Chat
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {activeTab === "visual" && (
            <>
              {/* Header */}
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem 0" }}>
                  Visual analytics
                </h1>
                <p style={{ fontSize: "1rem", color: "#999", margin: 0 }}>
                  Comprehensive platform insights
                </p>
              </div>

              {/* Stat Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}>
                {[
                  { label: "TOTAL USERS", value: stats.totalUsers, badge: "All time", color: "#2196F3" },
                  { label: "ACTIVE USERS", value: stats.activeUsers, badge: "Live", color: "#4CAF50" },
                  { label: "DELETED", value: stats.deletedAccounts, badge: "Churned", color: "#f44336" },
                  { label: "TOTAL TRIPS", value: stats.totalTrips, badge: "All time", color: "#FF9800" },
                  { label: "COMPLETED", value: stats.completedTrips, badge: "Done", color: "#8BC34A" },
                  { label: "VERIFIED", value: stats.verifiedUsers, badge: "Trust", color: "#00BCD4" },
                  { label: "NON-VERIFIED", value: stats.nonVerifiedUsers, badge: "Pending", color: "#FFC107" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    <p style={{ fontSize: "0.8rem", color: "#666", fontWeight: 600, margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", margin: "0.5rem 0" }}>
                      {stat.value.toLocaleString()}
                    </p>
                    <span style={{
                      display: "inline-block",
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.75rem",
                      background: `${stat.color}30`,
                      color: stat.color,
                      borderRadius: "12px",
                      fontWeight: 600,
                    }}>
                      {stat.badge}
                    </span>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
                {/* User Growth Chart */}
                <div style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", margin: "0 0 1rem 0" }}>
                    USER GROWTH
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 1rem 0" }}>
                    New registrations over time
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#666" style={{ fontSize: "0.8rem" }} />
                      <YAxis stroke="#666" style={{ fontSize: "0.8rem" }} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
                      <Line
                        type="monotone"
                        dataKey="newUsers"
                        stroke="#2196F3"
                        strokeWidth={3}
                        dot={{ fill: "#2196F3", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Trip Activity Chart */}
                <div style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", margin: "0 0 1rem 0" }}>
                    TRIP ACTIVITY
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 1rem 0" }}>
                    Total vs completed trips
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={tripActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#666" style={{ fontSize: "0.8rem" }} />
                      <YAxis stroke="#666" style={{ fontSize: "0.8rem" }} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
                      <Legend />
                      <Bar dataKey="total" fill="#2196F3" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="completed" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Account Breakdown Chart */}
                <div style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", margin: "0 0 1rem 0" }}>
                    ACCOUNT VERIFICATION
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 1rem 0" }}>
                    Verified vs unverified accounts
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={accountBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {accountBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Account Status Chart */}
                <div style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", margin: "0 0 1rem 0" }}>
                    ACCOUNT STATUS
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 1rem 0" }}>
                    Active vs deleted accounts over time
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={accountStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#666" style={{ fontSize: "0.8rem" }} />
                      <YAxis stroke="#666" style={{ fontSize: "0.8rem" }} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="active"
                        stroke="#2196F3"
                        strokeWidth={2}
                        dot={{ fill: "#2196F3", r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="deleted"
                        stroke="#f44336"
                        strokeWidth={2}
                        dot={{ fill: "#f44336", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeTab === "chat" && (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ fontSize: "1.5rem", color: "#666" }}>Chat section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
