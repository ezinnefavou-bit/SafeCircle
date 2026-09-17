import { useState } from "react";
import { Mail, Phone, MapPin, Shield, Calendar } from "lucide-react";
import { useAuth } from "../Auth/AuthContext";
import { apiFetch } from "../lib/api";

function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    zone: user?.zone || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const data = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(form),
      });

      updateUser(data?.data?.user || data?.user || data?.data);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold text-ink-900">My Profile</h1>

      <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-900">{user.name}</p>
            <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium capitalize text-brand-700">
              {user.role?.replace("_", " ")}
            </span>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="ml-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-ink-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-ink-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">
                Zone
              </label>
              <input
                type="text"
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="w-full rounded-lg border border-ink-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center gap-3 text-ink-600">
              <Mail size={16} className="text-ink-400" />
              {user.email}
            </div>
            <div className="flex items-center gap-3 text-ink-600">
              <Phone size={16} className="text-ink-400" />
              {user.phone || "Not provided"}
            </div>
            <div className="flex items-center gap-3 text-ink-600">
              <MapPin size={16} className="text-ink-400" />
              {user.zone || "Not provided"}
            </div>
            {user.badgeNumber && (
              <div className="flex items-center gap-3 text-ink-600">
                <Shield size={16} className="text-ink-400" />
                Badge #{user.badgeNumber}
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center gap-3 text-ink-600">
                <Calendar size={16} className="text-ink-400" />
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
