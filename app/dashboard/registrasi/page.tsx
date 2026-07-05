import RegistrasiClient from "./RegistrasiClient";
import { getRegistrasiData } from "./actions";

export default async function RegistrasiPage() {
  const initialData = await getRegistrasiData();

  return (
    <div className="w-full">
      <RegistrasiClient initialData={initialData} />
    </div>
  );
}
