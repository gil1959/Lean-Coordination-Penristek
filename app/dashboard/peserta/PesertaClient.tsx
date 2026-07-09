"use client";

import { useState } from "react";
import { updateTrackLink } from "./actions";
import { X } from "lucide-react";

export default function PesertaClient({ initialData }: { initialData: any }) {
  const { tracks, participants } = initialData;
  const [activeTab, setActiveTab] = useState<"daftar" | "link">("daftar");
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null);
  
  // Link settings state
  const [trackId, setTrackId] = useState(tracks.length > 0 ? tracks[0].id : "");
  const [waLink, setWaLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{show: boolean, type: "success"|"error", message: string}>({ show: false, type: "success", message: "" });

  const showPopup = (type: "success"|"error", message: string) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: "success", message: "" }), 5000);
  };

  const handleSaveLink = async () => {
    if (!trackId) return;
    setLoading(true);
    try {
      await updateTrackLink(trackId, waLink);
      showPopup("success", "Link Grup WhatsApp berhasil disimpan.");
      setWaLink("");
    } catch (e: any) {
      showPopup("error", `Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="display-md mb-2">Pendaftaran Peserta Bootcamp</h1>
          <p className="text-body-sm text-body-mid">Kelola data pendaftar dan link grup WhatsApp bidang bootcamp.</p>
        </div>
      </div>

      {popup.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg border ${popup.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <p className="font-medium font-sans">{popup.message}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 border-b border-ink">
        <button 
          onClick={() => setActiveTab("daftar")} 
          className={`pb-2 px-4 font-semibold text-sm transition-colors ${activeTab === "daftar" ? "border-b-2 border-primary text-primary" : "text-body-mid hover:text-ink"}`}
        >
          Daftar Peserta
        </button>
        <button 
          onClick={() => setActiveTab("link")} 
          className={`pb-2 px-4 font-semibold text-sm transition-colors ${activeTab === "link" ? "border-b-2 border-primary text-primary" : "text-body-mid hover:text-ink"}`}
        >
          Pengaturan Link Grup WA
        </button>
      </div>

      {activeTab === "link" && (
        <div className="card-content border border-mute mb-6 max-w-2xl">
          <h3 className="font-semibold text-sm mb-3">Pengaturan Link Grup WA per Bidang</h3>
          <p className="text-xs text-body-mid mb-4">Pilih bidang dan masukkan link grup WhatsApp yang akan muncul setelah peserta berhasil mendaftar.</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Pilih Bidang</label>
              <select className="text-input w-full" value={trackId} onChange={e => {
                setTrackId(e.target.value);
                const selected = tracks.find((t: any) => t.id === e.target.value);
                if (selected && selected.whatsappGroupLink) {
                  setWaLink(selected.whatsappGroupLink);
                } else {
                  setWaLink("");
                }
              }}>
                {tracks.map((t:any) => (
                  <option key={t.id} value={t.id}>{t.name} {t.whatsappGroupLink ? "(Tersedia)" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Link Grup WhatsApp</label>
              <input className="text-input w-full" value={waLink} onChange={e=>setWaLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <div className="pt-2">
              <button className="btn-primary" onClick={handleSaveLink} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "daftar" && (
        <div className="card-content overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink bg-canvas-soft">
                  <th className="p-3 text-xs uppercase font-semibold text-body-mid">Nama</th>
                  <th className="p-3 text-xs uppercase font-semibold text-body-mid">NPM</th>
                  <th className="p-3 text-xs uppercase font-semibold text-body-mid">Opsi 1</th>
                  <th className="p-3 text-xs uppercase font-semibold text-body-mid">Opsi 2</th>
                  <th className="p-3 text-xs uppercase font-semibold text-body-mid text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-body-mid text-sm">Belum ada peserta yang mendaftar.</td>
                  </tr>
                ) : participants.map((p:any) => (
                  <tr key={p.id} className="border-b border-mute hover:bg-canvas-soft transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-body-mid">{p.email}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-medium">{p.npm}</div>
                      <div className="text-xs text-body-mid">Angkatan {p.angkatan}</div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="truncate max-w-[150px]" title={p.track1?.name}>{p.track1?.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{p.experience1}</span>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="truncate max-w-[150px]" title={p.track2?.name}>{p.track2?.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{p.experience2}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        className="text-xs font-semibold text-primary hover:underline px-3 py-1 bg-primary/10 rounded-full transition-colors"
                        onClick={() => setSelectedPeserta(p)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPeserta && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-fade-in">
            <div className="sticky top-0 bg-white border-b border-ink px-6 py-4 flex justify-between items-center z-10">
              <h2 className="font-semibold text-lg font-sans">Detail Pendaftar</h2>
              <button onClick={() => setSelectedPeserta(null)} className="p-2 hover:bg-canvas rounded-full text-body-mid hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-body-mid uppercase mb-1 block">Nama Lengkap</label>
                  <p className="text-sm font-medium text-ink">{selectedPeserta.name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-body-mid uppercase mb-1 block">Email</label>
                  <p className="text-sm font-medium text-ink">{selectedPeserta.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-body-mid uppercase mb-1 block">NPM</label>
                  <p className="text-sm font-medium text-ink">{selectedPeserta.npm}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-body-mid uppercase mb-1 block">Angkatan</label>
                  <p className="text-sm font-medium text-ink">{selectedPeserta.angkatan}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-body-mid uppercase mb-1 block">No HP / WhatsApp</label>
                  <p className="text-sm font-medium text-ink">{selectedPeserta.phone}</p>
                  <a href={`https://wa.me/${selectedPeserta.phone.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                    Hubungi via WA
                  </a>
                </div>
                <div>
                  <label className="text-xs font-semibold text-body-mid uppercase mb-1 block">Tanggal Daftar</label>
                  <p className="text-sm font-medium text-ink">{new Date(selectedPeserta.createdAt).toLocaleString('id-ID')}</p>
                </div>
              </div>

              <hr className="border-ink" />

              <div>
                <label className="text-xs font-semibold text-body-mid uppercase mb-2 block">Pilihan Bidang Opsi 1</label>
                <div className="bg-canvas-soft p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-1 text-primary">{selectedPeserta.track1?.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Level: {selectedPeserta.experience1}
                    </span>
                  </div>
                  <p className="text-xs text-body leading-relaxed"><span className="font-semibold text-ink">Alasan:</span> {selectedPeserta.reason1}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-body-mid uppercase mb-2 block">Pilihan Bidang Opsi 2</label>
                <div className="bg-canvas-soft p-3 rounded-lg">
                  <p className="text-sm font-semibold mb-1 text-purple-700">{selectedPeserta.track2?.name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      Level: {selectedPeserta.experience2}
                    </span>
                  </div>
                  <p className="text-xs text-body leading-relaxed"><span className="font-semibold text-ink">Alasan:</span> {selectedPeserta.reason2}</p>
                </div>
              </div>
              
            </div>
            <div className="sticky bottom-0 bg-white border-t border-ink px-6 py-4 flex justify-end">
              <button className="btn-primary" onClick={() => setSelectedPeserta(null)}>Tutup Detail</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
