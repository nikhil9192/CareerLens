import { useEffect, useRef, useState } from "react";
import {
  fetchDashboard,
  updateSchoolProfile,
  uploadSchoolLogo,
  SchoolInfo,
} from "../../services/schoolOwner.api";
import { fieldClass, labelClass, buttonClass } from "../../components/PasswordInput";

const UP_BIHAR_DISTRICTS = [
  // Uttar Pradesh
  "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya",
  "Azamgarh", "Badaun", "Bagpat", "Bahraich", "Ballia", "Balrampur", "Banda",
  "Barabanki", "Bareilly", "Basti", "Bijnor", "Bulandshahr", "Chandauli",
  "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad",
  "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur",
  "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj",
  "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar",
  "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri",
  "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit",
  "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal",
  "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar",
  "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi",
  // Bihar
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
  "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui",
  "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai",
  "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna",
  "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar",
  "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran",
];

export default function SchoolProfile() {
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [nameHindi, setNameHindi] = useState("");
  const [tagline, setTagline] = useState("");
  const [district, setDistrict] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [principalMobile, setPrincipalMobile] = useState("");

  // Logo preview
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pendingLogoBase64, setPendingLogoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    fetchDashboard()
      .then((data) => {
        const s = data.school;
        setSchool(s);
        setName(s.name ?? "");
        setNameHindi(s.name_hindi ?? "");
        setTagline(s.tagline ?? "");
        setDistrict(s.district ?? "");
        setPrincipalName(s.principal_name ?? "");
        setPrincipalMobile(s.principal_mobile ?? "");
      })
      .catch(() => showToast("error", "Failed to load school data"))
      .finally(() => setLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "Image must be under 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoPreview(result);
      setPendingLogoBase64(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleLogoUpload() {
    if (!pendingLogoBase64) return;
    setLogoUploading(true);
    try {
      const { logo_url } = await uploadSchoolLogo(pendingLogoBase64);
      setSchool((prev) => prev ? { ...prev, logo_url } : prev);
      setPendingLogoBase64(null);
      showToast("success", "Logo uploaded successfully");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to upload logo";
      showToast("error", msg);
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { school: updated } = await updateSchoolProfile({
        name,
        name_hindi: nameHindi,
        tagline,
        district,
        principal_name: principalName,
        principal_mobile: principalMobile,
      });
      setSchool(updated);
      showToast("success", "Profile saved successfully");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to save profile";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-bone h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const currentLogoUrl = logoPreview ?? school?.logo_url ?? null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">
        School Profile
      </h1>
      <p className="mb-6 text-sm text-[var(--color-text-muted)]">
        Update your school's information and logo
      </p>

      {/* Toast */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`mb-4 rounded-xl p-3 text-sm ${
            toast.type === "success"
              ? "text-[var(--color-good)]"
              : "text-[var(--color-fail)]"
          }`}
          style={{
            backgroundColor:
              toast.type === "success"
                ? "var(--color-success-bg)"
                : "var(--color-error-bg)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Logo section */}
      <div className="card mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
          School Logo
        </h2>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {currentLogoUrl ? (
            <img
              src={currentLogoUrl}
              alt="School logo"
              className="h-20 w-20 rounded-xl object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/5 text-3xl ring-2 ring-white/10">
              🏫
            </div>
          )}

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary rounded-xl px-4 py-2 text-sm font-medium"
            >
              Choose image
            </button>
            {pendingLogoBase64 && (
              <button
                type="button"
                onClick={handleLogoUpload}
                disabled={logoUploading}
                className={`${buttonClass} py-2 text-sm`}
              >
                {logoUploading ? "Uploading…" : "Save logo"}
              </button>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">
              JPEG, PNG or WebP · max 2 MB
            </p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="card space-y-5 p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          School Information
        </h2>

        <div>
          <label className={labelClass}>School Name (English)</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Sarvodaya Inter College"
          />
        </div>

        <div>
          <label className={labelClass}>School Name (Hindi / Devanagari)</label>
          <input
            type="text"
            value={nameHindi}
            onChange={(e) => setNameHindi(e.target.value)}
            className={fieldClass}
            placeholder="e.g. सर्वोदय इंटर कॉलेज"
            lang="hi"
          />
        </div>

        <div>
          <label className={labelClass}>Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Shaping Tomorrow's Leaders"
          />
        </div>

        <div>
          <label className={labelClass}>District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={fieldClass}
          >
            <option value="">— Select district —</option>
            {UP_BIHAR_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Principal Name</label>
          <input
            type="text"
            value={principalName}
            onChange={(e) => setPrincipalName(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Ram Prakash Sharma"
          />
        </div>

        <div>
          <label className={labelClass}>Principal Mobile</label>
          <input
            type="tel"
            value={principalMobile}
            onChange={(e) => setPrincipalMobile(e.target.value)}
            className={fieldClass}
            placeholder="10-digit mobile number"
            maxLength={10}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`${buttonClass} md:w-auto`}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
