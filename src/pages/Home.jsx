import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import bg from "../assets/bg.png";
import api from "../API/api";
import PeopleIcon from "@mui/icons-material/People";
import RoomIcon from "@mui/icons-material/Room";
import ShieldIcon from "@mui/icons-material/Shield";

const features = [
  { icon: <PeopleIcon />, title: "Smart Matching", desc: "Connect with travelers who share your pace and interests", tag: "AI-Powered" },
  { icon: <RoomIcon />, title: "Trip Planning", desc: "Build itineraries together in real time", tag: "Collaborative" },
  { icon: <ShieldIcon />, title: "Safe & Verified", desc: "Verified members and 24/7 support keep you safe", tag: "Trusted" },
];

export default function Home() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    api.get("trips/destinations/")
      .then((res) => setDestinations(res.data))
      .catch((err) => console.error("Destinations fetch failed:", err));
  }, []);

  const handleDestinationClick = (destinationName) => {
    navigate("/explore", { state: { destinationName } });
  };

  // Pagination logic
  const totalPages = Math.ceil(destinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDestinations = destinations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="font-[Poppins,sans-serif] bg-[#f8f6f1] text-[#1a1a2e]">

      {/* ── Hero ── */}
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden text-center">
        <div
          className="absolute inset-0 bg-cover bg-[center_30%]"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/45 to-[#0a0f1e]/90" />

        <div className="relative z-10 max-w-2xl px-4">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white drop-shadow-lg md:text-5xl">
            Find Your Partner<br />
            <span className="text-[#ffd580]">for the Adventure</span>
          </h1>

          <p className="mb-6 font-light text-white/75">
            Connect with like-minded travelers, plan trips together,
            and explore the world — one journey at a time.
          </p>

          {/* Search */}
          <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full bg-white px-5 py-2 shadow-lg relative">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destination, people, or trips…"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  const match = destinations.find(d => d.name.toLowerCase().includes(query.toLowerCase()));
                  if (match) {
                    handleDestinationClick(match.name);
                  }
                }
              }}
            />
            <button 
              onClick={() => {
                const match = destinations.find(d => d.name.toLowerCase().includes(query.toLowerCase()));
                if (match) {
                  handleDestinationClick(match.name);
                }
              }}
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-1.5 text-sm font-medium text-white hover:brightness-110 transition"
            >
              Explore →
            </button>

            {/* Search dropdown */}
            {query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {destinations.filter(d => d.name.toLowerCase().includes(query.toLowerCase())).length > 0 ? (
                  destinations.filter(d => d.name.toLowerCase().includes(query.toLowerCase())).map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleDestinationClick(d.name)}
                      className="w-full text-left px-5 py-3 border-b last:border-b-0 hover:bg-orange-50 transition flex items-center gap-3"
                    >
                      {d.image ? (
                        <img src={d.image} alt={d.name} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <MapPin className="w-10 h-10 text-gray-400" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.location}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-3 text-center text-sm text-gray-500">
                    No destinations found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <span className="text-[11px] uppercase tracking-widest">Scroll</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Popular Destinations</h2>
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, destinations.length)} of {destinations.length}
          </p>
        </div>

        {destinations.length === 0 ? (
          <p className="text-gray-400">No destinations found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {paginatedDestinations.map((d) => (
                <div 
                  key={d.id} 
                  onClick={() => handleDestinationClick(d.name)}
                  className="group rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="relative h-40 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
                    {d.image ? (
                      <img 
                        src={d.image} 
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <MapPin className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{d.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{d.location}</p>
                    {d.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{d.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === page
                          ? "bg-orange-500 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Features ── */}
      <section className="bg-[#111827] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#ffd580]">
            Why Travel Sathi?
          </p>
          <h2 className="mb-12 text-3xl font-semibold text-white">
            Your journey,{" "}
            <span className="italic text-[#ffd580]">elevated</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {features.map(({ icon, title, desc, tag }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/8 bg-white/[0.04] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ffd580]/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffd580]/10 text-[#ffd580]">
                  {icon}
                </div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#ffd580]">{tag}</p>
                <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
}