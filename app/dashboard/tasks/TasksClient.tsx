"use client";

import { useState } from "react";
import { updateMyTaskProgress } from "./actions";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function TasksClient({ tasks }: { tasks: any[] }) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [status, setStatus] = useState<"BELUM" | "PROSES" | "SELESAI" | "TERHAMBAT">("BELUM");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNotes, setProofNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ show: boolean, type: "success" | "error", message: string }>({ show: false, type: "success", message: "" });

  const showPopup = (message: string, type: "success" | "error" = "success") => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "BELUM": return "badge-pill bg-gray-200 text-gray-800";
      case "PROSES": return "badge-pill bg-blue-200 text-blue-800";
      case "SELESAI": return "badge-pill bg-green-200 text-green-800";
      case "TERHAMBAT": return "badge-pill bg-red-200 text-red-800";
      default: return "badge-pill";
    }
  };

  const handleSelectTask = (task: any) => {
    setSelectedTask(task);
    setStatus(task.status);
    setProofNotes(task.proofNotes || "");
    setProofFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setLoading(true);

    try {
      let finalProofUrl = selectedTask.proofUrl;

      // If a new file is selected, upload it first
      if (proofFile) {
        const formData = new FormData();
        formData.append("file", proofFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadResult = await res.json();
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Gagal mengunggah file");
        }
        finalProofUrl = uploadResult.url;
      }

      await updateMyTaskProgress(selectedTask.id, status, finalProofUrl, proofNotes);
      showPopup("Progres tugas berhasil diperbarui!", "success");
      setSelectedTask(null);
    } catch (e: any) {
      showPopup(e.message || "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="display-md mb-2">Tugas Saya</h1>
          <p className="text-body-sm text-body-mid">Kelola progres dan serahkan bukti pengerjaan tugas Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-canvas border border-mute rounded-md overflow-hidden">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-canvas-soft border-b border-mute">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink-soft">Nama Tugas</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Status</th>
                <th className="px-4 py-3 font-semibold text-ink-soft">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mute">
              {tasks.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3"><span className={getStatusBadge(t.status)}>{t.status}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectTask(t)} className="text-primary font-semibold hover:underline">
                      Laporkan Progres
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-body-mid italic">Anda belum memiliki tugas.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          {selectedTask ? (
            <form onSubmit={handleSubmit} className="card-content border border-mute sticky top-24">
              <h3 className="font-semibold text-lg mb-2">Laporan Progres</h3>
              <p className="text-sm font-semibold text-primary mb-6">{selectedTask.title}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-1">Status Pengerjaan</label>
                  <select className="text-input w-full" value={status} onChange={e=>setStatus(e.target.value as any)}>
                    <option value="BELUM">Belum Dikerjakan</option>
                    <option value="PROSES">Sedang Proses</option>
                    <option value="TERHAMBAT">Terhambat / Ada Kendala</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                </div>

                <div className="border-t border-mute pt-4 mt-4">
                  <label className="text-sm font-semibold block mb-2">Unggah File Bukti (Foto, PDF, Word)</label>
                  {selectedTask.proofUrl && (
                    <div className="mb-2 p-2 bg-green-50 text-green-800 text-xs rounded border border-green-200">
                      Berkas saat ini: <a href={selectedTask.proofUrl} target="_blank" className="underline font-semibold" rel="noreferrer">Lihat Berkas</a>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="text-input w-full text-sm" 
                    onChange={e => setProofFile(e.target.files ? e.target.files[0] : null)} 
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                  <p className="text-xs text-body-mid mt-1">Biarkan kosong jika tidak ingin mengubah file sebelumnya.</p>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1">Keterangan Tambahan / Bukti</label>
                  <textarea 
                    className="text-input w-full h-24" 
                    value={proofNotes} 
                    onChange={e=>setProofNotes(e.target.value)} 
                    placeholder="Contoh: Ini adalah screenshot percakapan dengan vendor..."
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-2 mt-2">
                  {loading ? "Menyimpan Laporan..." : "Simpan Progres & Bukti"}
                </button>

                {/* Tampilkan Catatan / Feedback */}
                {(selectedTask.approvalNotes || (selectedTask.comments && selectedTask.comments.length > 0)) && (
                  <div className="mt-6 pt-4 border-t border-mute space-y-3">
                    <h4 className="font-semibold text-sm">Feedback & Saran</h4>
                    
                    {selectedTask.approvalNotes && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-900">
                        <span className="font-bold">Dari (A) Accountable [Revisi/Reject]:</span>
                        <p className="mt-1">{selectedTask.approvalNotes}</p>
                      </div>
                    )}

                    {selectedTask.comments?.map((c: any) => (
                      <div key={c.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
                        <span className="font-bold">Dari (C) {c.user.name}:</span>
                        <p className="mt-1">{c.text.replace("[SARAN CONSULTED] ", "")}</p>
                        <p className="text-[10px] mt-1 opacity-70">{new Date(c.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="card-content border border-mute text-center py-12 text-body-mid italic">
              Pilih tugas dari tabel sebelah kiri untuk melaporkan progres Anda.
            </div>
          )}
        </div>
      </div>

      {popup.show && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 ${
          popup.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {popup.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />} 
          {popup.message}
        </div>
      )}
    </div>
  );
}
