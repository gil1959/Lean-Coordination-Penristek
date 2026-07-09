import PesertaClient from "./PesertaClient";
import { getPesertaData } from "./actions";

export default async function PesertaPage() {
  const initialData = await getPesertaData();

  return (
    <div className="w-full">
      <PesertaClient initialData={initialData} />
    </div>
  );
}
