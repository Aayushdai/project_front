import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import api from "../API/api";

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedTrips, setRelatedTrips] = useState([]);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        // Fetch destination details
        const destRes = await api.get(`/trips/destinations/${id}/`);
        setDestination(destRes.data);

        // Fetch trips to this destination
        const tripsRes = await api.get(`/trips/trips/`);
        // Filter trips by city name matching destination's city
        const filtered = tripsRes.data.results?.filter(trip => 
          trip.destination?.id === destRes.data.city?.id
        ) || [];
        setRelatedTrips(filtered);
      } catch (err) {
        console.error("Error fetching destination:", err);
        setError("Could not load destination details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDestination();
  }, [id]);

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a09",
          color: "#f5f0e8",
        }}
      >
        <div>Loading destination details...</div>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a09",
          color: "#f5f0e8",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p>{error}</p>
          <button
            onClick={() => navigate("/explore")}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "linear-gradient(135deg,#c9973a,#f0c27a)",
              color: "#0f0e0d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Explore
          </button>
        </div>
      </div>
    );

  if (!destination)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a09",
          color: "#f5f0e8",
        }}
      >
        <div>Destination not found</div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0c0a09",
        color: "#f5f0e8",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <button
          onClick={() => navigate("/explore")}
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            background: "rgba(201,151,58,.15)",
            color: "#f0c27a",
            border: "1px solid rgba(201,151,58,.3)",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Explore
        </button>

        {/* Destination Info */}
        <div
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(240,194,122,.15)",
            borderRadius: "12px",
            padding: "30px",
            marginBottom: "40px",
          }}
        >
          {destination.image && (
            <img
              src={destination.image}
              alt={destination.name}
              style={{
                width: "100%",
                height: "400px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            />
          )}

          <h1
            style={{
              fontSize: "36px",
              fontWeight: 700,
              marginBottom: "10px",
              background: "linear-gradient(135deg,#c9973a,#f0c27a)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {destination.name}
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "rgba(245,240,232,.7)",
              marginBottom: "20px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={16} style={{ color: "#C9A84C" }} />
              {destination.location}
            </span>
            {destination.city && `, ${destination.city.name}`}
          </p>

          <div
            style={{
              lineHeight: "1.8",
              color: "rgba(245,240,232,.85)",
              marginBottom: "30px",
            }}
          >
            {destination.description}
          </div>

          <button
            onClick={() => navigate("/create-trip")}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg,#c9973a,#f0c27a)",
              color: "#0f0e0d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 600,
              transition: "transform .2s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Plan a Trip Here
          </button>
        </div>

        {/* Related Trips */}
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "20px",
              color: "#f5f0e8",
            }}
          >
            Trips to {destination.name}
          </h2>

          {relatedTrips.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {relatedTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(240,194,122,.15)",
                    borderRadius: "8px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all .3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(240,194,122,.4)";
                    e.currentTarget.style.background = "rgba(255,255,255,.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(240,194,122,.15)";
                    e.currentTarget.style.background = "rgba(255,255,255,.04)";
                  }}
                >
                  <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#f0c27a" }}>
                    {trip.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(245,240,232,.65)",
                      marginBottom: "10px",
                    }}
                  >
                    {trip.description?.substring(0, 100)}...
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(245,240,232,.5)",
                    }}
                  >
                    📅 {trip.start_date} to {trip.end_date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(240,194,122,.1)",
                borderRadius: "8px",
                padding: "30px",
                textAlign: "center",
                color: "rgba(245,240,232,.6)",
              }}
            >
              <p>No trips planned to {destination.name} yet.</p>
              <button
                onClick={() => navigate("/create-trip")}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  background: "linear-gradient(135deg,#c9973a,#f0c27a)",
                  color: "#0f0e0d",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Be the first to create one!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
