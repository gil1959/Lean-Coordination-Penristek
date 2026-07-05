# Prompt: Web App Sistem Koordinasi Panitia Bootcamp 5 Track

Gunakan prompt ini untuk membangun (atau minta dibangunkan, misal via Claude Code) sebuah web application internal yang menggabungkan RACI Matrix, Dokumen Tracking, dan modul RAB untuk kepanitiaan bootcamp 5 track paralel (Competitive Programming, CTF, Game Dev, Software Dev, R&D).

---

## 1. Konteks & Tujuan

Bangun sebuah **web application internal kepanitiaan** untuk mengelola koordinasi acara bootcamp kampus dengan 5 track paralel. Aplikasi ini menggantikan sebagian besar rapat rutin dengan sistem yang transparan: setiap orang tahu perannya (lewat RACI Matrix), progres selalu terlihat real-time (lewat Dokumen Tracking), dan keuangan terkelola rapi dengan output siap cetak (lewat modul RAB).

Prinsip utama: **role-based access control** yang ketat — tiap role hanya bisa melihat dan mengubah apa yang relevan dengan tanggung jawabnya.

---

## 2. Tech Stack (rekomendasi, boleh disesuaikan)

- Frontend: Next.js (React) + Tailwind CSS
- Backend: Node.js (Express atau Next.js API routes)
- Database: PostgreSQL (butuh relasi antar role, divisi, task — relational lebih pas dari NoSQL)
- Auth: session/JWT based, dengan middleware pengecekan role di setiap endpoint
- Export PDF: library seperti `pdf-lib` atau `puppeteer` (render HTML ke PDF)
- Export Excel: gunakan `exceljs` — **harus menghasilkan file `.xlsx` asli** (bukan file `.csv` yang di-rename jadi `.xlsx`, karena akan corrupt/format hilang saat dibuka di Excel)

---

## 3. Role & Struktur Akses

Total 7 tipe role:

| Role | Deskripsi |
|---|---|
| **Super Admin (Ketua Panitia)** | Kontrol penuh atas seluruh sistem |
| **Penasihat (Kadep)** | Akses pengawasan, read-only di sebagian besar modul, bisa memberi catatan/komentar |
| **Sekretaris** | Mengelola dokumentasi, membantu admin di RACI & Tracking level administratif |
| **Bendahara** | Pemilik penuh modul RAB, akses terbatas di modul lain |
| **Koordinator Divisi** (Co Acara, Co Humas, dan divisi lain yang dibuat Super Admin) | Mengelola divisinya sendiri penuh, read-only di divisi lain |
| **PJ (Penanggung Jawab Track/Sub-tim)** | Mengelola task di bawah divisinya sendiri (misal PJ Track CTF di bawah Co Acara) |
| **Anggota** | Melihat dan update status task yang ditugaskan ke dirinya sendiri saja |

### Manajemen Divisi (khusus Super Admin)
- Super Admin bisa **membuat divisi baru** kapan saja (contoh: Acara, Humas, PDD, Perlengkapan, atau divisi lain sesuai kebutuhan)
- Saat membuat divisi baru, Super Admin menunjuk siapa jadi **Koordinator Divisi** tersebut
- Koordinator Divisi yang baru dibuat otomatis bisa menambahkan PJ/Anggota ke divisinya sendiri (dengan approval dari Super Admin atau Sekretaris — buat opsi ini configurable)
- Setiap divisi bisa punya sub-tim (contoh: Divisi Acara punya 5 sub-tim track: CP, CTF, Game Dev, Software Dev, R&D)

---

## 4. Modul & Fitur

### 4.1 Autentikasi & Dashboard per Role

