import ProfileClient from "./ProfileClient";
import { getProfileData } from "./actions";

export default async function ProfilePage() {
  const user = await getProfileData();

  return (
    <div className="w-full">
      <ProfileClient user={user} />
    </div>
  );
}
