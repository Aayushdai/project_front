import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, X, Zap } from "lucide-react";

export default function UserSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [similarities, setSimilarities] = useState({});
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Search users when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(query);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchUsers = async (q) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/users/api/search/?q=${q}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Search results:", data);
      setResults(data.results || []);
      setIsOpen(true);
      
      // Fetch similarity scores
      if (data.results && data.results.length > 0) {
        const simScores = {};
        for (const user of data.results) {
          try {
            const simResponse = await fetch(
              `http://127.0.0.1:8000/users/api/similarity/${user.id}/`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            const simData = await simResponse.json();
            simScores[user.id] = simData.similarity;
          } catch (err) {
            console.error("Error fetching similarity:", err);
          }
        }
        setSimilarities(simScores);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery("");
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search users..."
          className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-[#111] border border-white/10 shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
              <span className="ml-2 text-sm text-white/60">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((user) => {
                const similarity = similarities[user.id];
                let simColor = "text-white/40";
                if (similarity >= 80) simColor = "text-green-400";
                else if (similarity >= 60) simColor = "text-yellow-400";
                else if (similarity >= 40) simColor = "text-orange-400";
                else if (similarity) simColor = "text-red-400";
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.username)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition border-b border-white/5 last:border-b-0"
                  >
                    {/* Profile Picture */}
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#1976D2] flex items-center justify-center overflow-hidden">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt={user.username}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {(user.first_name || user.username)[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.first_name || user.username}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        @{user.username}
                        {user.location && ` • ${user.location}`}
                      </p>
                    </div>

                    {/* Similarity Badge */}
                    {similarity !== undefined && (
                      <div className={`flex items-center gap-1 text-xs font-semibold ${simColor}`}>
                        <Zap className="w-3 h-3" />
                        {similarity}%
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="px-4 py-3 border-t border-white/5 text-center">
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs text-[#1976D2] hover:text-[#1565C0] font-semibold transition"
                >
                  See all results for "{query}"
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-white/50">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
