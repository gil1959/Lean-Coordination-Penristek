"use client";

import { useState } from "react";
import { submitBootcampRegistration } from "./actions";
import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function DaftarBootcampClient({ tracks }: { tracks: any[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [links, setLinks] = useState<any>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    npm: "",
    angkatan: "",
    phone: "",
    email: "",
    track1Id: "",
    reason1: "",
    experience1: "PEMULA" as "PEMULA" | "MENENGAH" | "MAHIR",
    track2Id: "",
    reason2: "",
    experience2: "PEMULA" as "PEMULA" | "MENENGAH" | "MAHIR",
    commitment: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commitment) {
      setError("Anda harus menyetujui pernyataan komitmen.");
      return;
    }
    if (formData.track1Id === formData.track2Id) {
      setError("Pilihan Bidang Opsi 1 dan Opsi 2 tidak boleh sama.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await submitBootcampRegistration(formData);
      setLinks(res.links);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="display-sm mb-2 text-ink">Pendaftaran Berhasil!</h2>
          <p className="text-body-mid mb-8">
            Terima kasih telah mendaftar. Silakan bergabung dengan grup WhatsApp bidang yang Anda pilih:
          </p>
          
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-xl border border-ink bg-canvas-soft">
              <p className="font-semibold text-sm mb-2">Opsi 1: {links.track1.name}</p>
              {links.track1.link ? (
                <a href={links.track1.link} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center">
                  Gabung Grup WA
                </a>
              ) : (
                <p className="text-xs text-orange-600">Link belum tersedia, silakan hubungi admin.</p>
              )}
            </div>
            
            <div className="p-4 rounded-xl border border-ink bg-canvas-soft">
              <p className="font-semibold text-sm mb-2">Opsi 2: {links.track2.name}</p>
              {links.track2.link ? (
                <a href={links.track2.link} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center">
                  Gabung Grup WA
                </a>
              ) : (
                <p className="text-xs text-orange-600">Link belum tersedia, silakan hubungi admin.</p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-ink">
            <Link href="/" className="text-body hover:text-primary transition-colors text-sm font-medium">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <div className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full border border-ink flex items-center justify-center text-body hover:text-primary hover:border-primary transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-ink">
          <div className="mb-8">
            <h1 className="display-md mb-2 text-ink">Pendaftaran Peserta Bootcamp</h1>
            <p className="text-body-mid">Silakan isi formulir di bawah ini dengan lengkap dan benar.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Nama Lengkap *</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="text-input w-full" placeholder="Cth: Budi Santoso" />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">NPM *</label>
                <input required name="npm" value={formData.npm} onChange={handleChange} className="text-input w-full" placeholder="Cth: G1A024001" />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Angkatan *</label>
                <select required name="angkatan" value={formData.angkatan} onChange={handleChange} className="text-input w-full">
                  <option value="">Pilih Angkatan...</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">No HP / WhatsApp Aktif *</label>
                <input required name="phone" value={formData.phone} onChange={handleChange} className="text-input w-full" placeholder="Cth: 08123456789" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-ink block mb-1">Email Aktif *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="text-input w-full" placeholder="budi@example.com" />
              </div>
            </div>

            <hr className="border-ink my-8" />

            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Pilihan Bidang Opsi 1</h3>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Bidang *</label>
                <select required name="track1Id" value={formData.track1Id} onChange={handleChange} className="text-input w-full">
                  <option value="">Pilih Bidang...</option>
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Alasan Memilih (Singkat) *</label>
                <textarea required maxLength={200} name="reason1" value={formData.reason1} onChange={handleChange} className="text-input w-full min-h-[80px]" placeholder="Berikan 1-2 kalimat alasan Anda..."></textarea>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Level Pengalaman *</label>
                <div className="flex gap-4 mt-2">
                  {['PEMULA', 'MENENGAH', 'MAHIR'].map(level => (
                    <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="experience1" value={level} checked={formData.experience1 === level} onChange={handleChange} />
                      <span className="capitalize">{level.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-ink my-8" />

            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Pilihan Bidang Opsi 2</h3>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Bidang *</label>
                <select required name="track2Id" value={formData.track2Id} onChange={handleChange} className="text-input w-full">
                  <option value="">Pilih Bidang...</option>
                  {tracks.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === formData.track1Id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Alasan Memilih (Singkat) *</label>
                <textarea required maxLength={200} name="reason2" value={formData.reason2} onChange={handleChange} className="text-input w-full min-h-[80px]" placeholder="Berikan 1-2 kalimat alasan Anda..."></textarea>
              </div>
              <div>
                <label className="text-sm font-semibold text-ink block mb-1">Level Pengalaman *</label>
                <div className="flex gap-4 mt-2">
                  {['PEMULA', 'MENENGAH', 'MAHIR'].map(level => (
                    <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="experience2" value={level} checked={formData.experience2 === level} onChange={handleChange} />
                      <span className="capitalize">{level.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-ink my-8" />

            <div>
              <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-lg hover:bg-canvas-soft border border-transparent hover:border-ink transition-colors">
                <input 
                  required
                  type="checkbox" 
                  name="commitment" 
                  checked={formData.commitment} 
                  onChange={handleChange} 
                  className="mt-1 w-5 h-5 rounded border-ink text-primary focus:ring-primary" 
                />
                <span className="text-sm font-medium text-ink">
                  Pernyataan Komitmen: "Saya bersedia mengikuti seluruh rangkaian acara sampai selesai" *
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-lg">
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
