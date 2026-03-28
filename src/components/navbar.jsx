import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/content.png";

const navLinks = [
  { to: "/home", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function NavbarComponent() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchProfilePic = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch("http://127.0.0.1:8000/users/api/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile_picture) {
          const url = data.profile_picture.startsWith("http")
            ? data.profile_picture
            : `http://127.0.0.1:8000${data.profile_picture}`;
          setProfilePic(url);
        } else {
          setProfilePic(null);
        }
      })
      .catch(() => setProfilePic(null));
  };

  // Fetch on mount / user change
  useEffect(() => { fetchProfilePic(); }, [user]);

  // ✅ Re-fetch whenever ProfilePage fires "profile-updated"
  useEffect(() => {
    const handler = () => fetchProfilePic();
    window.addEventListener("profile-updated", handler);
    return () => window.removeEventListener("profile-updated", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };
  const initial = user?.first_name?.[0] || user?.username?.[0] || "U";

  // Reusable avatar component
  const Avatar = ({ size = "h-9 w-9", textSize = "text-sm" }) => (
    <div className={`${size} flex-shrink-0 overflow-hidden rounded-full bg-[#1976D2] flex items-center justify-center ring-2 ring-white/10`}>
      {profilePic
        ? <img src={profilePic} alt="avatar" className="h-full w-full object-cover" onError={() => setProfilePic(null)} />
        : <span className={`${textSize} font-bold text-white`}>{initial.toUpperCase()}</span>
      }
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(10,12,22,0.85)] backdrop-blur-md font-[Poppins,sans-serif]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 no-underline">
          <img src={logo} alt="logo" className="h-10" />
          <span className="text-[1.1rem] font-bold text-white">
            Travel <span className="text-[#1976D2]">Sathi</span>
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="text-sm text-white/80 no-underline transition hover:text-white">
              {label}
            </Link>
          ))}
          <div className="group relative">
            <button className="text-sm text-white/80 transition hover:text-white">More ▾</button>
            <div className="absolute left-0 top-7 hidden min-w-[140px] rounded-xl bg-[#111] py-1 shadow-lg group-hover:block">
              <span className="block cursor-pointer px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">Blog</span>
              <span className="block cursor-pointer px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">About</span>
            </div>
          </div>
        </div>

        {/* Right — avatar + hamburger */}
        <div className="flex items-center gap-3">
          <div ref={dropdownRef} className="relative">
            <button onClick={() => setDropdownOpen((p) => !p)} className="transition hover:brightness-110">
              <Avatar size="h-9 w-9" textSize="text-sm" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-52 rounded-xl bg-[#111] p-2 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-white/10 px-2 pb-3 pt-1">
                  <Avatar size="h-9 w-9" textSize="text-sm" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white text-sm">
                      {user?.first_name || user?.username || "Guest"}
                    </p>
                    <p className="truncate text-xs text-white/50">{user?.email}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}
                  className="mt-1 block rounded-lg px-3 py-2 text-sm text-white/80 no-underline hover:bg-white/10 hover:text-white">
                  Profile
                </Link>
                <button onClick={handleLogout}
                  className="mt-0.5 w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 hover:text-red-300">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen((p) => !p)} className="flex flex-col gap-1 md:hidden">
            <span className={`block h-0.5 w-5 bg-white transition-all ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-white/80 no-underline hover:text-white">
              {label}
            </Link>
          ))}
          <span className="block py-2 text-sm text-white/80">Blog</span>
          <span className="block py-2 text-sm text-white/80">About</span>
        </div>
      )}
    </nav>
  );
}