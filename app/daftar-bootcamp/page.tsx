import DaftarBootcampClient from "./DaftarBootcampClient";
import { getTracks } from "./actions";

export default async function DaftarBootcampPage() {
  const tracks = await getTracks();

  return <DaftarBootcampClient tracks={tracks} />;
}