- Halaman login sederhana (email/username + password)
- Setelah login, user **langsung diarahkan ke dashboard sesuai role-nya** — bukan dashboard generik yang sama untuk semua orang
- Tiap dashboard menampilkan ringkasan berbeda:
  - **Super Admin**: ringkasan seluruh divisi, status RACI, progres tracking keseluruhan, status RAB, jumlah user per role
  - **Penasihat**: ringkasan read-only lintas divisi, bisa lihat semua progres tapi tanpa tombol edit
  - **Sekretaris**: daftar dokumen, notulensi, deadline mendatang, status update tiap divisi
  - **Bendahara**: ringkasan RAB (total anggaran, status approval, sisa dana), shortcut ke buat RAB baru
  - **Koordinator Divisi**: task list divisinya sendiri, progres PJ/anggota di bawahnya
  - **PJ**: task list track-nya sendiri saja
  - **Anggota**: daftar task yang ditugaskan ke dirinya saja, dengan tombol update status

### 4.2 RACI Matrix

**Struktur data**: setiap baris = 1 task/keputusan, dengan kolom Divisi, Deskripsi Task, dan penunjukan role R/A/C/I ke user atau role tertentu.

**Definisi kolom (gunakan istilah ini persis di UI, jangan diparafrase jadi kata lain yang bisa menyesatkan):**

| Kolom | Kepanjangan | Arti |
|---|---|---|
| **R** | Responsible | Orang yang secara langsung mengerjakan task tersebut |
| **A** | Accountable | Orang yang bertanggung jawab atas hasil akhir dan punya wewenang keputusan final (idealnya 1 orang per task) |
| **C** | Consulted | Orang yang dimintai pendapat/masukan sebelum keputusan diambil (komunikasi 2 arah) |
| **I** | Informed | Orang yang cukup diberi tahu setelah keputusan/hasil selesai (komunikasi 1 arah) |

**Hak akses RACI (ini penting, terapkan ketat):**

| Role | Buat/Edit Task RACI | Ubah Penunjukan Responsible/Accountable/Consulted/Informed | Lihat Semua RACI |
|---|---|---|---|
| Super Admin | Ya | Ya | Ya |
| Penasihat | Tidak | Tidak | Ya (read-only) |
| Sekretaris | Ya (bantu admin) | Tidak (hanya admin) | Ya |
| Bendahara | Tidak | Tidak | Hanya task terkait keuangan |
| Koordinator Divisi | Tidak | Tidak | Ya, tapi hanya bisa update catatan/status di task divisinya sendiri |
| PJ | Tidak | Tidak | Hanya task yang melibatkan dirinya (sebagai R/A/C/I) |
| Anggota | Tidak | Tidak | Hanya task yang melibatkan dirinya |

Fitur tambahan RACI:
- Filter tampilan berdasarkan divisi
- Visual matrix (tabel dengan badge warna berbeda untuk R/A/C/I, bukan teks polos)
- Export RACI ke PDF untuk dibagikan ke pihak luar (misal dosen pembimbing)

### 4.3 Dokumen Tracking

**Struktur data**: task dengan field — Nama Task, Divisi, PIC, Status (Belum/Proses/Selesai/Terhambat), Deadline, Catatan/Blocker.

**Hak akses Tracking:**

| Role | Buat Task | Edit Task Semua Divisi | Edit Task Divisi Sendiri | Update Status Task Sendiri |
|---|---|---|---|---|
| Super Admin | Ya | Ya | — | — |
| Penasihat | Tidak | Tidak (read-only) | — | — |
| Sekretaris | Ya | Ya (administratif) | — | — |
| Bendahara | Ya (task keuangan) | Tidak | Ya | Ya |
| Koordinator Divisi | Ya | Tidak | Ya | Ya |
| PJ | Ya | Tidak | Ya (task track-nya) | Ya |
| Anggota | Tidak | Tidak | Tidak | Ya (task miliknya saja) |

Fitur tambahan Tracking:
- Tampilan dashboard bertingkat: Super Admin lihat ringkasan semua divisi → klik masuk ke detail per divisi → klik lagi masuk ke detail per task
- Notifikasi/highlight otomatis untuk task yang mendekati deadline atau berstatus "Terhambat"
- Tampilan bisa toggle antara **tabel** dan **kanban board** (kolom Belum/Proses/Selesai)

