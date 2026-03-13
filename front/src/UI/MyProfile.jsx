import { useState, useRef, useEffect } from "react";

export default function MyProfile() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const photoRef = useRef();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewPhoto(ev.target.result);
    reader.readAsDataURL(file);
    setEditingPhoto(true);
  };

  const handleSavePhoto = async () => {
    if (!photoFile || !user?.id) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const formData = new FormData();
      formData.append("profile_photo", photoFile);

      const response = await fetch(`${apiUrl}users/${user.id}/`, {
        method: "PATCH",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        const updated = { ...user, profile_photo: data.profile_photo };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setEditingPhoto(false);
        setPreviewPhoto(null);
        setSaveMsg("✓ Photo updated!");
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveMsg("Failed to update photo.");
      }
    } catch {
      setSaveMsg("Server error.");
    } finally {
      setSaving(false);
    }
  };

  const currentPhoto = previewPhoto || user?.profile_photo;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .pf-root {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          background: #07080f;
          color: #f5f0e8;
          padding: 40px 20px 80px;
        }

        .pf-container {
          max-width: 900px;
          margin: 0 auto;
        }

        /* ── Cover ── */
        .pf-cover {
          height: 180px;
          border-radius: 20px 20px 0 0;
          background: linear-gradient(135deg, #0d1117 0%, #1a1200 50%, #0d1117 100%);
          position: relative;
          overflow: hidden;
        }
        .pf-cover::before {
          content: '';
          position: absolute; inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(240,194,122,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 50%, rgba(25,118,210,0.1) 0%, transparent 60%);
        }
        .pf-cover-pattern {
          position: absolute; inset: 0; opacity: 0.04;
          background-image: repeating-linear-gradient(
            45deg, #f0c27a 0px, #f0c27a 1px, transparent 1px, transparent 20px
          );
        }

        /* ── Card ── */
        .pf-card {
          background: rgba(15,16,26,0.97);
          border: 1px solid rgba(255,255,255,0.07);
          border-top: none;
          border-radius: 0 0 20px 20px;
          padding: 0 36px 40px;
        }

        /* ── Avatar area ── */
        .pf-avatar-row {
          display: flex;
          align-items: flex-end;
          gap: 20px;
          margin-top: -56px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        }
        .pf-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .pf-avatar {
          width: 110px; height: 110px;
          border-radius: 50%;
          border: 3px solid #0f101a;
          object-fit: cover;
          background: linear-gradient(135deg, #1565C0, #1976D2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Montserrat', sans-serif;
          font-size: 36px; font-weight: 700; color: #fff;
          overflow: hidden;
        }
        .pf-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .pf-avatar-edit {
          position: absolute; bottom: 4px; right: 4px;
          width: 30px; height: 30px; border-radius: 50%;
          background: #f0c27a; border: 2px solid #0f101a;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 13px;
          transition: transform 0.2s, background 0.2s;
        }
        .pf-avatar-edit:hover { transform: scale(1.1); background: #e6b86a; }

        .pf-name-block { flex: 1; padding-bottom: 8px; }
        .pf-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 26px; font-weight: 700; color: #f5f0e8;
          line-height: 1.1;
        }
        .pf-location {
          font-size: 13px; color: rgba(255,255,255,0.4);
          margin-top: 4px;
          display: flex; align-items: center; gap: 5px;
        }

        .pf-save-btn {
          padding: 9px 22px;
          background: linear-gradient(135deg, #c9973a, #f0c27a);
          border: none; border-radius: 10px;
          font-family: 'Poppins', sans-serif;
          font-size: 13px; font-weight: 600; color: #0f0e0d;
          cursor: pointer; transition: transform 0.15s, opacity 0.2s;
          align-self: flex-end;
        }
        .pf-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .pf-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .pf-save-msg {
          font-size: 12px; color: #34d399;
          align-self: flex-end; padding-bottom: 10px;
        }

        /* ── Grid ── */
        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 28px;
        }
        @media(max-width: 640px) { .pf-grid { grid-template-columns: 1fr; } }

        .pf-full { grid-column: 1 / -1; }

        /* ── Section ── */
        .pf-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 22px;
        }
        .pf-section-title {
          font-size: 10px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #f0c27a; margin-bottom: 16px;
          font-family: 'Poppins', sans-serif;
        }

        /* ── Info rows ── */
        .pf-info-row {
          display: flex; justify-content: space-between;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 12px;
        }
        .pf-info-row:last-child { border-bottom: none; }
        .pf-info-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.5px; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .pf-info-value {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.82);
          text-align: right;
        }

        /* ── Badge ── */
        .pf-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
          background: rgba(240,194,122,0.1);
          border: 1px solid rgba(240,194,122,0.2);
          color: #f0c27a;
          font-family: 'Poppins', sans-serif;
        }

        /* ── Member since ── */
        .pf-member {
          text-align: center;
          padding: 14px;
          background: rgba(240,194,122,0.04);
          border: 1px solid rgba(240,194,122,0.1);
          border-radius: 12px;
          margin-top: 20px;
        }
        .pf-member-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .pf-member-date { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 600; color: #f0c27a; margin-top: 4px; }

        /* ── No user ── */
        .pf-no-user {
          text-align: center; padding: 80px 20px;
          color: rgba(255,255,255,0.3);
          font-size: 15px;
        }
      `}</style>

      <div className="pf-root">
        <div className="pf-container">
          {!user ? (
            <div className="pf-no-user">
              No user data found. Please <a href="/login" style={{color:"#f0c27a"}}>log in</a>.
            </div>
          ) : (
            <>
              <div className="pf-cover">
                <div className="pf-cover-pattern" />
              </div>

              <div className="pf-card">
                {/* Avatar + Name Row */}
                <div className="pf-avatar-row">
                  <div className="pf-avatar-wrap">
                    <div className="pf-avatar">
                      {currentPhoto
                        ? <img src={currentPhoto} alt="Profile" />
                        : (user.first_name?.[0] || "U").toUpperCase()
                      }
                    </div>
                    <div className="pf-avatar-edit" onClick={() => photoRef.current.click()} title="Change photo">
                      📷
                    </div>
                    <input
                      ref={photoRef} type="file" accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePhotoChange}
                    />
                  </div>

                  <div className="pf-name-block">
                    <div className="pf-name">{user.first_name} {user.last_name}</div>
                    <div className="pf-location">
                      📍 {user.city}, {user.country}
                    </div>
                  </div>

                  {editingPhoto && (
                    <button className="pf-save-btn" onClick={handleSavePhoto} disabled={saving}>
                      {saving ? "Saving..." : "Save Photo"}
                    </button>
                  )}
                  {saveMsg && <div className="pf-save-msg">{saveMsg}</div>}
                </div>

                {/* Info Grid */}
                <div className="pf-grid">

                  {/* Personal Info */}
                  <div className="pf-section">
                    <div className="pf-section-title">Personal Info</div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">First Name</span>
                      <span className="pf-info-value">{user.first_name}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Last Name</span>
                      <span className="pf-info-value">{user.last_name}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Date of Birth</span>
                      <span className="pf-info-value">{user.dob}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Gender</span>
                      <span className="pf-info-value" style={{textTransform:"capitalize"}}>{user.gender}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="pf-section">
                    <div className="pf-section-title">Contact</div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Email</span>
                      <span className="pf-info-value" style={{fontSize:"12px"}}>{user.email}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Phone</span>
                      <span className="pf-info-value">{user.phone}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">City</span>
                      <span className="pf-info-value">{user.city}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Country</span>
                      <span className="pf-info-value">{user.country}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="pf-section">
                    <div className="pf-section-title">Address</div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Street</span>
                      <span className="pf-info-value">{user.address}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">ZIP Code</span>
                      <span className="pf-info-value">{user.zip_code}</span>
                    </div>
                  </div>

                  {/* Travel Documents */}
                  <div className="pf-section">
                    <div className="pf-section-title">Travel Documents</div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Citizenship</span>
                      <span className="pf-info-value">{user.citizenship}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Passport No</span>
                      <span className="pf-info-value">{user.passport_no}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Expiry</span>
                      <span className="pf-info-value">{user.passport_expiry}</span>
                    </div>
                  </div>

                </div>

                {/* Member Since */}
                <div className="pf-member">
                  <div className="pf-member-label">Member Since</div>
                  <div className="pf-member-date">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}