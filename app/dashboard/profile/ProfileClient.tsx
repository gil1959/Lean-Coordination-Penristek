"use client";

import { useState } from "react";
import { updateProfile } from "./actions";

export default function ProfileClient({ user }: { user: any }) {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await updateProfile({ name, password: password || undefined });
      setMessage("Profil berhasil diperbarui!");
      setPassword("");
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="display-md mb-2">Profil Saya</h1>
        <p className="text-body-sm text-body-mid">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <div className="card-content border border-mute">
        <div className="mb-6 pb-6 border-b border-mute">
          <h3 className="font-semibold text-lg mb-2">Informasi Akun</h3>
          <div className="grid grid-cols-2 gap-4 text-sm font-sans">
            <div>
              <p className="text-body-mid font-semibold">Email</p>
              <p className="text-ink">{user.email}</p>
            </div>
            <div>
              <p className="text-body-mid font-semibold">Role</p>
              <p className="text-ink"><span className="badge-pill bg-gray-100">{user.role}</span></p>
            </div>
            <div>
              <p className="text-body-mid font-semibold">Divisi</p>
              <p className="text-ink">{user.divisi?.name || "-"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-lg mb-2">Perbarui Profil</h3>
          {message && (
            <div className={`p-3 rounded text-sm font-sans ${message.startsWith("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              {message}
            </div>
          )}
          
          <div>
            <label className="text-sm font-semibold block mb-1">Nama Lengkap</label>
            <input required className="text-input w-full" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Ganti Password (Opsional)</label>
            <input type="password" className="text-input w-full" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Biarkan kosong jika tidak ingin mengubah password" />
          </div>
          
          <button type="submit" className="btn-primary py-2 px-6 mt-4" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
