import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

// ─── helpers ────────────────────────────────────────────────────────────────
const API = "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access_token");
const avatar = (url) =>
  url ? (url.startsWith("http") ? url : `${API}${url}`) : null;

const TRAVEL_STYLES = ["Budget", "Luxury", "Adventure"];
const PACE_OPTIONS  = ["Relaxed", "Moderate", "Fast-paced"];
const ACCOMM        = ["Hostel", "Hotel", "Inn", "Camping"];

// ─── stat card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 border border-white/8 px-5 py-4 min-w-[90px]">
      <span className="text-xl">{icon}</span>
      <span className="text-[22px] font-bold text-white leading-none">{value ?? "—"}</span>
      <span className="text-[10px] uppercase tracking-widest text-white/40 text-center">{label}</span>
    </div>
  );
}

// ─── slider field ───────────────────────────────────────────────────────────
function SliderField({ label, name, value, onChange, min = 0, max = 10, leftLabel, rightLabel }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</label>
      <input
        type="range" min={min} max={max} name={name} value={value}
        onChange={onChange}
        className="accent-[#1976D2] w-full h-1.5 rounded-full"
      />
      <div className="flex justify-between text-[10px] text-white/30">
        <span>{leftLabel}</span>
        <span className="text-white/60 font-semibold">{value} / {max}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── chip selector ──────────────────────────────────────────────────────────
function ChipSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o} type="button"
            onClick={() => onChange(o.toLowerCase())}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold border transition-all ${
              value === o.toLowerCase()
                ? "bg-[#1976D2] border-[#1976D2] text-white"
                : "bg-white/5 border-white/10 text-white/50 hover:border-[#1976D2]/50 hover:text-white/80"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── edit modal ─────────────────────────────────────────────────────────────
function EditModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name:               profile.first_name || "",
    last_name:                profile.last_name  || "",
    bio:                      profile.bio        || "",
    location:                 profile.location   || "",
    travel_style:             profile.travel_style             || "",
    pace:                     profile.pace                     || "",
    accommodation_preference: profile.accommodation_preference || "",
    budget_level:             profile.budget_level             ?? 5,
    adventure_level:          profile.adventure_level          ?? 5,
    social_level:             profile.social_level             ?? 5,
  });
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(avatar(profile.profile_picture));
  const [saving, setSaving]             = useState(false);
  const [err, setErr]                   = useState("");
  const fileRef = useRef();

  const set     = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setChip = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setSlider = (e) => setForm((f) => ({ ...f, [e.target.name]: Number(e.target.value) }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const r = new FileReader();
    r.onload = (ev) => setPhotoPreview(ev.target.result);
    r.readAsDataURL(file);
  };

  // ✅ handleSave is INSIDE EditModal
  const handleSave = async () => {
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("profile_photo", photoFile);

      const res = await fetch(`${API}/users/api/profile/update/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || "Failed to save."); return; }
      onSaved(data);
      // ✅ Notify navbar to refresh profile picture
      window.dispatchEvent(new Event("profile-updated"));
      onClose();
    } catch {
      setErr("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const inp = "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 transition";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0d1117] border border-white/10 shadow-2xl">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0d1117]/90 backdrop-blur px-6 py-4 border-b border-white/8">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="rounded-full bg-white/8 px-3 py-1 text-sm text-white/60 hover:bg-white/15 hover:text-white transition">
            ✕ Close
          </button>
        </div>

        <div className="flex flex-col gap-6 px-6 py-6">
          {/* avatar upload */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileRef.current.click()}
              className="relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-[#1976D2]/50 bg-white/5 hover:border-[#1976D2] transition group"
            >
              {photoPreview
                ? <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                : <span className="flex h-full items-center justify-center text-2xl">📷</span>
              }
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs font-bold text-white">Change</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <div>
              <p className="text-sm font-semibold text-white">Profile Photo</p>
              <p className="text-xs text-white/40">Click to upload · JPG or PNG</p>
            </div>
          </div>

          {/* name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">First Name</label>
              <input className={inp} value={form.first_name} onChange={set("first_name")} placeholder="Jane" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Last Name</label>
              <input className={inp} value={form.last_name} onChange={set("last_name")} placeholder="Doe" />
            </div>
          </div>

          {/* bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Bio</label>
            <textarea className={`${inp} resize-none`} rows={3} value={form.bio} onChange={set("bio")} placeholder="Tell travellers about yourself…" />
          </div>

          {/* location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Location</label>
            <input className={inp} value={form.location} onChange={set("location")} placeholder="Kathmandu, Nepal" />
          </div>

          {/* travel prefs */}
          <ChipSelect label="Travel Style" options={TRAVEL_STYLES} value={form.travel_style} onChange={setChip("travel_style")} />
          <ChipSelect label="Pace" options={PACE_OPTIONS} value={form.pace} onChange={setChip("pace")} />
          <ChipSelect label="Accommodation" options={ACCOMM} value={form.accommodation_preference} onChange={setChip("accommodation_preference")} />

          {/* sliders */}
          <SliderField label="Budget Level" name="budget_level" value={form.budget_level} onChange={setSlider} leftLabel="Budget" rightLabel="Luxury" />
          <SliderField label="Adventure Level" name="adventure_level" value={form.adventure_level} onChange={setSlider} leftLabel="Chill" rightLabel="Extreme" />
          <SliderField label="Social Level" name="social_level" value={form.social_level} onChange={setSlider} leftLabel="Solo" rightLabel="Group" />

          {err && (
            <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">{err}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-[#1976D2] py-3 text-sm font-bold text-white transition hover:bg-[#1565c0] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main profile page ───────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch(`${API}/users/api/me/`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then((r) => r.json())
      .then((d) => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0c16]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#1976D2]" />
    </div>
  );

  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0c16] text-white/50">
      Could not load profile.
    </div>
  );

  const pic      = avatar(profile.profile_picture);
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || "Traveller";
  const initial  = fullName[0]?.toUpperCase() || "T";

  const styleEmoji = { budget: "🎒", luxury: "💎", adventure: "🧗" };
  const paceEmoji  = { relaxed: "🌅", moderate: "🚶", fast_paced: "🏃" };
  const accommEmoji = { hostel: "🏨", hotel: "🏩", inn: "🏡", camping: "⛺" };

  return (
    <div className="min-h-screen bg-[#0a0c16] font-[Poppins,sans-serif] text-white">

      {/* ── Banner ── */}
      <div className="relative h-48 w-full overflow-hidden md:h-60">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2137] via-[#0a0c16] to-[#0d1b2a]" />
        <svg className="absolute inset-0 h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1976D2" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute -left-10 -top-10 h-60 w-60 rounded-full bg-[#1976D2]/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-40 w-80 rounded-full bg-[#1976D2]/10 blur-2xl" />
        <button
          onClick={() => setEditing(true)}
          className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[13px] font-semibold text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
        >
          ✏️ Edit Profile
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-5">

        {/* ── Avatar ── */}
        <div className="-mt-14 flex items-end justify-between">
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#0a0c16] bg-[#1976D2] shadow-xl shadow-[#1976D2]/20">
              {pic
                ? <img src={pic} alt={fullName} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                : <span className="flex h-full items-center justify-center text-4xl font-bold text-white">{initial}</span>
              }
            </div>
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#0a0c16] bg-emerald-400" />
          </div>
        </div>

        {/* ── Name / meta ── */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{fullName}</h1>
          <p className="mt-0.5 text-sm text-white/40">@{profile.username || profile.email?.split("@")[0]}</p>
          {profile.location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/50">
              <span>📍</span>{profile.location}
            </p>
          )}
          {profile.bio && (
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/65">{profile.bio}</p>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="mt-6 flex flex-wrap gap-3">
          <StatCard icon="✈️" label="Trips"     value={profile.trips_count    ?? 0} />
          <StatCard icon="🤝" label="Buddies"   value={profile.buddies_count  ?? 0} />
          <StatCard icon="🌍" label="Countries" value={profile.countries_count ?? 0} />
          <StatCard icon="⭐" label="Rating"    value={profile.rating ? profile.rating.toFixed(1) : "—"} />
        </div>

        {/* ── Travel Preferences ── */}
        <div className="mt-8">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-white/30">Travel Preferences</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Style</p>
              <p className="text-2xl mb-1">{styleEmoji[profile.travel_style] || "🎒"}</p>
              <p className="text-sm font-semibold text-white capitalize">{profile.travel_style || "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Pace</p>
              <p className="text-2xl mb-1">{paceEmoji[profile.pace] || "🚶"}</p>
              <p className="text-sm font-semibold text-white capitalize">{profile.pace?.replace("_", "-") || "Not set"}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Stays</p>
              <p className="text-2xl mb-1">{accommEmoji[profile.accommodation_preference] || "🏨"}</p>
              <p className="text-sm font-semibold text-white capitalize">{profile.accommodation_preference || "Not set"}</p>
            </div>
          </div>
        </div>

        {/* ── Vibe bars ── */}
        <div className="mt-8 rounded-2xl border border-white/8 bg-white/4 p-5">
          <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[3px] text-white/30">Traveller Vibe</h2>
          <div className="flex flex-col gap-5">
            {[
              { label: "Budget",    left: "Budget 💸", right: "Luxury 💎",  value: profile.budget_level    ?? 5 },
              { label: "Adventure", left: "Chill 🌅",  right: "Extreme 🧗", value: profile.adventure_level ?? 5 },
              { label: "Social",    left: "Solo 🎧",   right: "Group 🎉",   value: profile.social_level    ?? 5 },
            ].map(({ label, left, right, value }) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</span>
                  <span className="text-xs font-semibold text-[#1976D2]">{value}/10</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#1976D2] to-[#42a5f5] transition-all"
                    style={{ width: `${value * 10}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-white/25">
                  <span>{left}</span><span>{right}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Account Info ── */}
        <div className="mt-8 mb-12 rounded-2xl border border-white/8 bg-white/4 p-5">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-white/30">Account Info</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: "✉️", label: "Email", value: profile.email },
              { icon: "📅", label: "Member since", value: profile.date_joined ? new Date(profile.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{label}</p>
                  <p className="text-sm text-white/70">{value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editing && (
        <EditModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={(updated) => setProfile((p) => ({ ...p, ...updated }))}
        />
      )}
    </div>
  );
}