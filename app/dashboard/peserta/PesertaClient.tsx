"use client";

import { useState } from "react";
import { updateTrackLink, deleteParticipant } from "./actions";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { X, Printer } from "lucide-react";

export default function PesertaClient({ initialData }: { initialData: any }) {
  const { tracks, participants } = initialData;
  const [activeTab, setActiveTab] = useState<"daftar" | "link">("daftar");
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
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

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteParticipant(id);
      showPopup("success", "Peserta berhasil dihapus.");
      setDeleteConfirmId(null);
    } catch (e: any) {
      showPopup("error", `Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const trackCounts = tracks.map((track: any) => {
    const countOpsi1 = participants.filter((p: any) => p.track1Id === track.id).length;
    const countOpsi2 = participants.filter((p: any) => p.track2Id === track.id).length;
    return {
      name: track.name,
      countOpsi1,
      countOpsi2,
      totalCount: countOpsi1 + countOpsi2
    };
  }).sort((a: any, b: any) => b.totalCount - a.totalCount);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    
    // Title
    doc.text("Daftar Peserta Bootcamp", 14, 20);
    doc.setFontSize(12);
    
    // Table 1: All participants
    const table1Column = ["No", "Nama", "NPM", "Angkatan", "Pilihan 1", "Pilihan 2"];
    const table1Rows = participants.map((p: any, index: number) => [
      index + 1,
      p.name,
      p.npm,
      p.angkatan,
      p.track1?.name || "-",
      p.track2?.name || "-"
    ]);
  
    (doc as any).autoTable({
      startY: 30,
      head: [table1Column],
      body: table1Rows,
      theme: 'plain',
      styles: { font: "times", fontSize: 12, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fontStyle: 'bold', fillColor: [255, 255, 255] },
    });
  
    let finalY = (doc as any).lastAutoTable.finalY + 20;
  
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("Daftar Peserta per Bidang", 14, finalY);
    finalY += 10;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
  
    tracks.forEach((track: any) => {
      const trackParticipants = participants.filter((p: any) => p.track1Id === track.id || p.track2Id === track.id);
      
      if (trackParticipants.length > 0) {
        if (finalY > 250) {
          doc.addPage();
          finalY = 20;
        }
  
        doc.setFont("times", "bold");
        doc.text(`Bidang: ${track.name}`, 14, finalY);
        finalY += 5;
        
        const trackRows = trackParticipants.map((p: any, index: number) => [
          index + 1,
          p.name,
          p.npm,
          p.angkatan,
          p.track1Id === track.id ? "1" : "2"
        ]);
  
        (doc as any).autoTable({
          startY: finalY,
          head: [["No", "Nama", "NPM", "Angkatan", "Pilihan Ke"]],
          body: trackRows,
          theme: 'plain',
          styles: { font: "times", fontSize: 12, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
          headStyles: { fontStyle: 'bold', fillColor: [255, 255, 255] },
        });
        
        finalY = (doc as any).lastAutoTable.finalY + 15;
      }
    });
  
    doc.save("Daftar_Peserta_Bootcamp.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="display-md mb-2">Pendaftaran Peserta Bootcamp</h1>
          <p className="text-body-sm text-body-mid">Kelola data pendaftar dan link grup WhatsApp bidang bootcamp.</p>
        </div>
        <button onClick={generatePDF} className="btn-primary flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Cetak PDF
        </button>
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-xs font-semibold text-primary uppercase mb-1">Total Pendaftar</p>
              <h2 className="text-2xl font-bold text-ink">{participants.length} <span className="text-xs font-medium text-body-mid font-sans">Orang</span></h2>
            </div>
          </div>
          
          <div className="card-content border border-mute">
            <h3 className="font-semibold text-sm mb-4">Statistik Peminat per Bidang (Total Opsi 1 & Opsi 2)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {trackCounts.map((tc: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 bg-canvas-soft rounded-lg border border-ink hover:border-primary/50 transition-colors">
                  <div className="flex flex-col truncate mr-2">
                    <span className="text-sm font-semibold truncate" title={tc.name}>{tc.name}</span>
                    <span className="text-[10px] text-body-mid">Opsi 1: {tc.countOpsi1} | Opsi 2: {tc.countOpsi2}</span>
                  </div>
                  <span className="text-sm font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-ink">{tc.totalCount}</span>
                </div>
              ))}
            </div>
          </div>

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
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="text-xs font-semibold text-primary hover:underline px-3 py-1 bg-primary/10 rounded-full transition-colors"
                          onClick={() => setSelectedPeserta(p)}
                        >
                          Detail
                        </button>
                        <button 
                          className="text-xs font-semibold text-red-600 hover:underline px-3 py-1 bg-red-50 rounded-full transition-colors"
                          onClick={() => setDeleteConfirmId(p.id)}
                          disabled={loading}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="font-semibold text-lg mb-2 text-ink">Hapus Peserta?</h3>
            <p className="text-sm text-body-mid mb-6">Tindakan ini tidak dapat dibatalkan. Data peserta akan dihapus secara permanen.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-ink text-sm font-semibold hover:bg-canvas-soft transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
