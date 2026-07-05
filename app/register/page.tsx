import RegisterClient from "./RegisterClient";
import { getDivisions } from "./actions";

export default async function RegisterPage() {
  const divisions = await getDivisions();

  return <RegisterClient divisions={divisions} />;
}
