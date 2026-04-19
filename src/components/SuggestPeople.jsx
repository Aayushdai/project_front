import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Users, Loader2, AlertCircle, UserPlus, X, ChevronRight, ChevronLeft, Gem } from "lucide-react";
import { apiFetch, getBaseUrl } from "../utils/api";

// ============================================
// CONSTANTS
// ============================================
const FONTS = {
  display: "Playfair Display, Georgia, serif",
  body: "DM Sans, system-ui, sans-serif",
  mono: "DM Mono, monospace",
};

const COLORS = {
  primary: "#C9A84C",
  primaryHover: "#d4b85f",
};

const SCROLL_AMOUNT = 250; // Card width + gap

const MESSAGES = {
  loading: "Finding people for you...",
  noSuggestions: "No suggestions available yet",
  noSuggestionsHint: "Once more travelers join and verify their profiles, you'll see personalized recommendations",
  error: "Could not load suggestions",
  sendFriendRequest: "Could not send friend request: ",
  kycRequired: "KYC Verification Required",
  kycMessage: "To see personalized people suggestions and connect with travelers, you need to complete identity verification first.",
  profileIncomplete: "Complete Your Profile",
  profileMessage: "To get personalized recommendations, please fill in these details:",
};

const CAROUSEL_CSS = `
  .suggest-people-carousel::-webkit-scrollbar {
    display: none;
  }
  .suggest-people-carousel {
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }
`;

