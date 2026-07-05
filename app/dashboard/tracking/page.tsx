import TrackingClient from "./TrackingClient";
import { getTrackingData } from "./actions";

export default async function TrackingPage() {
  const initialData = await getTrackingData();

  return (
    <div className="w-full">
      <TrackingClient initialData={initialData} />
    </div>
  );
}
