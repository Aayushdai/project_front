import { useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

export default function CreateTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    destination: {
      name: "",
      country: ""
    },
    start_date: "",
    end_date: "",
    description: "",
    is_public: true
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDestinationChange = (e) => {
    setForm({
      ...form,
      destination: {
        ...form.destination,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    API.post("trips/trips/", form)
      .then(res => navigate(`/trip/${res.data.id}`))
      .catch(err => console.error(err));
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Create Trip</h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <input name="title" placeholder="Title" onChange={handleChange} className="w-full p-2 border" />

          <input name="name" placeholder="City" onChange={handleDestinationChange} className="w-full p-2 border" />
          <input name="country" placeholder="Country" onChange={handleDestinationChange} className="w-full p-2 border" />

          <input type="date" name="start_date" onChange={handleChange} className="w-full p-2 border" />
          <input type="date" name="end_date" onChange={handleChange} className="w-full p-2 border" />

          <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full p-2 border" />

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}