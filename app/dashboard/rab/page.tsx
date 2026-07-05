import RabClient from "./RabClient";
import { getRabData } from "./actions";

export default async function RabPage() {
  const initialData = await getRabData();

  return (
    <div className="w-full">
      <RabClient initialData={initialData} />
    </div>
  );
}