### 4.4 Modul RAB (khusus Bendahara)

- Bendahara bisa membuat RAB baru: input Kategori, Item, Jumlah/Qty, Harga Satuan, Subtotal otomatis terhitung, dan Total keseluruhan otomatis
- Bisa membuat beberapa RAB terpisah (contoh: RAB Konsumsi, RAB Perlengkapan, RAB Publikasi) atau digabung jadi satu RAB besar
- **Alur approval**: Bendahara susun RAB → submit → Super Admin (dan opsional Penasihat) melihat dan approve/reject dengan catatan
- **Export**:
  - **PDF**: format rapi, siap cetak/lampiran proposal resmi, termasuk kop/header (nama acara, tanggal, logo bisa upload)
  - **Excel (.xlsx)**: file Excel asli dengan format currency, border tabel, dan rumus total tetap berfungsi (bukan angka mati hasil convert)
- Riwayat versi RAB (kalau ada revisi, tersimpan histori-nya, bukan langsung ketimpa)

### 4.5 Fitur Tambahan yang Mendukung Kelancaran Acara

- **Papan Pengumuman**: Super Admin/Sekretaris bisa posting pengumuman yang muncul di dashboard semua role
- **Kalender/Timeline**: menampilkan deadline, rapat besar (Rapat Penetapan Konsep & Rapat Gladi Bersih), dan tanggal penting lain dalam satu tampilan
- **Ruang Dokumen**: tempat upload file bersama (proposal, surat, desain, dsb), dengan kategori per divisi
- **Log Aktivitas**: mencatat siapa mengubah apa dan kapan (penting untuk transparansi, terutama di RACI dan RAB)
- **Komentar per Task**: setiap task di Tracking bisa ada thread komentar singkat, untuk diskusi tanpa perlu rapat (menerapkan konsep "silent consent" — kalau tidak ada keberatan dalam waktu tertentu, dianggap disetujui)
- **Manajemen User**: Super Admin bisa menambah/menghapus user, assign role dan divisi
- **Pencarian Global**: cari task, dokumen, atau user dari satu search bar

---

## 5. Panduan Desain (UI/UX)

- **Tidak ada elemen emoji** di seluruh interface, termasuk di label, notifikasi, dan pesan sistem
- Desain **clean dan profesional** — bukan template dashboard generik yang terasa AI-generated (hindari kombinasi warna default seperti krem + terracotta atau dark mode dengan aksen hijau neon yang terlalu umum)
- Gunakan sistem warna yang konsisten untuk membedakan status (misal: abu-abu untuk "Belum", kuning/amber untuk "Proses", hijau untuk "Selesai", merah untuk "Terhambat") — dan warna ini dipakai konsisten di semua modul (RACI, Tracking, RAB)
- Setiap divisi bisa punya kode warna sendiri untuk mempermudah identifikasi visual di seluruh tampilan (tabel, kanban, kalender)
- Tipografi jelas dan mudah dibaca untuk data tabular (gunakan font dengan angka yang mudah dibedakan, misal font monospace atau tabular-nums untuk kolom angka di RAB)
- Layout responsif — harus tetap dapat dipakai dengan baik dari HP, karena tidak semua panitia akan selalu buka dari laptop
- Sertakan **empty state** yang jelas (misal saat divisi baru belum ada task: pesan yang mengarahkan aksi berikutnya, bukan halaman kosong)

---

## 6. Non-Fungsional Requirements

- Setiap endpoint API harus memvalidasi role sebelum mengizinkan akses/perubahan data (jangan hanya disembunyikan di frontend — role check wajib di backend)
- Password di-hash (bukan disimpan plain text)
- Semua perubahan penting (RACI, RAB, penambahan user) tercatat di log aktivitas
- Desain database harus mendukung penambahan divisi baru tanpa perlu perubahan struktur tabel (divisi sebagai data, bukan hardcoded di kode)

---

*Prompt ini bisa langsung dipakai sebagai instruksi ke tool AI coding (Claude Code, dsb) atau sebagai brief ke developer.*
