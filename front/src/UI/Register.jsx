import { useState, useRef } from "react";

const STEPS = [
  { id: 1, icon: "", label: "Personal Info", sub: "Name, photo, date of birth" },
  { id: 2, icon: "", label: "Passport / ID", sub: "Citizenship & document details" },
  { id: 3, icon: "", label: "Contact", sub: "Address, phone & email" },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const profileRef = useRef();
  const passportRef = useRef();

  const [form, setForm] = useState({
    firstName: "", lastName: "", dob: "", gender: "",
    citizenship: "", passportNo: "", passportExpiry: "",
    address: "", city: "", country: "", zip: "",
    phone: "", email: "", password: "", confirm: "",
  });
  const [focused, setFocused] = useState(null);
  const [pwVisible, setPwVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const focus = (k) => () => setFocused(k);
  const blur = () => setFocused(null);

  const handlePhoto = (setter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else {
      if (!agreed) { alert("Please agree to the terms"); return; }
      alert("🎉 Account created! Welcome aboard! (Demo)");
    }
  };

  const pwStrength = (() => {
    const l = form.password.length;
    if (!l) return 0; if (l < 5) return 1; if (l < 9) return 2; return 3;
  })();
  const strengthColor = ["", "#f87171", "#fbbf24", "#34d399"][pwStrength];
  const strengthLabel = ["", "Weak", "Good", "Strong"][pwStrength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .rg-root {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh; display: flex;
          background: #f0ece4;
        }

        .rg-side {
          width: 290px; flex-shrink: 0;
          background: #111827; position: relative;
          overflow: hidden; display: flex; flex-direction: column; padding: 44px 32px;
        }
        .rg-side-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&fit=crop');
          background-size: cover; background-position: center; opacity: 0.2;
        }
        .rg-side-fade {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(17,24,39,0.5) 0%, #111827 100%);
        }
        .rg-side-inner { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }

        .rg-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 44px; }
        .rg-logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg,#f97316,#fb923c);
          border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .rg-logo-txt { font-family: 'Montserrat', sans-serif; font-size: 17px; font-weight: 700; color: #fff; }
        .rg-logo-txt span { color: #f97316; }

        .rg-steps { display: flex; flex-direction: column; gap: 0; }
        .rg-step-item { display: flex; align-items: center; gap: 13px; padding: 13px 14px; border-radius: 12px; transition: background 0.2s; }
        .rg-step-item.active { background: rgba(249,115,22,0.13); }
        .rg-step-num {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0; transition: all 0.3s;
        }
        .rg-step-num.active { background: #f97316; color: #fff; box-shadow: 0 0 14px rgba(249,115,22,0.5); }
        .rg-step-num.done { background: #34d399; color: #fff; }
        .rg-step-num.idle { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.25); }
        .rg-step-lbl { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); line-height: 1; }
        .rg-step-lbl.idle { color: rgba(255,255,255,0.25); }
        .rg-step-sub2 { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 3px; }
        .rg-connector { width: 1.5px; height: 16px; background: rgba(255,255,255,0.07); margin-left: 28px; }

        .rg-side-foot { margin-top: auto; }
        .rg-quote { font-family: 'Montserrat', sans-serif; font-style: italic; font-weight: 300; font-size: 17px; color: rgba(255,255,255,0.55); line-height: 1.5; }
        .rg-quote strong { color: #f97316; font-weight: 300; }
        .rg-signin-note { margin-top: 16px; font-size: 12px; color: rgba(255,255,255,0.25); }
        .rg-signin-note a { color: #f97316; text-decoration: none; font-weight: 600; }

        .rg-main {
          flex: 1; display: flex; align-items: flex-start; justify-content: center;
          padding: 48px 40px; overflow-y: auto;
        }

        .rg-card { width: 100%; max-width: 600px; animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .rg-progress { height: 3px; background: #e2ddd6; border-radius: 3px; margin-bottom: 26px; overflow: hidden; }
        .rg-progress-fill { height: 100%; background: linear-gradient(90deg,#ea580c,#f97316,#fbbf24); border-radius: 3px; transition: width 0.5s ease; }

        .rg-tag {
          font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
          color: #f97316; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2);
          padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 12px;
          font-family: 'Poppins', sans-serif;
        }
        .rg-h1 { font-family: 'Montserrat', sans-serif; font-style: italic; font-weight: 300; font-size: 32px; color: #111827; line-height: 1.1; margin-bottom: 4px; }
        .rg-h1 strong { font-weight: 600; color: #f97316; }
        .rg-desc { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }

        .rg-sec-title {
          font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: #9ca3af; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #e5e0d8;
          font-family: 'Poppins', sans-serif;
        }
        .rg-section { margin-bottom: 24px; }

        .rg-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rg-full { grid-column: 1/-1; }

        .rg-photo-row { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
        .rg-avatar {
          width: 78px; height: 78px; border-radius: 50%;
          border: 2.5px dashed #d0c9be; background: #fff;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden; flex-shrink: 0; transition: border-color 0.2s;
        }
        .rg-avatar:hover { border-color: #f97316; }
        .rg-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .rg-avatar-ico { font-size: 22px; }
        .rg-avatar-lbl { font-size: 9px; font-weight: 700; color: #b0a99e; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .rg-photo-note { font-size: 12px; color: #9ca3af; line-height: 1.6; }
        .rg-photo-note strong { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 2px; }

        .rg-passport-box {
          width: 100%; height: 110px; border: 2px dashed #d0c9be; border-radius: 13px;
          background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 5px; cursor: pointer; overflow: hidden; transition: border-color 0.2s, background 0.2s;
        }
        .rg-passport-box:hover { border-color: #f97316; background: #fff9f5; }
        .rg-passport-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 11px; }
        .rg-passport-ico { font-size: 26px; }
        .rg-passport-lbl { font-size: 13px; font-weight: 600; color: #374151; }
        .rg-passport-sub { font-size: 11px; color: #9ca3af; }

        .rg-field { display: flex; flex-direction: column; gap: 5px; }
        .rg-lbl { font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; transition: color 0.2s; }
        .rg-lbl.on { color: #f97316; }
        .rg-iw { position: relative; }
        .rg-inp {
          width: 100%; background: #fff; border: 1.5px solid #e2ddd6; border-radius: 11px;
          padding: 11px 14px; font-size: 14px; font-family: 'Poppins', sans-serif;
          color: #111827; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rg-inp::placeholder { color: #c4bfb7; }
        .rg-inp:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
        select.rg-inp { cursor: pointer; }
        .rg-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.35;
          transition: opacity 0.2s; padding: 4px;
        }
        .rg-pw-toggle:hover { opacity: 0.75; }

        .rg-strength { display: flex; align-items: center; gap: 6px; margin-top: 5px; }
        .rg-s-bars { display: flex; gap: 3px; }
        .rg-s-bar { width: 22px; height: 3px; border-radius: 3px; background: #e2ddd6; transition: background 0.3s; }
        .rg-s-txt { font-size: 10px; font-weight: 700; }

        .rg-terms { display: flex; align-items: flex-start; gap: 10px; margin-top: 16px; }
        .rg-terms input { width: 15px; height: 15px; margin-top: 2px; accent-color: #f97316; flex-shrink: 0; cursor: pointer; }
        .rg-terms-txt { font-size: 12px; color: #6b7280; line-height: 1.6; }
        .rg-terms-txt a { color: #f97316; font-weight: 600; text-decoration: none; }

        .rg-nav { display: flex; gap: 12px; margin-top: 28px; }
        .rg-back {
          padding: 13px 20px; background: transparent; border: 1.5px solid #e2ddd6; border-radius: 11px;
          font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; color: #9ca3af; cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .rg-back:hover { border-color: #9ca3af; color: #6b7280; }
        .rg-next {
          flex: 1; padding: 13px; background: linear-gradient(135deg,#ea580c,#f97316,#fb923c);
          border: none; border-radius: 11px; font-family: 'Poppins', sans-serif;
          font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 18px rgba(249,115,22,0.3); transition: transform 0.15s, box-shadow 0.2s;
        }
        .rg-next:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(249,115,22,0.4); }
        .rg-next:active { transform: translateY(0); }

        @media(max-width:860px) { .rg-side{display:none;} }
        @media(max-width:540px) {
          .rg-grid2{grid-template-columns:1fr;} .rg-full{grid-column:1;}
          .rg-main{padding:28px 18px;}
        }
      `}</style>

      <div className="rg-root">
        {/* SIDEBAR */}
        <div className="rg-side">
          <div className="rg-side-bg" /><div className="rg-side-fade" />
          <div className="rg-side-inner">
            <div className="rg-logo">
              <div className="rg-logo-icon">🌍</div>
              <div className="rg-logo-txt">Travel<span>Co</span></div>
            </div>
            <div className="rg-steps">
              {STEPS.map((s, i) => (
                <div key={s.id}>
                  <div className={`rg-step-item ${step === s.id ? "active" : ""}`}>
                    <div className={`rg-step-num ${step === s.id ? "active" : step > s.id ? "done" : "idle"}`}>
                      {step > s.id ? "✓" : s.icon}
                    </div>
                    <div>
                      <div className={`rg-step-lbl ${step < s.id ? "idle" : ""}`}>{s.label}</div>
                      <div className="rg-step-sub2">{s.sub}</div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && <div className="rg-connector" />}
                </div>
              ))}
            </div>
            <div className="rg-side-foot">
              <div className="rg-quote">Every great journey starts with a <strong>single step.</strong></div>
              <div className="rg-signin-note">Already have an account? <a href="/login">Sign in</a></div>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <div className="rg-main">
          <div className="rg-card" key={step}>
            <div className="rg-progress">
              <div className="rg-progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <div className="rg-tag">Step {step} of 3</div>
            <div className="rg-h1">
              {step === 1 && <>Tell us about <strong>yourself</strong></>}
              {step === 2 && <>Your <strong>travel documents</strong></>}
              {step === 3 && <>How to <strong>reach you</strong></>}
            </div>
            <div className="rg-desc">
              {step === 1 && "Your name, date of birth, and a profile photo."}
              {step === 2 && "We keep your passport info secure and fully encrypted."}
              {step === 3 && "Your address, phone number, email and account password."}
            </div>

            <form onSubmit={nextStep}>

              {/* STEP 1 */}
              {step === 1 && (<>
                <div className="rg-photo-row">
                  <div className="rg-avatar" onClick={() => profileRef.current.click()}>
                    {profilePhoto ? <img src={profilePhoto} alt="profile" /> : <>
                      <div className="rg-avatar-ico">📷</div>
                      <div className="rg-avatar-lbl">Photo</div>
                    </>}
                  </div>
                  <input ref={profileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto(setProfilePhoto)} />
                  <div className="rg-photo-note">
                    <strong>Profile Photo</strong>
                    Upload a clear face photo. JPG or PNG, max 5MB.
                  </div>
                </div>

                <div className="rg-section">
                  <div className="rg-sec-title">Personal Details</div>
                  <div className="rg-grid2">
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="firstName"?"on":""}`}>First Name</label>
                      <input className="rg-inp" value={form.firstName} onChange={set("firstName")} onFocus={focus("firstName")} onBlur={blur} placeholder="Jane" required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="lastName"?"on":""}`}>Last Name</label>
                      <input className="rg-inp" value={form.lastName} onChange={set("lastName")} onFocus={focus("lastName")} onBlur={blur} placeholder="Doe" required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="dob"?"on":""}`}>Date of Birth</label>
                      <input type="date" className="rg-inp" value={form.dob} onChange={set("dob")} onFocus={focus("dob")} onBlur={blur} required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="gender"?"on":""}`}>Gender</label>
                      <select className="rg-inp" value={form.gender} onChange={set("gender")} onFocus={focus("gender")} onBlur={blur} required>
                        <option value="">Select...</option>
                        <option>Male</option><option>Female</option>
                        <option>Non-binary</option><option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>)}

              {/* STEP 2 */}
              {step === 2 && (<>
                <div className="rg-section">
                  <div className="rg-sec-title">Passport / ID Photo</div>
                  <div className="rg-passport-box" onClick={() => passportRef.current.click()}>
                    {passportPhoto ? <img src={passportPhoto} alt="passport" /> : <>
                      <div className="rg-passport-ico">🛂</div>
                      <div className="rg-passport-lbl">Upload passport or ID photo</div>
                      <div className="rg-passport-sub">JPG or PNG — clear, unobstructed scan</div>
                    </>}
                  </div>
                  <input ref={passportRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto(setPassportPhoto)} />
                </div>

                <div className="rg-section">
                  <div className="rg-sec-title">Document Details</div>
                  <div className="rg-grid2">
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="citizenship"?"on":""}`}>Citizenship / Nationality</label>
                      <input className="rg-inp" value={form.citizenship} onChange={set("citizenship")} onFocus={focus("citizenship")} onBlur={blur} placeholder="e.g. Nepali" required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="passportNo"?"on":""}`}>Passport / ID Number</label>
                      <input className="rg-inp" value={form.passportNo} onChange={set("passportNo")} onFocus={focus("passportNo")} onBlur={blur} placeholder="e.g. A12345678" required />
                    </div>
                    <div className="rg-field rg-full">
                      <label className={`rg-lbl ${focused==="passportExpiry"?"on":""}`}>Expiry Date</label>
                      <input type="date" className="rg-inp" value={form.passportExpiry} onChange={set("passportExpiry")} onFocus={focus("passportExpiry")} onBlur={blur} required />
                    </div>
                  </div>
                </div>
              </>)}

              {/* STEP 3 */}
              {step === 3 && (<>
                <div className="rg-section">
                  <div className="rg-sec-title">Address</div>
                  <div className="rg-grid2">
                    <div className="rg-field rg-full">
                      <label className={`rg-lbl ${focused==="address"?"on":""}`}>Street Address</label>
                      <input className="rg-inp" value={form.address} onChange={set("address")} onFocus={focus("address")} onBlur={blur} placeholder="123 Explorer Street" required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="city"?"on":""}`}>City</label>
                      <input className="rg-inp" value={form.city} onChange={set("city")} onFocus={focus("city")} onBlur={blur} placeholder="Kathmandu" required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="zip"?"on":""}`}>Zip / Postal Code</label>
                      <input className="rg-inp" value={form.zip} onChange={set("zip")} onFocus={focus("zip")} onBlur={blur} placeholder="44600" required />
                    </div>
                    <div className="rg-field rg-full">
                      <label className={`rg-lbl ${focused==="country"?"on":""}`}>Country</label>
                      <input className="rg-inp" value={form.country} onChange={set("country")} onFocus={focus("country")} onBlur={blur} placeholder="Nepal" required />
                    </div>
                  </div>
                </div>

                <div className="rg-section">
                  <div className="rg-sec-title">Contact & Account</div>
                  <div className="rg-grid2">
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="phone"?"on":""}`}>Phone Number</label>
                      <input type="tel" className="rg-inp" value={form.phone} onChange={set("phone")} onFocus={focus("phone")} onBlur={blur} placeholder="+977 98XXXXXXXX" required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="email"?"on":""}`}>Email Address</label>
                      <input type="email" className="rg-inp" value={form.email} onChange={set("email")} onFocus={focus("email")} onBlur={blur} placeholder="jane@example.com" required />
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="password"?"on":""}`}>Password</label>
                      <div className="rg-iw">
                        <input type={pwVisible?"text":"password"} className="rg-inp" value={form.password} onChange={set("password")} onFocus={focus("password")} onBlur={blur} placeholder="Min. 8 characters" required style={{paddingRight:38}} />
                        <button type="button" className="rg-pw-toggle" onClick={()=>setPwVisible(!pwVisible)}>{pwVisible?"🙈":"👁"}</button>
                      </div>
                      {form.password.length > 0 && (
                        <div className="rg-strength">
                          <div className="rg-s-bars">
                            {[1,2,3].map(i=>(
                              <div key={i} className="rg-s-bar" style={{background: pwStrength>=i ? strengthColor : "#e2ddd6"}} />
                            ))}
                          </div>
                          <span className="rg-s-txt" style={{color:strengthColor}}>{strengthLabel}</span>
                        </div>
                      )}
                    </div>
                    <div className="rg-field">
                      <label className={`rg-lbl ${focused==="confirm"?"on":""}`}>Confirm Password</label>
                      <input type="password" className="rg-inp" value={form.confirm} onChange={set("confirm")} onFocus={focus("confirm")} onBlur={blur} placeholder="Repeat password" required />
                    </div>
                  </div>

                  <div className="rg-terms">
                    <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} />
                    <div className="rg-terms-txt">
                      I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. My data is handled securely.
                    </div>
                  </div>
                </div>
              </>)}

              <div className="rg-nav">
                {step > 1 && <button type="button" className="rg-back" onClick={()=>setStep(step-1)}>← Back</button>}
                <button type="submit" className="rg-next">
                  {step < 3 ? "Continue →" : "🎉 Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}