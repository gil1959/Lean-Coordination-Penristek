"use client";

import { useState } from "react";
import { assignRegistration, updateWhatsappLink } from "./actions";

export default function RegistrasiClient({ initialData }: { initialData: any }) {
  const { registrations, divisions, role, myDivisi } = initialData;
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [assignDivId, setAssignDivId] = useState("");
  const [waLink, setWaLink] = useState("");
  const [waDivId, setWaDivId] = useState(myDivisi?.id || (divisions.length > 0 ? divisions[0].id : ""));
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{show: boolean, type: "success"|"error", message: string}>({ show: false, type: "success", message: "" });

  const showPopup = (type: "success"|"error", message: string) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "success", message: "" }), 5000);
  };

  const handleAssign = async () => {
    if (!assignDivId || !selectedReg) return;
    setLoading(true);
    try {
      await assignRegistration(selectedReg.id, assignDivId);
      showPopup("success", "Pendaftar berhasil diterima dan akun telah terbuat secara otomatis!");
      setSelectedReg(null);
    } catch (e: any) {
      showPopup("error", `Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWaLink = async () => {
    if (!waDivId) return;
    setLoading(true);
    try {
      await updateWhatsappLink(waDivId, waLink);
      showPopup("success", "Link Grup WA berhasil disimpan!");
      setWaLink("");
    } catch (e: any) {
      showPopup("error", `Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getWaMessage = (reg: any) => {
    const assignedDivName = reg.assignedDiv?.name || "Divisi";
    const groupLink = reg.assignedDiv?.whatsappGroupLink || "[LINK_GRUP_BELUM_DISET]";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://website-kepanitiaan.com";
    
    return `Selamat anda masuk ke divisi ${assignedDivName}. Silahkan masuk ke grup divisi melalui link berikut: ${groupLink}
    
Silahkan login ke panel panitia anda di ${baseUrl}/login dengan:
Email: ${reg.email}
Password: password123`;
  };

  const openWhatsapp = (reg: any) => {
    let phone = reg.phone;
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    
    const message = encodeURIComponent(getWaMessage(reg));
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="display-md mb-2">Pendaftaran Panitia</h1>
          <p className="text-body-sm text-body-mid">Review dan seleksi pendaftar panitia.</p>
        </div>
      </div>

      {popup.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg border ${popup.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <p className="font-medium font-sans">{popup.message}</p>
          </div>
        </div>
      )}

      {role === "SUPER_ADMIN" ? (
        <div className="card-content border border-mute mb-6">
          <h3 className="font-semibold text-sm mb-3">Pengaturan Link Grup WA Divisi</h3>
          <div className="flex gap-4 items-end">
            <div className="w-1/4">
              <label className="text-xs font-semibold block mb-1">Pilih Divisi</label>
              <select className="text-input w-full" value={waDivId} onChange={e=>setWaDivId(e.target.value)}>
                {divisions.map((d:any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold block mb-1">Link Grup WhatsApp</label>
              <input className="text-input w-full" value={waLink} onChange={e=>setWaLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <button onClick={handleSaveWaLink} disabled={loading} className="btn-secondary py-2">
              Simpan Link
            </button>
          </div>
        </div>
      ) : (
        myDivisi && (
          <div className="card-content border border-mute mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-semibold block mb-1">Link Grup WhatsApp Divisi {myDivisi.name}</label>
              <input className="text-input w-full" value={waLink} onChange={e=>setWaLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <button onClick={handleSaveWaLink} disabled={loading} className="btn-secondary py-2">
              Simpan Link
            </button>
          </div>
        )
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-canvas border border-mute rounded-md overflow-hidden">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-canvas-soft border-b border-mute">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink-soft">Nama</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Divisi Pilihan</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Status</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mute">
              {registrations.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.division?.name}</td>
                  <td className="px-4 py-3">
                    {r.status === "PENDING" ? <span className="badge-pill bg-yellow-100 text-yellow-800">Menunggu</span> : 
                     <span className="badge-pill bg-green-100 text-green-800">Diterima di {r.assignedDiv?.name}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedReg(r); setAssignDivId(r.divisionId); }} className="text-primary font-semibold hover:underline">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-body-mid italic">Belum ada pendaftar.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-1">
          {selectedReg ? (
            <div className="card-content border border-mute sticky top-24">
              <h3 className="font-semibold text-lg mb-4 pb-2 border-b border-mute">Detail Pendaftar</h3>
              
              <div className="space-y-3 text-sm font-sans mb-6">
                <div><span className="font-semibold block text-body-mid text-xs">Nama:</span> {selectedReg.name}</div>
                <div><span className="font-semibold block text-body-mid text-xs">Email:</span> {selectedReg.email}</div>
                <div><span className="font-semibold block text-body-mid text-xs">No HP (WA):</span> {selectedReg.phone}</div>
                <div><span className="font-semibold block text-body-mid text-xs">Pilihan Divisi:</span> {selectedReg.division?.name}</div>
                <div><span className="font-semibold block text-body-mid text-xs">Alasan Memilih:</span> <p className="mt-1 bg-canvas-soft p-2 rounded">{selectedReg.reason}</p></div>
                <div><span className="font-semibold block text-body-mid text-xs">Bersedia Pindah?:</span> {selectedReg.willingToMove ? "Ya" : "Tidak"}</div>
                {selectedReg.moveReason && (
                  <div><span className="font-semibold block text-body-mid text-xs">Alasan Terkait Pindah:</span> <p className="mt-1 bg-canvas-soft p-2 rounded">{selectedReg.moveReason}</p></div>
                )}
              </div>

              {selectedReg.status === "PENDING" ? (
                <div className="border-t border-mute pt-4">
                  <label className="text-sm font-semibold block mb-2">Penempatan Divisi</label>
                  <select className="text-input w-full mb-3" value={assignDivId} onChange={e=>setAssignDivId(e.target.value)}>
                    {divisions.map((d:any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button onClick={handleAssign} disabled={loading} className="btn-primary w-full py-2">
                    {loading ? "Memproses..." : "Terima & Buatkan Akun"}
                  </button>
                </div>
              ) : (
                <div className="border-t border-mute pt-4">
                  <div className="bg-green-50 text-green-800 p-3 rounded mb-3 text-sm text-center font-medium border border-green-200">
                    Akun panitia telah di-generate!
                  </div>
                  <button onClick={() => openWhatsapp(selectedReg)} className="btn-primary w-full py-2 bg-green-600 border-none hover:bg-green-700">
                    Hubungi via WhatsApp
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card-content border border-mute text-center py-12 text-body-mid italic">
              Pilih pendaftar untuk melihat detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
