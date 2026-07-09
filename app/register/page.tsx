import Link from "next/link";
import RegisterClient from "./RegisterClient";
import { getDivisions } from "./actions";

// UBAH NILAI INI MENJADI `true` JIKA INGIN MEMBUKA KEMBALI PENDAFTARAN PANITIA
const IS_REGISTRATION_OPEN = false;

export default async function RegisterPage() {
  if (!IS_REGISTRATION_OPEN) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-ink">
          <h1 className="display-sm mb-4 text-ink">Pendaftaran Ditutup</h1>
          <p className="text-body-mid mb-8">
            Mohon maaf, pendaftaran panitia saat ini sudah ditutup. Terima kasih atas antusiasme Anda.
          </p>
          <Link href="/" className="btn-primary inline-flex justify-center px-6 py-2">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const divisions = await getDivisions();

  return <RegisterClient divisions={divisions} />;
}
