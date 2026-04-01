import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, CheckCircle2, Clock } from "lucide-react";

const VALIDATORS = {
  citizenship: (v) => {
    if (!v.trim()) return "Citizenship is required";
    if (/\d/.test(v)) return "Citizenship cannot contain numbers";
    const trimmed = v.trim();
    if (trimmed.length < 2) return "Citizenship must be at least 2 characters";
    if (trimmed.length > 50) return "Citizenship must be less than 50 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return "Citizenship can only contain letters and spaces";
    return "";
  },
  passportNo: (v) => {
    if (!v.trim()) return "Passport / ID number is required";
    const trimmed = v.trim();
    if (trimmed.length < 6) return "Passport number must be at least 6 characters";
    if (trimmed.length > 20) return "Passport number must be less than 20 characters";
    if (!/^[A-Z0-9]{6,20}$/.test(trimmed.toUpperCase())) return "Passport number can only contain letters and numbers (no spaces or special chars)";
    return "";
  },
  passportExpiry: (v) => {
    if (!v) return "Expiry date is required";
    const expiryDate = new Date(v);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    if (expiryDate < new Date()) return "Passport has already expired";
    if (expiryDate < sixMonthsFromNow) return "Passport must be valid for at least 6 more months";
    return "";
  },
};

export default function KYCForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const passportRef = useRef();

  const [passportPhoto, setPassportPhoto] = useState(null);
  const [passportFile, setPassportFile] = useState(null);
  const [photoError, setPhotoError] = useState("");

  const [form, setForm] = useState({
    citizenship: "",
    passportNo: "",
    passportExpiry: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
    else fetchKYCStatus();
  }, [user, navigate]);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/users/api/kyc/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.kyc_status !== "not_submitted") {
        // Load existing KYC data into form for viewing/editing
        setForm({
          citizenship: data.citizenship || data.nationality || "",
          passportNo: data.passport_no || data.id_number || "",
          passportExpiry: data.passport_expiry || "",
        });
        
        // Load passport photo if available
        if (data.id_document) {
          setPassportPhoto(data.id_document);
        }
      }
    } catch (err) {
      console.log("No existing KYC data found");
    }
  };

  const validate = (field, value) => {
    const fn = VALIDATORS[field];
    return fn ? fn(value) : "";
  };

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
    if (touched[k]) setErrors((er) => ({ ...er, [k]: validate(k, val) }));
  };

  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((er) => ({ ...er, [k]: validate(k, form[k]) }));
    setFocused(null);
  };

  const validateStep = (s) => {
    const fields = s === 1 ? ["citizenship", "passportNo", "passportExpiry"] : [];
    const newErrors = {};
    const newTouched = {};
    let valid = true;

    for (const f of fields) {
      newTouched[f] = true;
      const err = validate(f, form[f]);
      newErrors[f] = err;
      if (err) valid = false;
    }

    if (s === 1 && !passportFile) {
      setPhotoError("Passport photo is required");
      valid = false;
    }

    setErrors((er) => ({ ...er, ...newErrors }));
    setTouched((t) => ({ ...t, ...newTouched }));
    return valid;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Only JPG, PNG or WEBP files allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File must be under 5MB");
      return;
    }

    setPassportFile(file);
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = (ev) => setPassportPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) return;

    setLoading(true);
    setGlobalError("");

    try {
      const formData = new FormData();
      formData.append("citizenship", form.citizenship);
      formData.append("passport_no", form.passportNo);
      formData.append("passport_expiry", form.passportExpiry);
      if (passportFile) formData.append("passport_photo", passportFile);

      const response = await fetch("http://127.0.0.1:8000/users/api/kyc/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        // Notify other components (like ExploreDestination) that KYC form was submitted
        window.dispatchEvent(new Event("kyc-form-submitted"));
        // Redirect to admin KYC dashboard if staff, otherwise to profile
        const redirectPath = user.is_staff ? "/admin/kyc" : "/profile";
        setTimeout(() => navigate(redirectPath), 2000);
      } else {
        setGlobalError(data.message || "Failed to submit KYC form");
      }
    } catch (err) {
      setGlobalError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const inp = (k) =>
    `w-full bg-white border rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-[#c4bfb7] outline-none transition focus:ring-2 focus:ring-orange-500/10 ${
      errors[k] && touched[k]
        ? "border-red-400 focus:border-red-400"
        : "border-[#e2ddd6] focus:border-orange-500"
    }`;

  const lbl = (k) =>
    `text-[10px] font-bold tracking-[1px] uppercase transition-colors ${
      errors[k] && touched[k] ? "text-red-400" : focused === k ? "text-orange-500" : "text-gray-400"
    }`;

  const errMsg = (k) =>
    errors[k] && touched[k] ? <p className="mt-1 text-[11px] text-red-400">{errors[k]}</p> : null;

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f0ece4]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0ece4] font-[Poppins,sans-serif] py-12 px-5">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Profile
        </button>

        {/* Success State */}
        {submitted ? (
          <div className="rounded-2xl bg-white shadow-lg p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-emerald-100 p-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#111827] mb-2">KYC Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Your KYC form has been submitted. Our admin team will review your documents and get back to you within 24-48 hours.
            </p>
            <p className="text-sm text-gray-500">Redirecting to profile...</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-lg p-8 md:p-12">
            {/* Title */}
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Complete Your KYC</h1>
            <p className="text-gray-600 mb-8">
              To unlock full access to all features, please provide your travel document details.
            </p>

            {/* Progress bar */}
            <div className="mb-8 h-[3px] w-full bg-[#e2ddd6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 transition-all duration-500"
                style={{ width: "100%" }}
              />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Passport/ID Photo Upload */}
              <p className="mb-4 border-b border-[#e5e0d8] pb-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
                Passport / ID Photo *
              </p>
              <div
                onClick={() => passportRef.current?.click()}
                className={`mb-6 flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-white transition hover:border-orange-500 hover:bg-orange-50 ${
                  photoError ? "border-red-400" : "border-[#d0c9be]"
                }`}
              >
                {passportPhoto ? (
                  <img src={passportPhoto} alt="passport" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <>
                    <p className="text-[13px] font-semibold text-[#374151]">Upload passport or ID photo</p>
                    <p className="text-[11px] text-gray-400">JPG or PNG — clear, unobstructed scan</p>
                  </>
                )}
              </div>
              {photoError && <p className="mb-6 text-[11px] text-red-400">{photoError}</p>}
              <input
                ref={passportRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />

              {/* Document Details */}
              <p className="mb-4 border-b border-[#e5e0d8] pb-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
                Document Details
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8 max-sm:grid-cols-1">
                <div className="flex flex-col gap-1">
                  <label className={lbl("citizenship")}>Citizenship *</label>
                  <input
                    className={inp("citizenship")}
                    value={form.citizenship}
                    onChange={set("citizenship")}
                    onFocus={() => setFocused("citizenship")}
                    onBlur={blur("citizenship")}
                    placeholder="e.g. Nepali"
                  />
                  {errMsg("citizenship")}
                </div>
                <div className="flex flex-col gap-1">
                  <label className={lbl("passportNo")}>Passport / ID No *</label>
                  <input
                    className={inp("passportNo")}
                    value={form.passportNo}
                    onChange={set("passportNo")}
                    onFocus={() => setFocused("passportNo")}
                    onBlur={blur("passportNo")}
                    placeholder="A12345678"
                  />
                  {errMsg("passportNo")}
                </div>
                <div className="col-span-2 flex flex-col gap-1 max-sm:col-span-1">
                  <label className={lbl("passportExpiry")}>Expiry Date *</label>
                  <input
                    type="date"
                    className={inp("passportExpiry")}
                    value={form.passportExpiry}
                    onChange={set("passportExpiry")}
                    onFocus={() => setFocused("passportExpiry")}
                    onBlur={blur("passportExpiry")}
                  />
                  {errMsg("passportExpiry")}
                </div>
              </div>

              {/* Info box */}
              <div className="mb-8 rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-[12px] text-blue-800">
                  <strong>ℹ️ Your Information is Secure:</strong> Your personal data is encrypted and stored securely. Admin staff will review your documents within 24-48 hours.
                </p>
              </div>

              {/* Error message */}
              {globalError && (
                <div className="mb-6 rounded-xl border border-red-300/20 bg-red-400/8 px-4 py-3 text-[13px] text-red-400">
                  {globalError}
                </div>
              )}

              {/* Submit button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 rounded-xl border border-[#e2ddd6] px-5 py-3 text-[13px] font-semibold text-gray-400 transition hover:border-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_18px_rgba(249,115,22,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.4)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    "Submit KYC Form"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
