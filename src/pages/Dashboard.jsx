import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://127.0.0.1:8000/api/trips";

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [tripRes, destRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/trips/`, { headers }),
        fetch(`${API_BASE}/destinations/`, { headers }),
        fetch(`${API_BASE}/expenses/`, { headers }),
      ]);

      // Check each response before parsing — a 404 returns HTML, not JSON
      if (!tripRes.ok) throw new Error(`Trips API error: ${tripRes.status}`);
      if (!destRes.ok) throw new Error(`Destinations API error: ${destRes.status}`);
      if (!expRes.ok) throw new Error(`Expenses API error: ${expRes.status}`);

      const tripsData = await tripRes.json();
      const destData = await destRes.json();
      const expData = await expRes.json();

      setTrips(tripsData);
      setDestinations(destData);
      setExpenses(expData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    }
  };

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-3xl font-bold">Travel Dashboard</h1>

      {!user && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          ℹ Please log in to view your dashboard.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠ {error} — check that your Django trips API is running and URLs are registered.
        </div>
      )}

      {user && (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Trips" value={trips.length} />
            <StatCard title="Destinations" value={destinations.length} />
            <StatCard title="Expenses" value={expenses.length} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ListCard title="Trips" data={trips} field="name" />
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
    <div className="p-4 border rounded-xl shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl">{value}</p>
    </div>
  );
}

function ListCard({ title, data, field }) {
  return (
    <div className="rounded-2xl shadow">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={index} className="border p-2 rounded">
              {item[field]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExpenseCard({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="rounded-2xl shadow">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">Expenses</h2>
        <p className="mb-2">Total: {total}</p>
        <ul className="space-y-2">
          {expenses.map((exp, i) => (
            <li key={i} className="border p-2 rounded">
              {exp.title} - {exp.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}