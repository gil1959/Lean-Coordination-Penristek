"use client";

import { useState } from "react";
import { submitRegistration } from "./actions";

export default function RegisterClient({ divisions }: { divisions: any[] }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", divisionId: "", reason: "", willingToMove: "Ya", moveReason: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: "error"|"success", text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await submitRegistration({
        ...form,
        willingToMove: form.willingToMove === "Ya"
      });
      setMessage({ type: "success", text: "Pendaftaran berhasil disubmit! Menunggu konfirmasi dari panitia." });
      setForm({ name: "", email: "", phone: "", divisionId: "", reason: "", willingToMove: "Ya", moveReason: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas p-6 md:p-12 flex justify-center">
      <div className="max-w-3xl w-full">
        {/* Deskripsi Bootcamp */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-sans text-ink mb-4">Open Recruitment Panitia<br/>HIMATIF Summer Bootcamp</h1>
          <div className="bg-canvas-soft border border-mute rounded p-6">
            <h2 className="font-semibold text-lg mb-2">Apa itu HIMATIF Summer Bootcamp?</h2>
            <p className="text-ink text-sm mb-4">
              HIMATIF Summer Bootcamp adalah program pelatihan intensif dari Departemen Penristek HIMATIF yang dirancang untuk membantu mahasiswa Informatika mengasah kemampuan teknis secara terarah, lengkap dengan pendampingan mentor dan proyek nyata sebagai hasil akhir.
            </p>
            <h2 className="font-semibold text-lg mb-2">Manfaat Menjadi Panitia</h2>
            <p className="text-ink text-sm mb-2">Kesempatan ini terbuka untuk seluruh anggota HIMATIF, dengan manfaat sebagai berikut:</p>
            <ul className="list-disc pl-5 text-sm text-ink space-y-1">
              <li>Sertifikat kepanitiaan resmi</li>
              <li>Pengalaman organisasi nyata</li>
              <li>Relasi dengan sesama pengurus HIMATIF dan dosen pembimbing</li>
              <li>Nilai tambah portofolio untuk beasiswa, organisasi, atau dunia kerja</li>
              <li>Kesempatan memahami materi terbaru lebih awal</li>
            </ul>
          </div>
        </div>

        {/* Form Pendaftaran */}
        <div className="card-content border border-mute">
          <h2 className="text-xl font-bold mb-6 border-b border-mute pb-4">Formulir Pendaftaran</h2>
          
          {message && (
            <div className={`p-4 mb-6 rounded text-sm ${message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              {message.text}
            </div>
          )}

          {message?.type === "success" ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-ink mb-2">Pendaftaran Berhasil!</h3>
              <p className="text-body-mid">Terima kasih telah mendaftar. Data Anda telah masuk ke dalam sistem kami.<br/>Anda akan dihubungi melalui WhatsApp jika Anda lolos seleksi panitia.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold block mb-1">Nama Lengkap</label>
                <input required className="text-input w-full" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Contoh: Budi Santoso" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold block mb-1">Email Aktif</label>
                  <input type="email" required className="text-input w-full" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="budi@example.com" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">No. WhatsApp</label>
                  <input type="text" required className="text-input w-full" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="Contoh: 08123456789" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Pilihan Divisi</label>
                <select required className="text-input w-full" value={form.divisionId} onChange={e=>setForm({...form, divisionId: e.target.value})}>
                  <option value="">-- Pilih Divisi --</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Alasan Memilih Divisi Tersebut</label>
                <textarea required className="text-input w-full h-24" value={form.reason} onChange={e=>setForm({...form, reason: e.target.value})} placeholder="Jelaskan motivasi dan pengalaman relevan..." />
              </div>

              <div className="border-t border-mute pt-5">
                <label className="text-sm font-semibold block mb-2">Apakah Anda bersedia ditempatkan di divisi lain jika kuota penuh?</label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="willingToMove" checked={form.willingToMove === "Ya"} onChange={() => setForm({...form, willingToMove: "Ya", moveReason: ""})} /> Ya, bersedia
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="willingToMove" checked={form.willingToMove === "Tidak"} onChange={() => setForm({...form, willingToMove: "Tidak", moveReason: ""})} /> Tidak bersedia
                  </label>
                </div>
                
                <label className="text-sm font-semibold block mb-1">
                  {form.willingToMove === "Ya" ? "Alasan bersedia ditempatkan di divisi lain:" : "Alasan TIDAK bersedia ditempatkan di divisi lain:"}
                </label>
                <textarea required className="text-input w-full h-20" value={form.moveReason} onChange={e=>setForm({...form, moveReason: e.target.value})} placeholder="Jelaskan alasan Anda..." />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4 text-base">
                {loading ? "Mengirim Pendaftaran..." : "Submit Pendaftaran"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
