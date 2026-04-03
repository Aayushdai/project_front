import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Star,
  Wallet,
  Gem,
  Sunrise,
  Mountain,
  Zap,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Building2,
  Home,
  Tent,
  X,
  Globe,
  MessageCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const FONTS = {
  display: "Playfair Display, Georgia, serif",
  body: "DM Sans, system-ui, sans-serif",
  mono: "DM Mono, monospace",
};

function SimilarityBadge({ score }) {
  if (!score && score !== 0) return null;
  
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-[#C9A84C]/15 border-[#C9A84C]/40 text-[#C9A84C]">
      <Zap className="w-4 h-4" />
      <span className="font-semibold" style={{ fontFamily: FONTS.body }}>{score}% Match</span>
    </div>
  );
}

const StyleIcon = ({ style }) => {
  const map = { budget: [Wallet, "#C9A84C"], luxury: [Gem, "#ffffff"], adventure: [Mountain, "#C9A84C"] };
  const [Icon, color] = map[style] || [Wallet, "#444"];
  return <Icon style={{ color }} className="w-5 h-5" />;
};

const PaceIcon = ({ pace }) => {
  const map = { relaxed: [Sunrise, "#C9A84C"], moderate: [Zap, "#ffffff"], fast_paced: [Zap, "#C9A84C"] };
  const [Icon, color] = map[pace] || [Zap, "#444"];
  return <Icon style={{ color }} className="w-5 h-5" />;
};

const AccommIcon = ({ accomm }) => {
  const map = { hostel: [Building2, "#C9A84C"], hotel: [Building2, "#ffffff"], inn: [Home, "#C9A84C"], camping: [Tent, "#ffffff"] };
  const [Icon, color] = map[accomm] || [Home, "#444"];
  return <Icon style={{ color }} className="w-5 h-5" />;
};

