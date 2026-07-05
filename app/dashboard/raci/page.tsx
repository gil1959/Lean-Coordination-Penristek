import RaciClient from "./RaciClient";
import { getRaciData } from "./actions";

export default async function RaciPage() {
  const initialData = await getRaciData();

  return (
    <div className="w-full">
      <RaciClient initialData={initialData} />
    </div>
  );
}
