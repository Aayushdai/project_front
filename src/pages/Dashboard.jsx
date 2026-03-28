import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../API/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tripRes, destRes, expRes, cityRes] = await Promise.all([
        api.get("trips/trips/"),
        api.get("trips/destinations/"),
        api.get("trips/expenses/"),
        api.get("trips/cities/"),
      ]);

      setTrips(tripRes.data || []);
      setDestinations(destRes.data || []);
      setExpenses(expRes.data || []);
      setCities(cityRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-6 grid gap-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Travel Dashboard</h1>
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Trips" value={trips.length} />
            <StatCard title="Destinations" value={destinations.length} />
            <StatCard title="Expenses" value={expenses.length} />
          </div>

          <div className="flex gap-4">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ↻ Refresh
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ListCard title="Trips" data={trips} field="title" />
            <ListCard title="Destinations" data={destinations} field="name" />
          </div>

          <ExpenseCard expenses={expenses} />
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition">
      <h2 className="text-sm font-medium text-gray-600">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ListCard({ title, data, field }) {
  return (
    <div className="rounded-xl shadow-sm bg-white border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {data.length === 0 ? (
          <p className="text-gray-500 text-sm">No {title.toLowerCase()} yet</p>
        ) : (
          <ul className="space-y-2">
            {data.map((item, index) => (
              <li
                key={index}
                className="border border-gray-200 p-3 rounded bg-gray-50 hover:bg-gray-100 transition"
              >
                {item[field] || "Unnamed"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ExpenseCard({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="rounded-xl shadow-sm bg-white border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Expenses</h2>
        <p className="text-2xl font-bold mb-4">₹ {total.toFixed(2)}</p>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-sm">No expenses recorded</p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((exp, i) => (
              <li
                key={i}
                className="border border-gray-200 p-3 rounded bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition"
              >
                <span>{exp.description || "Expense"}</span>
                <span className="font-semibold">₹ {exp.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}