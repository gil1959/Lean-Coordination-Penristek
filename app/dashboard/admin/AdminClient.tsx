"use client";

import { useState } from "react";
import { createDivisi, createUser, deleteUser, updateUser } from "./actions";

export default function AdminClient({ initialData }: { initialData: any }) {
  const { divisions, users, role, userDivisiId } = initialData;
  const [activeTab, setActiveTab] = useState<"USERS" | "DIVISI">("USERS");
  
  const formatRole = (r: string) => {
    if (r === "SUPER_ADMIN") return "Ketua Panitia";
    if (r === "KOORDINATOR_DIVISI") return "Koordinator";
    if (r === "PJ") return "Penanggung Jawab";
    if (!r) return "";
    return r.charAt(0) + r.slice(1).toLowerCase();
  };
  
  // User Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("ANGGOTA");
  const [selectedDivisiId, setSelectedDivisiId] = useState(role === "KOORDINATOR_DIVISI" ? userDivisiId : "");
  
  // Divisi Form
  const [divisiName, setDivisiName] = useState("");

  // Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("");
  const [editDivisiId, setEditDivisiId] = useState<string>("");

  const isSuperAdmin = role === "SUPER_ADMIN";

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedRole) return;
    try {
      await createUser({ name, email, role: selectedRole, divisiId: selectedDivisiId, password });
      setName(""); setEmail(""); setPassword("");
      if (isSuperAdmin) setSelectedDivisiId("");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateDivisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisiName) return;
    try {
      await createDivisi(divisiName);
      setDivisiName("");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Yakin ingin menghapus user ${userName}?`)) return;
    try {
      await deleteUser(userId);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const startEdit = (u: any) => {
    setEditingUserId(u.id);
    setEditRole(u.role);
    setEditDivisiId(u.divisiId || "");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const handleUpdate = async () => {
    if (!editingUserId) return;
    try {
      await updateUser(editingUserId, { role: editRole, divisiId: editDivisiId });
      setEditingUserId(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="display-md mb-2">Manajemen User & Divisi</h1>
          <p className="text-body-sm text-body-mid">Tambah akun kepanitiaan dan struktur divisi.</p>
        </div>
        <div className="flex bg-canvas-soft border border-mute rounded-md overflow-hidden">
          <button 
            className={`px-4 py-2 text-sm font-semibold ${activeTab === "USERS" ? "bg-primary text-on-primary" : "text-ink"}`}
            onClick={() => setActiveTab("USERS")}
          >Manajemen User</button>
          {isSuperAdmin && (
            <button 
              className={`px-4 py-2 text-sm font-semibold ${activeTab === "DIVISI" ? "bg-primary text-on-primary" : "text-ink"}`}
              onClick={() => setActiveTab("DIVISI")}
            >Manajemen Divisi</button>
          )}
        </div>
      </div>

      {activeTab === "USERS" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <form onSubmit={handleCreateUser} className="card-content border border-mute">
              <h3 className="font-semibold text-lg mb-4">Daftarkan Akun Baru</h3>
              <p className="text-xs text-body-mid mb-4">Password default: <b>password123</b></p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Nama Lengkap</label>
                  <input required className="text-input w-full" value={name} onChange={e=>setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Email</label>
                  <input type="email" required className="text-input w-full" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Password</label>
                  <input type="text" className="text-input w-full" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Kosongkan = password123" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Role</label>
                  <select required className="text-input w-full" value={selectedRole} onChange={e=>setSelectedRole(e.target.value)}>
                    <option value="ANGGOTA">Anggota</option>
                    <option value="PJ">PJ (Penanggung Jawab)</option>
                    <option value="KOORDINATOR_DIVISI">Koordinator Divisi</option>
                    {isSuperAdmin && (
                      <>
                        <option value="SEKRETARIS">Sekretaris</option>
                        <option value="BENDAHARA">Bendahara</option>
                        <option value="PENASIHAT">Penasihat</option>
                        <option value="SUPER_ADMIN">Ketua Panitia (Super Admin)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Divisi</label>
                  <select 
                    required={["ANGGOTA", "PJ", "KOORDINATOR_DIVISI"].includes(selectedRole)}
                    className="text-input w-full disabled:bg-gray-100 disabled:cursor-not-allowed" 
                    value={selectedDivisiId} 
                    onChange={e=>setSelectedDivisiId(e.target.value)}
                    disabled={!isSuperAdmin}
                  >
                    <option value="">-- Pilih Divisi --</option>
                    {divisions.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full mt-4 py-2">Tambah User</button>
              </div>
            </form>
          </div>
          
          <div className="col-span-2">
            <div className="bg-canvas border border-mute rounded-md overflow-hidden overflow-x-auto shadow-sm">
              <table className="w-full text-left font-sans text-sm">
                <thead className="bg-canvas-soft border-b border-mute">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-ink-soft">Nama</th>
                    <th className="px-4 py-3 font-semibold text-ink-soft">Email</th>
                    <th className="px-4 py-3 font-semibold text-ink-soft">Role</th>
                    <th className="px-4 py-3 font-semibold text-ink-soft">Divisi</th>
                    {isSuperAdmin && <th className="px-4 py-3 font-semibold text-ink-soft">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-mute">
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        {editingUserId === u.id ? (
                          <select className="text-input text-xs w-full py-1" value={editRole} onChange={e=>setEditRole(e.target.value)}>
                            <option value="ANGGOTA">Anggota</option>
                            <option value="PJ">PJ (Penanggung Jawab)</option>
                            <option value="KOORDINATOR_DIVISI">Koordinator Divisi</option>
                            <option value="SEKRETARIS">Sekretaris</option>
                            <option value="BENDAHARA">Bendahara</option>
                            <option value="PENASIHAT">Penasihat</option>
                            <option value="SUPER_ADMIN">Ketua Panitia (Super Admin)</option>
                          </select>
                        ) : (
                          <span className="badge-pill bg-gray-100">{formatRole(u.role)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingUserId === u.id ? (
                          <select 
                            className="text-input text-xs w-full py-1 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                            value={editDivisiId} 
                            onChange={e=>setEditDivisiId(e.target.value)}
                            disabled={!["ANGGOTA", "PJ", "KOORDINATOR_DIVISI"].includes(editRole)}
                          >
                            <option value="">-- Pilih Divisi --</option>
                            {divisions.map((d: any) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        ) : (
                          u.divisi?.name || "-"
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          {editingUserId === u.id ? (
                            <div className="flex gap-3">
                              <button onClick={handleUpdate} className="text-green-600 hover:text-green-800 font-semibold text-xs">Simpan</button>
                              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 font-semibold text-xs">Batal</button>
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <button onClick={() => startEdit(u)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs">Edit</button>
                              <button onClick={() => handleDeleteUser(u.id, u.name)} className="text-red-600 hover:text-red-800 font-semibold text-xs">Hapus</button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "DIVISI" && isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handleCreateDivisi} className="card-content border border-mute">
            <h3 className="font-semibold text-lg mb-4">Tambah Divisi</h3>
            <div className="flex gap-2">
              <input required className="text-input flex-1" placeholder="Nama Divisi (contoh: Acara)" value={divisiName} onChange={e=>setDivisiName(e.target.value)} />
              <button type="submit" className="btn-primary py-2 px-4">Tambah</button>
            </div>
          </form>

          <div className="bg-canvas border border-mute rounded-md overflow-hidden">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-canvas-soft border-b border-mute">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink-soft">Nama Divisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mute">
                {divisions.map((d: any) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                  </tr>
                ))}
                {divisions.length === 0 && (
                  <tr><td className="px-4 py-3 text-body-mid italic">Belum ada divisi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