export default function UserProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarity, setSimilarity] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [friendUserFriends, setFriendUserFriends] = useState([]);
  const [userKycStatus, setUserKycStatus] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserKycStatus();
  }, [username]);

  const fetchUserKycStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/users/api/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserKycStatus(data.status);
      }
    } catch (err) {
      console.error("Error fetching KYC status:", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Fetch user by username from search results
      const searchResponse = await fetch(`http://127.0.0.1:8000/users/api/search/?q=${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!searchResponse.ok) throw new Error(`Search failed: ${searchResponse.status}`);
      const searchData = await searchResponse.json();
      const results = searchData.results;
      
      const foundUser = results.find(u => u.username === username);
      if (!foundUser) {
        setError("User not found");
        return;
      }

      // Get full profile details
      const profileResponse = await fetch(`http://127.0.0.1:8000/users/api/user-profile/${foundUser.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!profileResponse.ok) throw new Error(`Profile fetch failed: ${profileResponse.status}`);
      const profileData = await profileResponse.json();
      setUserData({
        ...foundUser,
        ...profileData
      });

      // Get similarity score
      const similarityResponse = await fetch(`http://127.0.0.1:8000/users/api/similarity/${foundUser.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      let similarity = null;
      if (similarityResponse.ok) {
        const simData = await similarityResponse.json();
        similarity = simData.similarity;
        setSimilarity(similarity);
      }

      // Get friend request status
      const statusResponse = await fetch(`http://127.0.0.1:8000/users/api/friend-request/status/${foundUser.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setFriendStatus(statusData);
      }

      // Fetch user's friends
      const friendsResponse = await fetch(`http://127.0.0.1:8000/users/api/friends/${foundUser.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriendUserFriends(friendsData.friends || []);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!userData) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/users/api/friend-request/send/${userData.id}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok) {
        setFriendStatus({ status: result.status, type: result.type, request_id: result.request_id });
      } else {
        console.error("Error sending friend request:", result);
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!userData) return;
    // Store the friend ID temporarily so Chat.jsx can auto-select the conversation
    sessionStorage.setItem('selectedFriendId', userData.id);
    sessionStorage.setItem('selectedFriendName', userData.username);
    navigate('/chat');
  };

  const respondToFriendRequest = async (action) => {
    if (!friendStatus?.request_id) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/users/api/friend-request/${friendStatus.request_id}/respond/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (response.ok) {
        setFriendStatus({ status: result.status });
      } else {
        console.error("Error responding to request:", result);
      }
    } catch (err) {
      console.error("Error responding to request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelFriendRequest = async () => {
    if (!friendStatus?.request_id) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/users/api/friend-request/${friendStatus.request_id}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setFriendStatus({ status: 'none' });
      } else {
        const result = await response.json();
        console.error("Error cancelling request:", result);
      }
    } catch (err) {
      console.error("Error cancelling request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0c16] to-[#0f1219] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0c16] to-[#0f1219] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-white/80">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const profilePicUrl = userData.profile_picture?.startsWith("http")
    ? userData.profile_picture
    : userData.profile_picture
    ? `${API_URL}${userData.profile_picture}`
    : null;

  const isOwnProfile = currentUser?.username === username;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-gradient-to-b from-[#0a0c16] to-[#0e0e0e] pb-40 pt-20">
        {/* Main Content - Max Width Container */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Profile Header with Avatar Offset */}
          <div className="flex gap-8 -mt-14 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#9a7a3f] overflow-hidden flex-shrink-0 ring-4 ring-[#0a0c16] flex items-center justify-center shadow-lg">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={userData.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span
                    className="text-6xl font-bold text-[#0a0c16]"
                    style={{ fontFamily: FONTS.display }}
                  >
                    {(userData.first_name || userData.username)[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 pt-4">
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1
                      className="text-4xl font-bold text-white mb-2"
                      style={{ fontFamily: FONTS.display }}
                    >
                      {userData.first_name && userData.last_name
                        ? `${userData.first_name} ${userData.last_name}`
                        : userData.username}
                    </h1>
                    <p className="text-[#C9A84C] text-sm">@{userData.username}</p>
                  </div>
                  {similarity !== null && <SimilarityBadge score={similarity} />}
                </div>
              </div>

              {userData.location && (
                <div className="flex items-center gap-2 text-white/70 mb-3">
                  <MapPin className="w-5 h-5 text-[#C9A84C]" />
                  <span style={{ fontFamily: FONTS.body }}>{userData.location}</span>
                </div>
              )}

              {userData.bio && (
                <p
                  className="text-white/80 mb-6 leading-relaxed"
                  style={{ fontFamily: FONTS.body }}
                >
                  {userData.bio}
                </p>
              )}

              {/* Action Buttons */}
              {!isOwnProfile && (
                <>
                  {userKycStatus && userKycStatus !== 'approved' && (
                    <div className="mb-4 p-3 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span style={{ fontFamily: FONTS.body }}>Complete KYC to send friend requests and messages</span>
                    </div>
                  )}
                  <div className="flex gap-3 flex-wrap">
                  {friendStatus?.status === "friends" ? (
                    <>
                      <button
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        style={{ fontFamily: FONTS.body }}
                      >
                        <Users className="w-4 h-4" />
                        Friends
                      </button>
                      <button
                        onClick={handleStartChat}
                        disabled={actionLoading || (userKycStatus && userKycStatus !== 'approved')}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition bg-gradient-to-r from-[#C9A84C] to-[#d4b76a] hover:from-[#d4b76a] hover:to-[#e0c383] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: FONTS.body }}
                        title={userKycStatus && userKycStatus !== 'approved' ? 'Complete KYC to chat' : ''}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </button>
                    </>
                  ) : friendStatus?.status === "pending" &&
                    friendStatus?.type === "outgoing" ? (
                    <button
                      onClick={cancelFriendRequest}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-[#C9A84C]/20 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/30 transition disabled:opacity-50"
                      style={{ fontFamily: FONTS.body }}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      {actionLoading ? "Canceling..." : "Cancel Request"}
                    </button>
                  ) : friendStatus?.status === "pending" &&
                    friendStatus?.type === "incoming" ? (
                    <>
                      <button
                        onClick={() => respondToFriendRequest("accept")}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
                        style={{ fontFamily: FONTS.body }}
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => respondToFriendRequest("reject")}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                        style={{ fontFamily: FONTS.body }}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={sendFriendRequest}
                      disabled={actionLoading || (userKycStatus && userKycStatus !== 'approved')}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-[#0a0c16] transition bg-gradient-to-r from-[#C9A84C] to-[#d4b76a] hover:from-[#d4b76a] hover:to-[#e0c383] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: FONTS.body }}
                      title={userKycStatus && userKycStatus !== 'approved' ? 'Complete KYC to send friend request' : ''}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      {actionLoading ? "Sending..." : "Add Friend"}
                    </button>
                  )}
                </div>
                </>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex gap-8">
            {/* Main Content - Left */}
            <div className="flex-1">
              {/* Travel Preferences Section */}
              {(userData.travel_style ||
                userData.pace ||
                userData.preferred_destinations ||
                userData.accomodation_preference) && (
                <div className="mb-12">
                  <h2
                    className="text-2xl font-bold text-white mb-6"
                    style={{ fontFamily: FONTS.display }}
                  >
                    Travel Preferences
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {userData.travel_style && (
                      <div className="bg-white/5 border border-[#C9A84C]/20 rounded-2xl p-6 hover:bg-white/8 transition">
                        <div className="flex items-center gap-3 mb-3">
                          <StyleIcon style={userData.travel_style.toLowerCase()} />
                          <h3
                            className="text-sm font-semibold text-[#C9A84C]"
                            style={{ fontFamily: FONTS.body }}
                          >
                            Travel Style
                          </h3>
                        </div>
                        <p
                          className="text-lg text-white capitalize"
                          style={{ fontFamily: FONTS.body }}
                        >
                          {userData.travel_style}
                        </p>
                      </div>
                    )}
                    {userData.pace && (
                      <div className="bg-white/5 border border-[#C9A84C]/20 rounded-2xl p-6 hover:bg-white/8 transition">
                        <div className="flex items-center gap-3 mb-3">
                          <PaceIcon pace={userData.pace.toLowerCase()} />
                          <h3
                            className="text-sm font-semibold text-[#C9A84C]"
                            style={{ fontFamily: FONTS.body }}
                          >
                            Pace
                          </h3>
                        </div>
                        <p
                          className="text-lg text-white capitalize"
                          style={{ fontFamily: FONTS.body }}
                        >
                          {userData.pace.replace("_", " ")}
                        </p>
                      </div>
                    )}
                    {userData.preferred_destinations && (
                      <div className="bg-white/5 border border-[#C9A84C]/20 rounded-2xl p-6 hover:bg-white/8 transition">
                        <div className="flex items-center gap-3 mb-3">
                          <Globe className="w-5 h-5 text-[#C9A84C]" />
                          <h3
                            className="text-sm font-semibold text-[#C9A84C]"
                            style={{ fontFamily: FONTS.body }}
                          >
                            Destinations
                          </h3>
                        </div>
                        <p
                          className="text-lg text-white"
                          style={{ fontFamily: FONTS.body }}
                        >
                          {userData.preferred_destinations}
                        </p>
                      </div>
                    )}
                    {userData.accomodation_preference && (
                      <div className="bg-white/5 border border-[#C9A84C]/20 rounded-2xl p-6 hover:bg-white/8 transition">
                        <div className="flex items-center gap-3 mb-3">
                          <AccommIcon
                            accommodation={userData.accomodation_preference.toLowerCase()}
                          />
                          <h3
                            className="text-sm font-semibold text-[#C9A84C]"
                            style={{ fontFamily: FONTS.body }}
                          >
                            Accommodation
                          </h3>
                        </div>
                        <p
                          className="text-lg text-white capitalize"
                          style={{ fontFamily: FONTS.body }}
                        >
                          {userData.accomodation_preference}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vibe Levels Section */}
              {(userData.budget_level ||
                userData.adventure_level ||
                userData.social_level) && (
                <div>
                  <h2
                    className="text-2xl font-bold text-white mb-6"
                    style={{ fontFamily: FONTS.display }}
                  >
                    Travel Vibes
                  </h2>
                  <div className="space-y-6">
                    {userData.budget_level && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-[#C9A84C]" />
                            <span
                              className="font-semibold text-white"
                              style={{ fontFamily: FONTS.body }}
                            >
                              Budget
                            </span>
                          </div>
                          <span
                            className="text-[#C9A84C] font-semibold"
                            style={{ fontFamily: FONTS.mono }}
                          >
                            {userData.budget_level}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#d4b76a]"
                            style={{
                              width: `${(userData.budget_level / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {userData.adventure_level && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#C9A84C]" />
                            <span
                              className="font-semibold text-white"
                              style={{ fontFamily: FONTS.body }}
                            >
                              Adventure
                            </span>
                          </div>
                          <span
                            className="text-[#C9A84C] font-semibold"
                            style={{ fontFamily: FONTS.mono }}
                          >
                            {userData.adventure_level}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#d4b76a]"
                            style={{
                              width: `${(userData.adventure_level / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {userData.social_level && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#C9A84C]" />
                            <span
                              className="font-semibold text-white"
                              style={{ fontFamily: FONTS.body }}
                            >
                              Social
                            </span>
                          </div>
                          <span
                            className="text-[#C9A84C] font-semibold"
                            style={{ fontFamily: FONTS.mono }}
                          >
                            {userData.social_level}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#d4b76a]"
                            style={{
                              width: `${(userData.social_level / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Friends Sidebar - Right */}
            {!isOwnProfile && (
              <div className="w-80">
                <div className="sticky top-24 bg-white/5 border border-[#C9A84C]/20 rounded-2xl p-6">
                  <h3
                    className="text-lg font-semibold text-white mb-4 flex items-center gap-2"
                    style={{ fontFamily: FONTS.display }}
                  >
                    <Users className="w-5 h-5 text-[#C9A84C]" />
                    Friends
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {friendUserFriends && friendUserFriends.length > 0 ? (
                      friendUserFriends.map((friend) => (
                        <Link
                          key={friend.id}
                          to={`/user/${friend.username}`}
                          className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#C9A84C]/40 hover:bg-white/8 transition group"
                        >
                          <p
                            className="text-sm font-semibold text-white group-hover:text-[#C9A84C] transition"
                            style={{ fontFamily: FONTS.body }}
                          >
                            {friend.first_name && friend.last_name
                              ? `${friend.first_name} ${friend.last_name}`
                              : friend.username}
                          </p>
                          <p
                            className="text-xs text-white/50 group-hover:text-white/70 transition"
                            style={{ fontFamily: FONTS.body }}
                          >
                            @{friend.username}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <p
                        className="text-center text-white/50 py-6"
                        style={{ fontFamily: FONTS.body }}
                      >
                        No friends yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
