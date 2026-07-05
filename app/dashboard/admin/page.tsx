import AdminClient from "./AdminClient";
import { getAdminData } from "./actions";

export default async function AdminPage() {
  const initialData = await getAdminData();

  return (
    <div className="w-full">
      <AdminClient initialData={initialData} />
    </div>
  );
}
