"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getAdminData() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN" && user.role !== "KOORDINATOR_DIVISI") {
    throw new Error("Forbidden");
  }

  const divisions = await prisma.divisi.findMany({ orderBy: { name: "asc" } });
  
  const userWhereClause = user.role === "KOORDINATOR_DIVISI" ? { divisiId: user.divisiId } : {};
  const users = await prisma.user.findMany({ 
    where: userWhereClause,
    include: { divisi: true },
    orderBy: { role: "asc" }
  });

  return { divisions, users, role: user.role, userDivisiId: user.divisiId };
}

export async function createDivisi(name: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Only Super Admin can create Division");
  }

  await prisma.divisi.create({
    data: { name }
  });

  revalidatePath("/dashboard/admin");
}

export async function createUser(data: { name: string; email: string; role: string; divisiId: string; password?: string }) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const currentUser = session.user as any;

  if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "KOORDINATOR_DIVISI") {
    throw new Error("Forbidden: Cannot create user");
  }

  // Koordinator can only create users in their own division
  if (currentUser.role === "KOORDINATOR_DIVISI") {
    if (data.divisiId !== currentUser.divisiId) {
      throw new Error("Forbidden: You can only add users to your own division");
    }
    // Koordinator shouldn't be able to create another Super Admin
    if (data.role === "SUPER_ADMIN") {
      throw new Error("Forbidden: Cannot create Super Admin role");
    }
  }

  const rawPassword = data.password || "password123";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as any,
      divisiId: data.divisiId || null,
    }
  });

  revalidatePath("/dashboard/admin");
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const currentUser = session.user as any;

  if (currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Only Super Admin can delete users");
  }

  if (currentUser.id === userId) {
    throw new Error("Tidak bisa menghapus akun sendiri");
  }

  const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
  if (!userToDelete) throw new Error("User not found");

  await prisma.user.delete({
    where: { id: userId }
  });

  await prisma.registration.deleteMany({
    where: { email: userToDelete.email }
  });

  revalidatePath("/dashboard/admin");
}
