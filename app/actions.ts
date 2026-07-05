"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function customSignOut() {
  const cookieStore = await cookies();
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
  cookieStore.delete("next-auth.csrf-token");
  cookieStore.delete("next-auth.callback-url");
  redirect("/login");
}
