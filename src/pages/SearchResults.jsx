import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Loader2, AlertCircle, ArrowLeft, Users, Zap } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarities, setSimilarities] = useState({});

  const searchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(
        `${API_URL}/users/api/search/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch results");
      
      const data = await response.json();
      setResults(data.results || []);
      
      // Fetch similarity scores for each result
      if (data.results && data.results.length > 0) {
        const similarityScores = {};
        for (const user of data.results) {
          try {
            const simResponse = await fetch(
              `${API_URL}/users/api/similarity/${user.id}/`,
              {
                headers: {
                  "Authorization": `Bearer ${token}`,
                },
              }
            );
            const simData = await simResponse.json();
            similarityScores[user.id] = simData.similarity;
          } catch (err) {
            console.error("Error fetching similarity:", err);
            similarityScores[user.id] = null;
          }
        }
        setSimilarities(similarityScores);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to load search results");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      searchUsers();
    }
  }, [query, searchUsers]);

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

  const getSimilarityColor = (score) => {
    if (!score) return "text-white/40";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getSimilarityBgColor = (score) => {
    if (!score) return "bg-white/5";
    if (score >= 80) return "bg-green-400/10";
    if (score >= 60) return "bg-yellow-400/10";
    if (score >= 40) return "bg-orange-400/10";
    return "bg-red-400/10";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0c16] to-[#0f1219] pb-40">
      {/* Header */}
      <div className="border-b border-white/10 bg-[rgba(10,12,22,0.85)] backdrop-blur-md sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Search Results</h1>
            <p className="text-xs text-white/50">
              {query && `Results for "${query}"`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin mb-3" />
            <p className="text-white/60">Searching for users...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-white/80">{error}</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-white/60" />
              <p className="text-white/60">
                Found <span className="font-semibold text-white">{results.length}</span> user{results.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((user) => {
                const profilePicUrl = user.profile_picture?.startsWith("http")
                  ? user.profile_picture
                  : user.profile_picture
                  ? `${API_URL}${user.profile_picture}`
                  : null;
                
                const similarity = similarities[user.id];

                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.username)}
                    className={`relative bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition transform hover:scale-105 ${getSimilarityBgColor(similarity)}`}
                  >
                    {/* Similarity Badge */}
                    {similarity !== null && (
                      <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border ${getSimilarityColor(similarity).includes('green') ? 'border-green-400/30' : getSimilarityColor(similarity).includes('yellow') ? 'border-yellow-400/30' : getSimilarityColor(similarity).includes('orange') ? 'border-orange-400/30' : 'border-red-400/30'} ${getSimilarityColor(similarity)}`}>
                        <Zap className="w-3 h-3" />
                        <span className="text-xs font-semibold">{similarity}%</span>
                      </div>
                    )}

                    {/* Avatar */}
                    <div className="mb-4">
                      <div className="w-full h-32 rounded-xl bg-[#1976D2] overflow-hidden flex items-center justify-center ring-2 ring-white/10">
                        {profilePicUrl ? (
                          <img
                            src={profilePicUrl}
                            alt={user.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-4xl font-bold text-white">
                            {(user.first_name || user.username)[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-white">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.first_name || user.username}
                      </h3>
                      <p className="text-xs text-white/50">@{user.username}</p>
                    </div>

                    {user.location && (
                      <div className="flex items-center gap-1 text-white/60 mb-3">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{user.location}</span>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <button className="w-full py-2 px-3 bg-[#1976D2] hover:bg-[#1565C0] text-white text-xs font-medium rounded-lg transition">
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 mb-2">No users found</p>
            <p className="text-white/30 text-sm">
              {query ? `Try searching with different keywords` : "Enter a search query to find users"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
