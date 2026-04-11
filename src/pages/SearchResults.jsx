import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Loader2, AlertCircle, ArrowLeft, Users } from "lucide-react";
import { useAuthRequired } from "../hooks/useAuthRequired";
import { apiFetch, getToken, getBaseUrl } from "../utils/api";

// ──── CONSTANTS ────
const API_URL = "http://127.0.0.1:8000";

const SIMILARITY_COLORS = {
  green: { bg: "bg-green-500/20", text: "text-green-400" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  gray: { bg: "bg-gray-600/20", text: "text-gray-400" },
};

const SIMILARITY_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
};

const BEST_MATCH_THRESHOLD = 75;

const TEXTS = {
  notAuthenticated: "Not authenticated. Please log in.",
  searchTitle: "Search",
  resultsFor: "Results for",
  searchingUsers: "Searching for users...",
  bestResult: "Best Result",
  otherResults: "other result",
  otherResultsPlural: "other results",
  noUsersFound: "No users found",
  tryelDifferent: "Try searching with different keywords",
  enterSearchQuery: "Enter a search query to find travelers",
  fetchErrorMsg: "Error fetching similarity for user",
  searchErrorMsg: "Failed to load search results",
};

function SimilarityBadge({ score }) {
  if (score === null || score === undefined) return null;
  
  let colors = SIMILARITY_COLORS.gray;
  
  if (score >= SIMILARITY_THRESHOLDS.excellent) {
    colors = SIMILARITY_COLORS.green;
  } else if (score >= SIMILARITY_THRESHOLDS.good) {
    colors = SIMILARITY_COLORS.blue;
  } else if (score >= SIMILARITY_THRESHOLDS.fair) {
    colors = SIMILARITY_COLORS.yellow;
  }
  
  const { bg: bgColor, text: textColor } = colors;
  
  return (
    <div className={`${bgColor} px-2.5 py-1 rounded-full text-xs font-medium ${textColor} min-w-fit`}>
      {score}% match
    </div>
  );
}

function UserRow({ user, similarity, onUserClick }) {
  const profilePicUrl = user.profile_picture?.startsWith("http")
    ? user.profile_picture
    : user.profile_picture
    ? `${API_URL}${user.profile_picture}`
    : null;

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.first_name || user.username;

  return (
    <div
      onClick={() => onUserClick(user.username)}
      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition group"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden flex items-center justify-center ring-1 ring-white/10 group-hover:ring-white/20 transition">
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
            <span className="text-sm font-bold text-white">
              {displayName[0].toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-white truncate">
            {displayName}
          </h3>
          <span className="text-xs text-white/50 flex-shrink-0">
            @{user.username}
          </span>
        </div>
        {user.location && (
          <div className="flex items-center gap-1 text-white/40 mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs truncate">{user.location}</span>
          </div>
        )}
      </div>

      {/* Similarity Score */}
      <div className="flex-shrink-0">
        <SimilarityBadge score={similarity} />
      </div>
    </div>
  );
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isReady: isAuthReady } = useAuthRequired();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarities, setSimilarities] = useState({});

  const searchUsers = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setError(TEXTS.notAuthenticated);
        return;
      }

      setLoading(true);
      setError(null);
      
      const data = await apiFetch(
        `users/search/?q=${encodeURIComponent(query)}`
      );
      
      setResults(data.results || []);
      
      // Fetch similarity scores for each result
      if (data.results && data.results.length > 0) {
        const similarityScores = {};
        for (const user of data.results) {
          try {
            const simData = await apiFetch(`users/similarity/${user.id}/`);
            similarityScores[user.id] = Math.round(simData.similarity || 0);
          } catch (err) {
            console.error("Error fetching similarity for user", user.id, ":", err);
            similarityScores[user.id] = null;
          }
        }
        setSimilarities(similarityScores);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to load search results");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query && isAuthReady) {
      searchUsers();
    } else if (!isAuthReady && query) {
      setLoading(false);
      setError(TEXTS.notAuthenticated);
    }
  }, [query, searchUsers, isAuthReady]);

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

  // Separate and sort results
  const bestMatches = results.filter((user) => (similarities[user.id] || 0) >= BEST_MATCH_THRESHOLD);
  const otherMatches = results
    .filter((user) => (similarities[user.id] || 0) < BEST_MATCH_THRESHOLD)
    .sort((a, b) => (similarities[b.id] || 0) - (similarities[a.id] || 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0c16] to-[#0f1219] pb-20">
      {/* Header */}
      <div className="border-b border-white/10 bg-[rgba(10,12,22,0.85)] backdrop-blur-md sticky top-16 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{TEXTS.searchTitle}</h1>
            {query && (
              <p className="text-xs text-white/50">
                {TEXTS.resultsFor} "{query}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin mb-3" />
            <p className="text-white/60 text-sm">{TEXTS.searchingUsers}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-white/80 text-sm">{error}</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            {/* Best Match Section */}
            {bestMatches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-green-400 to-green-600 rounded-full" />
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                    {TEXTS.bestResult}
                  </h2>
                </div>
                <div className="border border-green-500/20 rounded-lg overflow-hidden bg-green-500/5">
                  {bestMatches.map((user) => (
                    <div key={user.id} className="border-b border-green-500/10 last:border-b-0">
                      <UserRow
                        user={user}
                        similarity={similarities[user.id]}
                        onUserClick={handleUserClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Results Section */}
            {otherMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-white/60" />
                  <p className="text-xs text-white/60 font-medium">
                    <span className="font-semibold text-white">{otherMatches.length}</span> {otherMatches.length !== 1 ? TEXTS.otherResultsPlural : TEXTS.otherResults}
                  </p>
                </div>
                <div className="border border-white/10 rounded-lg overflow-hidden bg-white/[0.02] divide-y divide-white/10">
                  {otherMatches.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      similarity={similarities[user.id]}
                      onUserClick={handleUserClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 text-sm font-medium">{TEXTS.noUsersFound}</p>
            <p className="text-white/40 text-xs mt-1">
              {query
                ? TEXTS.tryelDifferent
                : TEXTS.enterSearchQuery}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
