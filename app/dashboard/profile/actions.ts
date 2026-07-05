"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getProfileData() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { divisi: true }
  });

  if (!dbUser) throw new Error("User not found");
  
  return dbUser;
}

export async function updateProfile(data: { name: string; password?: string }) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  const updateData: any = { name: data.name };
  
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  revalidatePath("/dashboard/profile");
}
