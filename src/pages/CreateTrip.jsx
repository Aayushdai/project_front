import { useState, useEffect } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access_token");

export default function CreateTrip() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    destination_id: "",
    start_date: "",
    end_date: "",
    description: "",
    is_public: true
  });

  const [destinationName, setDestinationName] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [cities, setCities] = useState([]);
  const [allConstraintTags, setAllConstraintTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cities and constraint tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        const citiesRes = await API.get("trips/cities/");
        setCities(citiesRes.data || []);

        const tagsRes = await fetch(`${API_URL}/users/api/constraint-tags/`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const tagsData = await tagsRes.json();
        setAllConstraintTags(tagsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const groupedTags = allConstraintTags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

  const selectedTags = allConstraintTags.filter(t => selectedTagIds.includes(t.id));

  const toggleTag = (tagId, category) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        // Remove other tags from same category and add this one
        const otherTags = prev.filter(id => {
          const otherTag = allConstraintTags.find(t => t.id === id);
          return otherTag?.category !== category;
        });
        return [...otherTags, tagId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.destination_id || !form.start_date || !form.end_date) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        destination_id: parseInt(form.destination_id),
        constraint_tag_ids: selectedTagIds
      };

      const res = await API.post("trips/trips/", payload);
      navigate(`/trip/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create trip");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 transition";

  return (
    <div className="flex min-h-screen bg-[#0a0c16]">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-8">Create a New Trip</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Trip Title *</label>
              <input
                name="title"
                placeholder="e.g., Summer Europe Adventure"
                value={form.title}
                onChange={handleChange}
                className={inp}
              />
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Destination *</label>
              <select
                name="destination_id"
                value={form.destination_id}
                onChange={handleChange}
                className={inp}
              >
                <option value="">Select a city...</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className={inp}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">End Date *</label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className={inp}
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Description</label>
              <textarea
                name="description"
                placeholder="Tell others about your trip..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                className={`${inp} resize-none`}
              />
            </div>

            {/* Constraint Tags */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Trip Tags (Diet, Lifestyle, Values)</label>
              
              {/* Selected tags */}
              <div className="flex flex-wrap gap-2">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id, tag.category)}
                      className="rounded-full px-3 py-1.5 text-[11px] font-semibold bg-[#1976D2] border border-[#1976D2] text-white flex items-center gap-1.5 hover:bg-[#1565c0] transition"
                    >
                      {tag.name}
                      <X size={12} />
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-white/30 italic">Select tags to match with similar travelers...</p>
                )}
              </div>
              
              {/* Dropdown */}
              <div className="relative z-50">
                <button
                  type="button"
                  onClick={() => setTagsOpen(!tagsOpen)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/60 hover:border-[#1976D2]/50 transition"
                >
                  + Add tags
                </button>
                
                {tagsOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1117] border border-white/10 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                    {tagsLoading ? (
                      <div className="px-4 py-3 text-sm text-white/40">Loading tags...</div>
                    ) : (
                      Object.entries(groupedTags).map(([category, tags]) => (
                        <div key={category}>
                          <div className="sticky top-0 px-3 py-2 bg-white/5 border-b border-white/10 text-[10px] font-bold uppercase text-white/40">
                            {category.replace('_', ' ')}
                          </div>
                          {tags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleTag(tag.id, tag.category)}
                              className={`w-full text-left px-4 py-2.5 text-sm transition border-b border-white/5 last:border-0 ${
                                selectedTagIds.includes(tag.id)
                                  ? "bg-[#1976D2]/20 text-white font-semibold"
                                  : "text-white/60 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {selectedTagIds.includes(tag.id) ? "✓" : " "} {tag.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* is_public */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_public"
                checked={form.is_public}
                onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                className="w-4 h-4 rounded border-white/10"
              />
              <label className="text-sm text-white/70">Make this trip public (other travelers can find it)</label>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#1976D2] py-3 text-sm font-bold text-white transition hover:bg-[#1565c0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Trip"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}