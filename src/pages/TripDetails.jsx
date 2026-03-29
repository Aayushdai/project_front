import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { ArrowLeft, MapPin, Calendar, Users, User2 } from "lucide-react";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await API.get(`trips/trips/${id}/`);
        console.log("Trip data:", res.data);
        setTrip(res.data);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to load trip details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrip();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading trip details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!trip) return <div className="p-6 text-center">Trip not found</div>;

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      {/* Trip Details Card */}
      <div className="max-w-4xl bg-[#1a1f2e] rounded-2xl p-8 mb-8 border border-[rgba(255,255,255,0.08)]">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-4">{trip.title}</h1>
          <div className="flex flex-wrap gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-orange-500" />
              <span>{trip.destination?.name || "Destination TBD"}, {trip.destination?.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-orange-500" />
              <span>{new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              <span>{trip.participants?.length || 0} participants</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-lg leading-relaxed">{trip.description || "No description provided"}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {trip.is_public && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Public Trip</span>}
          {!trip.is_public && <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">Private Trip</span>}
        </div>
      </div>

      {/* Itinerary Section */}
      {trip.itinerary && trip.itinerary.length > 0 && (
        <div className="max-w-4xl bg-[#1a1f2e] rounded-2xl p-8 mb-8 border border-[rgba(255,255,255,0.08)]">
          <h2 className="text-2xl font-bold mb-6">Itinerary</h2>
          <div className="space-y-4">
            {trip.itinerary.map(item => (
              <div key={item.id} className="bg-[#0f1419] p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
                <div className="font-bold text-orange-500 mb-2">Day {item.day}</div>
                <div className="text-gray-300">{item.activity}</div>
                {item.notes && <div className="text-gray-500 text-sm mt-2">{item.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants Section */}
      <div className="max-w-4xl bg-[#1a1f2e] rounded-2xl p-8 border border-[rgba(255,255,255,0.08)]">
        <h2 className="text-2xl font-bold mb-6">Participants ({trip.participants?.length || 0})</h2>
        
        {trip.participants && trip.participants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trip.participants.map(participant => (
              <div key={participant.id} className="bg-[#0f1419] p-4 rounded-lg border border-[rgba(255,255,255,0.05)] hover:border-orange-500/50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User2 size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">
                      {participant.first_name} {participant.last_name}
                    </div>
                    <div className="text-gray-500 text-sm truncate">@{participant.username}</div>
                    {participant.bio && (
                      <div className="text-gray-400 text-sm mt-2 line-clamp-2">{participant.bio}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No participants yet
          </div>
        )}
      </div>
    </div>
  );
}