function SuggestedUserCard({ user, onAddFriend, onCancelRequest, onDismiss, isPending = false }) {
  const avatar = user.profile_picture?.startsWith("http")
    ? user.profile_picture
    : user.profile_picture ? `${getBaseUrl()}${user.profile_picture}` : null;

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ") || user.username || "Traveller";
  const initial = fullName[0]?.toUpperCase() || "T";

  // Calculate mutual friends (if available from API response)
  const mutualFriendsCount = user.mutual_friends_count || 0;

  return (
    <div className="group relative flex-shrink-0 w-48 rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#C9A84C]/40 transition-all hover:shadow-lg hover:shadow-[#C9A84C]/20">
      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss?.(user.id)}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition group-hover:bg-[#C9A84C]/30"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Profile Image */}
      <Link to={`/user/${user.username}`} className="block">
        <div className="relative h-56 bg-gradient-to-br from-[#C9A84C]/40 to-[#8b6914]/40 overflow-hidden">
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-[#C9A84C]/40">
              {initial}
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      </Link>

      {/* Info Section */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {/* Name */}
        <Link to={`/user/${user.username}`}>
          <h3
            className="text-base font-bold text-white hover:text-[#C9A84C] transition line-clamp-2"
            style={{ fontFamily: FONTS.body }}
          >
            {fullName}
          </h3>
        </Link>

        {/* Mutual Friends */}
        {mutualFriendsCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-white/60" style={{ fontFamily: FONTS.body }}>
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{mutualFriendsCount} mutual friend{mutualFriendsCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Add Friend Button or Cancel Request */}
        <button
          onClick={() => isPending ? onCancelRequest?.(user.id) : onAddFriend?.(user.id)}
          className={`w-full rounded-xl font-bold text-sm py-2.5 transition flex items-center justify-center gap-2 ${
            isPending
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
              : 'bg-[#C9A84C] hover:bg-[#d4b85f] text-black'
          }`}
          style={{ fontFamily: FONTS.body }}
        >
          {isPending ? (
            <>
              <X className="w-4 h-4" />
              Cancel Request
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Add friend
            </>
          )}
        </button>

        {/* View Profile Link */}
        <Link
          to={`/user/${user.username}`}
          className="w-full text-center rounded-lg bg-white/8 hover:bg-white/12 text-white text-xs font-semibold py-2 transition"
          style={{ fontFamily: FONTS.body }}
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default function SuggestPeople({ currentUserId }) {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(() => {
    const saved = localStorage.getItem('pendingFriendRequests');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kycRequired, setKycRequired] = useState(false);
  const [incompleteProfile, setIncompleteProfile] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const carouselRef = useRef(null);

  // Persist pending requests to localStorage
  useEffect(() => {
    localStorage.setItem('pendingFriendRequests', JSON.stringify(pendingRequests));
  }, [pendingRequests]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        setKycRequired(false);
        setIncompleteProfile([]);

        // First, fetch user's profile to check completeness
        let userProfile = null;
        try {
          userProfile = await apiFetch("users/me/");
        } catch (err) {
          // Silent fail - continue without profile check
        }

        // Check profile completeness for critical matching fields only
        const incomplete = [];
        if (userProfile) {
          // Only check for travel preferences that affect matching
          // DOB is already saved from registration
          if (!userProfile.travel_style) incomplete.push("Travel style");
          if (!userProfile.pace) incomplete.push("Travel pace");
          if (!userProfile.accomodation_preference && !userProfile.accommodation_preference) incomplete.push("Accommodation preference");
        }

        if (incomplete.length > 0) {
          setIncompleteProfile(incomplete);
        }

        // Fetch similar users (requires KYC)
        let suggestions = [];
        
        try {
          const similarData = await apiFetch("users/matches/");
          
          if (Array.isArray(similarData) && similarData.length > 0) {
            const enhancedMatches = [];
            
            for (const match of similarData) {
              try {
                const userSearch = await apiFetch(`users/search/?q=${encodeURIComponent(match.username)}`);
                if (userSearch.results && userSearch.results.length > 0) {
                  const user = userSearch.results[0];
                  
                  // Set mutual friends count (default to 0 since endpoint might not exist)
                  user.mutual_friends_count = 0;
                  
                  enhancedMatches.push({
                    ...user,
                    similarity: match.similarity,
                  });
                }
              } catch (err) {
                // Silent fail for user search
              }
            }
            
            suggestions = enhancedMatches;
          }
        } catch (err) {
          // Check if it's a KYC error (403)
          if (err.message?.includes('403') || err.status === 403) {
            setKycRequired(true);
          } else {
            // Silent fail - user profile incomplete or no matches available
          }
        }

        setAllSuggestions(suggestions);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setError("Could not load suggestions");
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchSuggestions();
    }
  }, [currentUserId]);

  const handleAddFriend = async (userId) => {
    try {
      await apiFetch(`users/friend-request/send/${userId}/`, { method: "POST" });
      setPendingRequests([...pendingRequests, userId]);
      alert("Friend request sent!");
    } catch (err) {
      alert(MESSAGES.sendFriendRequest + err.message);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await apiFetch(`users/friend-request/cancel/${userId}/`, { method: "POST" });
      setPendingRequests(pendingRequests.filter(id => id !== userId));
      alert("Friend request cancelled!");
    } catch (err) {
      alert("Could not cancel friend request: " + err.message);
    }
  };

  const handleDismiss = (userId) => {
    setDismissed([...dismissed, userId]);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" />
        <p className="text-sm text-white/40" style={{ fontFamily: FONTS.body }}>
          {MESSAGES.loading}
        </p>
      </div>
    );
  }

  // KYC Required Message
  if (kycRequired) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-8 max-w-md text-center">
          <Gem className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 
            className="text-base font-bold text-amber-300 mb-2"
            style={{ fontFamily: FONTS.body }}
          >
            {MESSAGES.kycRequired}
          </h3>
          <p 
            className="text-sm text-amber-200/70 mb-4"
            style={{ fontFamily: FONTS.body }}
          >
            {MESSAGES.kycMessage}
          </p>
          <Link
            to="/kyc"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 font-semibold text-sm transition"
            style={{ fontFamily: FONTS.body }}
          >
            Complete KYC Verification <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Incomplete Profile Message
  if (incompleteProfile.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-8 max-w-md text-center">
          <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 
            className="text-base font-bold text-blue-300 mb-2"
            style={{ fontFamily: FONTS.body }}
          >
            {MESSAGES.profileIncomplete}
          </h3>
          <p 
            className="text-sm text-blue-200/70 mb-4"
            style={{ fontFamily: FONTS.body }}
          >
            {MESSAGES.profileMessage}
          </p>
          <div className="bg-blue-500/5 border border-blue-400/20 rounded-lg p-3 mb-4">
            <ul className="text-left text-sm text-blue-200/80 space-y-1">
              {incompleteProfile.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/40 text-blue-300 font-semibold text-sm transition"
            style={{ fontFamily: FONTS.body }}
          >
            Edit Profile <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const visibleSuggestions = allSuggestions.filter(u => !dismissed.includes(u.id));

  if (visibleSuggestions.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Users className="w-8 h-8 text-white/20" />
        <p className="text-sm text-white/40" style={{ fontFamily: FONTS.body }}>
          {MESSAGES.noSuggestions}
        </p>
        <p className="text-xs text-white/25 text-center max-w-xs" style={{ fontFamily: FONTS.body }}>
          {MESSAGES.noSuggestionsHint}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300" style={{ fontFamily: FONTS.body }}>
            {error}
          </p>
        </div>
      )}

      {visibleSuggestions.length > 0 && (
        <div>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-[#C9A84C]" />
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: FONTS.display }}
                >
                  {showAll ? "All Suggestions" : "People you may know"}
                </h3>
              </div>
              <p className="text-xs text-white/40" style={{ fontFamily: FONTS.body }}>
                {showAll ? `Showing all ${visibleSuggestions.length} suggestions` : "Based on your travel style and interests"}
              </p>
            </div>
            {!showAll && visibleSuggestions.length > 4 && (
              <button
                onClick={() => setShowAll(true)}
                className="flex items-center gap-1 text-sm text-[#C9A84C] hover:text-[#d4b85f] transition"
                style={{ fontFamily: FONTS.body }}
              >
                See more <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {showAll && (
              <button
                onClick={() => setShowAll(false)}
                className="flex items-center gap-1 text-sm text-[#C9A84C] hover:text-[#d4b85f] transition"
                style={{ fontFamily: FONTS.body }}
              >
                Show carousel <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Horizontal Carousel with Navigation OR Grid View */}
          <style>{CAROUSEL_CSS}</style>
          
          {!showAll ? (
            <div className="relative group">
              {/* Left Arrow */}
              <button
                onClick={() => scrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#C9A84C]/20 hover:bg-[#C9A84C]/40 border border-[#C9A84C]/50 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-[#C9A84C]" />
              </button>

              {/* Carousel */}
              <div
                ref={carouselRef}
                className="suggest-people-carousel flex gap-4 overflow-x-auto pb-4 px-4"
              >
                {visibleSuggestions.map((user) => (
                  <SuggestedUserCard
                    key={user.id}
                    user={user}
                    onAddFriend={handleAddFriend}
                    onCancelRequest={handleCancelRequest}
                    onDismiss={handleDismiss}
                    isPending={pendingRequests.includes(user.id)}
                  />
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#C9A84C]/20 hover:bg-[#C9A84C]/40 border border-[#C9A84C]/50 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-[#C9A84C]" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleSuggestions.map((user) => (
                <SuggestedUserCard
                  key={user.id}
                  user={user}
                  onAddFriend={handleAddFriend}
                  onCancelRequest={handleCancelRequest}
                  onDismiss={handleDismiss}
                  isPending={pendingRequests.includes(user.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
