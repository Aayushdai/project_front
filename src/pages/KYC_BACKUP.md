# KYC Form Backup - Removed from Register.jsx

This document contains the KYC (Know Your Customer) form code that was removed from Register.jsx on March 31, 2026. 
This was a Step 2 in the 4-step registration process. 
Keep this for future re-implementation when KYC verification is needed after account creation.

## Step 2 - KYC Form (REMOVED)

### STEPS Array Entry
```javascript
{ id: 2, label: "Passport / ID", sub: "Citizenship & document details" },
```

### Form State Variables (REMOVED)
```javascript
const [passportPhoto, setPassportPhoto] = useState(null);
const [passportFile, setPassportFile] = useState(null);
const [photoErrors, setPhotoErrors] = useState({ profile: "", passport: "" });
const passportRef = useRef();
```

### Form Fields for KYC (REMOVED from form state)
```javascript
{
  citizenship: "",
  passportNo: "",
  passportExpiry: "",
}
```

### Validators for KYC Fields (REMOVED)
```javascript
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
```

### STEP_FIELDS Entry (REMOVED)
```javascript
2: ["citizenship", "passportNo", "passportExpiry"],
```

### Photo Handler Function (REMOVED)
```javascript
const handlePhoto = (setter, fileSetter, photoKey) => (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    setPhotoErrors((p) => ({ ...p, [photoKey]: "Only JPG, PNG or WEBP files allowed" }));
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setPhotoErrors((p) => ({ ...p, [photoKey]: "File must be under 5MB" }));
    return;
  }
  fileSetter(file);
  setPhotoErrors((p) => ({ ...p, [photoKey]: "" }));
  const reader = new FileReader();
  reader.onload = (ev) => setter(ev.target.result);
  reader.readAsDataURL(file);
};
```

### UI Section - Step 2 KYC Form (REMOVED)
```jsx
{/* Step 2 */}
{step === 2 && (
  <>
    <p className="mb-3.5 border-b border-[#e5e0d8] pb-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">Passport / ID Photo *</p>
    <div
      onClick={() => passportRef.current.click()}
      className={`mb-1 flex h-28 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-white transition hover:border-orange-500 hover:bg-orange-50 ${
        photoErrors.passport ? "border-red-400" : "border-[#d0c9be]"
      }`}
    >
      {passportPhoto
        ? <img src={passportPhoto} alt="passport" className="h-full w-full rounded-2xl object-cover" />
        : <>
            <p className="text-[13px] font-semibold text-[#374151]">Upload passport or ID photo</p>
            <p className="text-[11px] text-gray-400">JPG or PNG — clear, unobstructed scan</p>
          </>
      }
    </div>
    {photoErrors.passport && <p className="mb-4 text-[11px] text-red-400">{photoErrors.passport}</p>}
    <input ref={passportRef} type="file" accept="image/*" className="hidden"
      onChange={handlePhoto(setPassportPhoto, setPassportFile, "passport")} />

    <p className="mb-3.5 mt-5 border-b border-[#e5e0d8] pb-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">Document Details</p>
    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      <div className="flex flex-col gap-1">
        <label className={lbl("citizenship")}>Citizenship *</label>
        <input className={inp("citizenship")} value={form.citizenship} onChange={set("citizenship")}
          onFocus={() => setFocused("citizenship")} onBlur={blur("citizenship")} placeholder="e.g. Nepali" />
        {errMsg("citizenship")}
      </div>
      <div className="flex flex-col gap-1">
        <label className={lbl("passportNo")}>Passport / ID No *</label>
        <input className={inp("passportNo")} value={form.passportNo} onChange={set("passportNo")}
          onFocus={() => setFocused("passportNo")} onBlur={blur("passportNo")} placeholder="A12345678" />
        {errMsg("passportNo")}
      </div>
      <div className="col-span-2 flex flex-col gap-1 max-sm:col-span-1">
        <label className={lbl("passportExpiry")}>Expiry Date *</label>
        <input type="date" className={inp("passportExpiry")} value={form.passportExpiry}
          onChange={set("passportExpiry")} onFocus={() => setFocused("passportExpiry")} onBlur={blur("passportExpiry")} />
        {errMsg("passportExpiry")}
      </div>
    </div>
  </>
)}
```

### Form Submission Data (REMOVED from handleSubmit)
```javascript
formData.append("citizenship",     form.citizenship);
formData.append("passport_no",     form.passportNo);
formData.append("passport_expiry", form.passportExpiry);
if (passportFile) formData.append("passport_photo", passportFile);
```

### Photo Validation in validateStep (REMOVED)
```javascript
if (s === 2 && !passportFile) { newPhotoErrors.passport = "Passport photo is required"; valid = false; }
```

## To Re-add KYC Later:

1. Add the Step 2 entry back to STEPS array
2. Restore the form state variables (passportPhoto, passportFile, etc.)
3. Restore the KYC form fields (citizenship, passportNo, passportExpiry)
4. Restore all KYC validators
5. Update STEP_FIELDS with new step 2
6. Restore handlePhoto function
7. Restore the Step 2 UI section
8. Add the passport validation back to validateStep
9. Restore the form submission data appending
10. Create a separate KYC verification page/modal that can be triggered after login

## Notes:
- Backend should also be updated to make these fields optional or handle them separately
- Consider creating a separate KYC endpoint to be called after login instead of during registration
