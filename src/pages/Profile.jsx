import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Edit3,
  MapPin,
  Plane,
  Users,
  Star,
  Wallet,
  Gem,
  Sunrise,
  Mountain,
  Headphones,
  Zap,
  Mail,
  Calendar,
  Home,
  Building2,
  Tent,
  Check,
  X,
  ChevronRight,
  Clock,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────
const API = "http://127.0.0.1:8000";
const token = () => localStorage.getItem("access_token");
const avatar = (url) =>
  url ? (url.startsWith("http") ? url : `${API}${url}`) : null;

const TRAVEL_STYLES = ["Budget", "Luxury", "Adventure"];
const PACE_OPTIONS  = ["Relaxed", "Moderate", "Fast-paced"];
const ACCOMM        = ["Hostel", "Hotel", "Inn", "Camping"];

const FONTS = {
  display: "Playfair Display, Georgia, serif",
  body: "DM Sans, system-ui, sans-serif",
  mono: "DM Mono, monospace",
};

// ─── chip selector ──────────────────────────────────────────────────────────
function ChipSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o.toLowerCase())}
            style={{ fontFamily: FONTS.body }}
            className={`rounded-full px-4 py-1.5 text-[12px] font-semibold border transition-all duration-200 ${
              value === o.toLowerCase()
                ? "bg-[#C9A84C] border-[#C9A84C] text-black"
                : "bg-transparent border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── slider field ───────────────────────────────────────────────────────────
function SliderField({ label, name, value, onChange, min = 0, max = 10, leftLabel, rightLabel }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">{label}</label>
        <span style={{ fontFamily: FONTS.mono }} className="text-xs text-[#C9A84C]">{value}/{max}</span>
      </div>
      <input type="range" min={min} max={max} name={name} value={value} onChange={onChange}
        className="accent-[#C9A84C] w-full h-[3px] rounded-full" />
      <div className="flex justify-between text-[10px] text-white/25" style={{ fontFamily: FONTS.body }}>
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── multi tag selector ──────────────────────────────────────────────────────
function MultiTagSelect({ label, allTags, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const groupedTags = allTags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});
  const selectedTags = allTags.filter(t => selectedIds.includes(t.id));

  return (
    <div className="flex flex-col gap-2">
      <label style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">{label}</label>
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        {selectedTags.map(tag => (
          <button key={tag.id} type="button" onClick={() => onChange(selectedIds.filter(id => id !== tag.id))}
            style={{ fontFamily: FONTS.body }}
            className="rounded-full px-3 py-1 text-[11px] font-semibold bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] flex items-center gap-1.5 hover:bg-[#C9A84C]/25 transition">
            {tag.name} <X className="w-3 h-3" />
          </button>
        ))}
        {selectedTags.length === 0 && <p style={{ fontFamily: FONTS.body }} className="text-xs text-white/25 italic self-center">None selected</p>}
      </div>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          style={{ fontFamily: FONTS.body }}
          className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-left text-sm text-white/50 hover:border-white/20 transition flex items-center justify-between">
          <span>+ Add tags</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto">
            {Object.entries(groupedTags).map(([category, tags]) => (
              <div key={category}>
                <div className="sticky top-0 px-4 py-2 bg-[#111] border-b border-white/8 text-[10px] font-bold uppercase tracking-widest text-white/30" style={{ fontFamily: FONTS.body }}>
                  {category.replace('_', ' ')}
                </div>
                {tags.map(tag => (
                  <button key={tag.id} type="button"
                    onClick={() => {
                      if (selectedIds.includes(tag.id)) {
                        onChange(selectedIds.filter(id => id !== tag.id));
                      } else {
                        const otherTags = selectedIds.filter(id => {
                          const ot = allTags.find(t => t.id === id);
                          return ot?.category !== tag.category;
                        });
                        onChange([...otherTags, tag.id]);
                      }
                    }}
                    style={{ fontFamily: FONTS.body }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition border-b border-white/5 last:border-0 flex items-center gap-3 ${
                      selectedIds.includes(tag.id) ? "text-[#C9A84C] bg-[#C9A84C]/8" : "text-white/60 hover:bg-white/4 hover:text-white"
                    }`}>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedIds.includes(tag.id) ? "border-[#C9A84C] bg-[#C9A84C]" : "border-white/20"}`}>
                      {selectedIds.includes(tag.id) && <Check className="w-2.5 h-2.5 text-black" />}
                    </span>
                    {tag.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── edit modal ─────────────────────────────────────────────────────────────
function EditModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    bio: profile.bio || "",
    location: profile.location || "",
    travel_style: profile.travel_style || "",
    pace: profile.pace || "",
    accommodation_preference: profile.accommodation_preference || "",
    budget_level: profile.budget_level ?? 5,
    adventure_level: profile.adventure_level ?? 5,
    social_level: profile.social_level ?? 5,
  });
  const [allConstraintTags, setAllConstraintTags] = useState([]);
  const [selectedConstraintTagIds, setSelectedConstraintTagIds] = useState(profile.constraint_tags?.map(t => t.id) || []);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(avatar(profile.profile_picture));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setChip = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const setSlider = (e) => setForm(f => ({ ...f, [e.target.name]: Number(e.target.value) }));

  useEffect(() => {
    fetch(`${API}/users/api/constraint-tags/`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => { setAllConstraintTags(d); setTagsLoading(false); })
      .catch(() => setTagsLoading(false));
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const r = new FileReader();
    r.onload = (ev) => setPhotoPreview(ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true); setErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("profile_photo", photoFile);
      selectedConstraintTagIds.forEach(id => fd.append("constraint_tag_ids", id));
      const res = await fetch(`${API}/users/api/profile/update/`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token()}` }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.message || "Failed to save."); return; }
      onSaved(data);
      window.dispatchEvent(new Event("profile-updated"));
      onClose();
    } catch { setErr("Could not connect to server."); }
    finally { setSaving(false); }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const inp = "w-full rounded-xl bg-[#1a1a1a] border border-white/20 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#C9A84C]/70 focus:ring-1 focus:ring-[#C9A84C]/30 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full sm:max-w-lg max-h-[95vh] sm:max-h-[88vh] overflow-y-auto sm:rounded-2xl rounded-t-3xl bg-[#0e0e0e] border border-white/8 shadow-2xl">
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0e0e0e]/95 backdrop-blur px-6 py-4 border-b border-white/8">
          <button onClick={onClose} style={{ fontFamily: FONTS.body }} className="text-sm text-white/50 hover:text-white transition">Cancel</button>
          <h2 style={{ fontFamily: FONTS.body }} className="text-sm font-bold text-white">Edit Profile</h2>
          <button onClick={handleSave} disabled={saving} style={{ fontFamily: FONTS.body }}
            className="text-sm font-bold text-[#C9A84C] hover:text-[#e8c96d] disabled:opacity-40 transition">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="flex flex-col gap-7 px-6 py-6">
          {/* avatar */}
          <div className="flex flex-col items-center gap-2">
            <div onClick={() => fileRef.current.click()} className="relative h-24 w-24 cursor-pointer group">
              <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8b6914] opacity-60" />
              <div className="relative h-full w-full overflow-hidden rounded-full bg-[#1a1a1a] border-[2px] border-[#0e0e0e]">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  : <span className="flex h-full items-center justify-center text-3xl font-bold text-[#C9A84C]"
                      style={{ fontFamily: FONTS.display }}>
                      {(form.first_name || "T")[0].toUpperCase()}
                    </span>
                }
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <button onClick={() => fileRef.current.click()} style={{ fontFamily: FONTS.body }}
              className="text-sm font-semibold text-[#C9A84C] hover:text-[#e8c96d] transition">
              Change photo
            </button>
          </div>

          {/* name */}
          <div className="grid grid-cols-2 gap-3">
            {[["First Name", "first_name", "Jane"], ["Last Name", "last_name", "Doe"]].map(([lbl, key, ph]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35">{lbl}</label>
                <input className={inp} style={{ fontFamily: FONTS.body }} value={form[key]} onChange={set(key)} placeholder={ph} />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35">Bio</label>
            <textarea className={`${inp} resize-none`} style={{ fontFamily: FONTS.body }} rows={3} value={form.bio} onChange={set("bio")} placeholder="Tell travellers about yourself…" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35">Location</label>
            <input className={inp} style={{ fontFamily: FONTS.body }} value={form.location} onChange={set("location")} placeholder="Kathmandu, Nepal" />
          </div>

          <div className="h-px bg-white/6" />
          <ChipSelect label="Travel Style"  options={TRAVEL_STYLES} value={form.travel_style}             onChange={setChip("travel_style")} />
          <ChipSelect label="Pace"          options={PACE_OPTIONS}  value={form.pace}                     onChange={setChip("pace")} />
          <ChipSelect label="Accommodation" options={ACCOMM}        value={form.accommodation_preference} onChange={setChip("accommodation_preference")} />

          <div className="h-px bg-white/6" />
          <SliderField label="Budget"    name="budget_level"    value={form.budget_level}    onChange={setSlider} leftLabel="Budget"  rightLabel="Luxury"  />
          <SliderField label="Adventure" name="adventure_level" value={form.adventure_level} onChange={setSlider} leftLabel="Chill"   rightLabel="Extreme" />
          <SliderField label="Social"    name="social_level"    value={form.social_level}    onChange={setSlider} leftLabel="Solo"    rightLabel="Group"   />

          <div className="h-px bg-white/6" />
          {tagsLoading
            ? <p style={{ fontFamily: FONTS.body }} className="text-sm text-white/30">Loading tags…</p>
            : allConstraintTags.length > 0
              ? <MultiTagSelect label="Preferences & Tags" allTags={allConstraintTags} selectedIds={selectedConstraintTagIds} onChange={setSelectedConstraintTagIds} />
              : null
          }

          {err && <p style={{ fontFamily: FONTS.body }} className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{err}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── icon helpers ────────────────────────────────────────────────────────────
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

// ─── vibe bar ────────────────────────────────────────────────────────────────
function VibeBar({ label, value, left, right }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span style={{ fontFamily: FONTS.body }} className="text-xs font-medium text-white/45">{label}</span>
        <span style={{ fontFamily: FONTS.mono }} className="text-xs text-[#C9A84C]">{value}/10</span>
      </div>
      <div className="h-[3px] w-full rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#8b6914] via-[#C9A84C] to-[#e8c96d] transition-all" style={{ width: `${value * 10}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-white/20" style={{ fontFamily: FONTS.body }}>
        <span>{left}</span><span>{right}</span>
      </div>
    </div>
  );
}

// ─── pref row ────────────────────────────────────────────────────────────────
function PrefRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
      <span style={{ fontFamily: FONTS.body }} className="text-sm text-white/40">{label}</span>
      <span style={{ fontFamily: FONTS.body }} className="text-sm font-semibold text-white capitalize">
        {value || <span className="text-white/20 font-normal">Not set</span>}
      </span>
    </div>
  );
}

// ─── main profile page ───────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestAction, setRequestAction] = useState({});
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch(`${API}/users/api/me/`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));

    const fetchPending = () => {
      fetch(`${API}/users/api/friend-requests/pending/`, { headers: { Authorization: `Bearer ${token()}` } })
        .then(r => r.json()).then(d => setPendingRequests(d.pending_requests || []))
        .catch(() => setPendingRequests([]));
    };
    fetchPending();
    const i1 = setInterval(fetchPending, 3000);
    return () => clearInterval(i1);
  }, []);

  useEffect(() => {
    const fetchFriends = () => {
      fetch(`${API}/users/api/friends/`, { headers: { Authorization: `Bearer ${token()}` } })
        .then(r => r.json()).then(d => setFriends(d.friends || []))
        .catch(() => setFriends([]));
    };
    fetchFriends();
    const i2 = setInterval(fetchFriends, 5000);
    return () => clearInterval(i2);
  }, []);

  const handleFriendRequestResponse = async (requestId, action) => {
    setRequestAction(p => ({ ...p, [requestId]: true }));
    try {
      const res = await fetch(`${API}/users/api/friend-request/${requestId}/respond/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) setPendingRequests(p => p.filter(r => r.id !== requestId));
    } catch {}
    finally { setRequestAction(p => ({ ...p, [requestId]: false })); }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808]">
      <div className="h-8 w-8 animate-spin rounded-full border-[1.5px] border-white/10 border-t-[#C9A84C]" />
    </div>
  );
  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white/30" style={{ fontFamily: FONTS.body }}>
      Could not load profile.
    </div>
  );

  const pic = avatar(profile.profile_picture);
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || "Traveller";
  const initial  = fullName[0]?.toUpperCase() || "T";
  const handle   = profile.username || profile.email?.split("@")[0];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-[#080808] text-white">

        {/* ── Cover banner ── */}
        <div className="relative h-52 w-full bg-[#0c0c0c] overflow-hidden">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 100% at 15% 50%, rgba(201,168,76,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 85% 60%, rgba(201,168,76,0.04) 0%, transparent 60%)" }} />
          {/* subtle cross-hatch */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ch" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ch)" />
          </svg>
          {/* bottom fade into page bg */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080808] to-transparent" />
        </div>

        {/* ── Content (two-column layout) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
            {/* Main content (left: 2 cols) */}
            <div className="lg:col-span-2">
              
              {/* Avatar + actions row */}
          <div className="flex items-end justify-between -mt-[52px] mb-4">
            {/* Avatar with gold ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-[2.5px] rounded-full"
                style={{ background: "linear-gradient(135deg, #C9A84C 0%, #e8c96d 40%, #8b6914 100%)" }} />
              <div className="relative h-[100px] w-[100px] rounded-full overflow-hidden bg-[#111] border-[3px] border-[#080808]">
                {pic
                  ? <img src={pic} alt={fullName} className="h-full w-full object-cover" onError={e => e.target.style.display = "none"} />
                  : <span className="flex h-full items-center justify-center text-4xl font-bold text-[#C9A84C]"
                      style={{ fontFamily: FONTS.display }}>{initial}</span>
                }
              </div>
              <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#080808]" />
            </div>

            {/* Edit button */}
            <button onClick={() => setEditing(true)} style={{ fontFamily: FONTS.body }}
              className="mb-1 rounded-xl border border-white/12 bg-white/5 px-5 py-2 text-[13px] font-semibold text-white hover:bg-white/10 hover:border-white/20 transition flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5" /> Edit profile
            </button>
          </div>

          {/* Name / handle / bio */}
          <div className="mb-5">
            <h1 className="text-[22px] font-bold text-white leading-tight" style={{ fontFamily: FONTS.display }}>{fullName}</h1>
            <p className="text-sm text-[#C9A84C]/60 mt-0.5" style={{ fontFamily: FONTS.mono }}>@{handle}</p>
            {profile.location && (
              <p className="flex items-center gap-1.5 text-sm text-white/35 mt-1.5" style={{ fontFamily: FONTS.body }}>
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C]/50" />{profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm text-white/55 leading-relaxed" style={{ fontFamily: FONTS.body }}>{profile.bio}</p>
            )}
            {/* inline constraint tags */}
            {profile.constraint_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.constraint_tags.map(tag => (
                  <span key={tag.id} style={{ fontFamily: FONTS.body }}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/35">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Stats (Instagram-style 3-col) ── */}
          <div className="flex border-y border-white/8 mb-6">
            {[
              { value: profile.trips_count ?? 0,                              label: "Trips"   },
              { value: profile.buddies_count ?? 0,                            label: "Buddies" },
              { value: profile.rating ? profile.rating.toFixed(1) : "—",     label: "Rating"  },
            ].map(({ value, label }, i) => (
              <div key={label} className={`flex-1 flex flex-col items-center py-4 gap-0.5 ${i < 2 ? "border-r border-white/8" : ""}`}>
                <span className="text-[22px] font-bold text-white" style={{ fontFamily: FONTS.display }}>{value}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/30" style={{ fontFamily: FONTS.body }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Pending requests ── */}
          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-3">
                Requests - {pendingRequests.length}
              </p>
              <div className="flex flex-col gap-2">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 rounded-2xl bg-white/3 border border-white/8 px-4 py-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/8 flex items-center justify-center">
                      {req.profile_picture
                        ? <img src={req.profile_picture} alt={req.username} className="h-full w-full object-cover" onError={e => e.target.style.display = "none"} />
                        : <span className="text-sm font-bold text-[#C9A84C]" style={{ fontFamily: FONTS.display }}>{req.username[0].toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: FONTS.body }} className="text-sm font-semibold text-white truncate">
                        {req.first_name && req.last_name ? `${req.first_name} ${req.last_name}` : req.username}
                      </p>
                      <p style={{ fontFamily: FONTS.mono }} className="text-xs text-white/35 truncate">@{req.username}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleFriendRequestResponse(req.id, "accept")} disabled={requestAction[req.id]}
                        style={{ fontFamily: FONTS.body }}
                        className="rounded-xl bg-[#C9A84C] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#e8c96d] disabled:opacity-40 transition">
                        Confirm
                      </button>
                      <button onClick={() => handleFriendRequestResponse(req.id, "reject")} disabled={requestAction[req.id]}
                        style={{ fontFamily: FONTS.body }}
                        className="rounded-xl bg-white/8 px-4 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/12 disabled:opacity-40 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/8 mb-6 -mx-1">
            {["overview", "preferences"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ fontFamily: FONTS.body }}
                className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                  activeTab === tab
                    ? "text-[#C9A84C] border-b-2 border-[#C9A84C] -mb-px"
                    : "text-white/28 hover:text-white/50"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Overview tab ── */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4 pb-20">
              {/* Pref cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Style", icon: <StyleIcon style={profile.travel_style} />,  value: profile.travel_style },
                  { label: "Pace",  icon: <PaceIcon  pace={profile.pace} />,            value: profile.pace?.replace("_", "-") },
                  { label: "Stays", icon: <AccommIcon accomm={profile.accommodation_preference} />, value: profile.accommodation_preference },
                ].map(({ label, icon, value }) => (
                  <div key={label} className="rounded-2xl bg-white/3 border border-white/8 p-4 flex flex-col gap-3 hover:border-[#C9A84C]/20 transition">
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: FONTS.body }} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/28">{label}</span>
                      {icon}
                    </div>
                    <p style={{ fontFamily: FONTS.body }} className="text-sm font-semibold text-white capitalize leading-tight">
                      {value || <span className="text-white/20 font-normal">—</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Vibe */}
              <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
                <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">Traveller Vibe</p>
                <div className="flex flex-col gap-5">
                  <VibeBar label="Budget to Luxury"   value={profile.budget_level    ?? 5} left="Budget"  right="Luxury"  />
                  <VibeBar label="Chill to Extreme"   value={profile.adventure_level ?? 5} left="Chill"   right="Extreme" />
                  <VibeBar label="Solo to Group"      value={profile.social_level    ?? 5} left="Solo"    right="Group"   />
                </div>
              </div>

              {/* Account */}
              <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
                <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 px-5 pt-4 pb-2">Account</p>
                <div className="px-5 pb-2">
                  {[
                    { icon: <Mail className="w-4 h-4 text-[#C9A84C]/50" />, label: "Email", value: profile.email },
                    { icon: <Calendar className="w-4 h-4 text-[#C9A84C]/50" />, label: "Joined", value: profile.date_joined ? new Date(profile.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0">
                      {icon}
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: FONTS.body }} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-0.5">{label}</p>
                        <p style={{ fontFamily: FONTS.body }} className="text-sm text-white/60 truncate">{value || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register for Full Access - KYC */}
              <div className={`rounded-2xl border-2 p-5 overflow-hidden transition-all ${
                profile.status === 'approved'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : profile.status === 'rejected'
                  ? 'bg-red-500/10 border-red-500/30'
                  : profile.status === 'pending'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-[#C9A84C]/8 border-[#C9A84C]/30 hover:border-[#C9A84C]/50'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {profile.status === 'approved' ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-400" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-emerald-300">✓ Verified User</p>
                        </>
                      ) : profile.status === 'rejected' ? (
                        <>
                          <X className="w-5 h-5 text-red-400" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-red-300">Verification Rejected</p>
                        </>
                      ) : profile.status === 'pending' ? (
                        <>
                          <Clock className="w-5 h-5 text-amber-400" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-amber-300">Verification Pending</p>
                        </>
                      ) : (
                        <>
                          <Gem className="w-5 h-5 text-[#C9A84C]" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-[#C9A84C]">Register for Full Access</p>
                        </>
                      )}
                    </div>
                    <p style={{ fontFamily: FONTS.body }} className={`text-[12px] ${
                      profile.status === 'approved'
                        ? 'text-emerald-200/70'
                        : profile.status === 'rejected'
                        ? 'text-red-200/70'
                        : profile.status === 'pending'
                        ? 'text-amber-200/70'
                        : 'text-white/50'
                    }`}>
                      {profile.status === 'approved'
                        ? 'Your identity is verified. You have full access to all features and can interact with trips, chat, and more.'
                        : profile.status === 'rejected'
                        ? profile.rejection_reason ? `Rejected: ${profile.rejection_reason}. Please submit again.` : 'Your KYC verification was rejected. Please submit again.'
                        : profile.status === 'pending'
                        ? 'Your KYC submission is under review by our admin team. You will be notified within 24-48 hours.'
                        : 'Verify your identity with KYC to unlock full access to all features.'}
                    </p>
                  </div>
                  {profile.status !== 'approved' && (
                    <Link to="/kyc" style={{ fontFamily: FONTS.body }}
                      className="px-4 py-2 rounded-xl bg-[#C9A84C] text-black font-semibold text-xs hover:bg-[#e8c96d] transition flex-shrink-0 flex items-center gap-1">
                      {profile.status === 'rejected' ? 'Resubmit' : profile.status === 'pending' ? 'View Status' : 'Register'} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "preferences" && (
            <div className="flex flex-col gap-4 pb-20">
              <div className="rounded-2xl bg-white/3 border border-white/8 px-5">
                <PrefRow label="Travel Style"  value={profile.travel_style} />
                <PrefRow label="Pace"          value={profile.pace?.replace("_", "-")} />
                <PrefRow label="Accommodation" value={profile.accommodation_preference} />
              </div>

              <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
                <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">Vibe Scores</p>
                <div className="flex flex-col gap-5">
                  <VibeBar label="Budget to Luxury"  value={profile.budget_level    ?? 5} left="Budget" right="Luxury"  />
                  <VibeBar label="Chill to Extreme"  value={profile.adventure_level ?? 5} left="Chill"  right="Extreme" />
                  <VibeBar label="Solo to Group"     value={profile.social_level    ?? 5} left="Solo"   right="Group"   />
                </div>
              </div>

              {profile.constraint_tags?.length > 0 && (
                <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
                  <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.constraint_tags.map(tag => (
                      <span key={tag.id} style={{ fontFamily: FONTS.body }}
                        className="text-[12px] px-3 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C]/80">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
            </div>

            {/* Friends sidebar (right: 1 col) */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-2xl bg-white/3 border border-white/8 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold uppercase tracking-[0.15em] text-white/30">
                    Friends {friends.length > 0 && <span className="text-[#C9A84C]">({friends.length})</span>}
                  </p>
                </div>

                {friends.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {friends.map(friend => {
                      const name = friend.first_name && friend.last_name
                        ? `${friend.first_name} ${friend.last_name}` : friend.username;
                      return (
                        <Link key={friend.id} to={`/user/${friend.username}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition no-underline group">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/8 flex items-center justify-center">
                            {friend.profile_picture
                              ? <img src={friend.profile_picture} alt={friend.username} className="h-full w-full object-cover" onError={e => e.target.style.display = "none"} />
                              : <span className="text-sm font-bold text-[#C9A84C]" style={{ fontFamily: FONTS.display }}>{friend.username[0].toUpperCase()}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: FONTS.body }} className="text-xs font-semibold text-white truncate group-hover:text-[#C9A84C] transition">{name}</p>
                            <p style={{ fontFamily: FONTS.mono }} className="text-[10px] text-white/25 truncate">@{friend.username}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="h-12 w-12 rounded-full bg-white/4 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white/15" />
                    </div>
                    <p style={{ fontFamily: FONTS.body }} className="text-xs text-white/25 text-center">No friends yet</p>
                    <p style={{ fontFamily: FONTS.body }} className="text-[10px] text-white/15 text-center">Find travel buddies to connect</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <EditModal profile={profile} onClose={() => setEditing(false)}
            onSaved={updated => setProfile(p => ({ ...p, ...updated }))} />
        )}
      </div>
    </>
  );
}