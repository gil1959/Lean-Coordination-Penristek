"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getRegistrasiData() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN" && user.role !== "SEKRETARIS" && user.role !== "KOORDINATOR_DIVISI") {
    throw new Error("Forbidden");
  }

  // Super Admin & Sekretaris sees all, Koordinator only sees their division choices
  const whereClause = (user.role === "KOORDINATOR_DIVISI") 
    ? { divisionId: user.divisiId } 
    : {};

  const registrations = await prisma.registration.findMany({
    where: whereClause,
    include: { division: true, assignedDiv: true },
    orderBy: { createdAt: "desc" }
  });

  const divisions = await prisma.divisi.findMany({ orderBy: { name: "asc" } });

  // Get current user's division to access the whatsapp link
  const myDivisi = user.divisiId ? await prisma.divisi.findUnique({ where: { id: user.divisiId } }) : null;

  return { registrations, divisions, role: user.role, myDivisi };
}

export async function updateWhatsappLink(divisiId: string, link: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN" && user.divisiId !== divisiId) {
    throw new Error("Forbidden");
  }

  await prisma.divisi.update({
    where: { id: divisiId },
    data: { whatsappGroupLink: link }
  });

  revalidatePath("/dashboard/registrasi");
}

export async function assignRegistration(registrationId: string, assignedDivId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const currentUser = session.user as any;
  if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "SEKRETARIS" && currentUser.role !== "KOORDINATOR_DIVISI") {
    throw new Error("Forbidden");
  }

  // KOORDINATOR_DIVISI can only assign to their own division
  if (currentUser.role === "KOORDINATOR_DIVISI" && assignedDivId !== currentUser.divisiId) {
    throw new Error("Koordinator hanya bisa menempatkan pendaftar ke divisinya sendiri.");
  }

  const reg = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!reg) throw new Error("Registrasi tidak ditemukan");
  
  if (reg.status === "ACCEPTED") {
    throw new Error("Pendaftar ini sudah diterima sebelumnya.");
  }

  // Auto-generate User Account
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  await prisma.user.create({
    data: {
      name: reg.name,
      email: reg.email,
      password: hashedPassword,
      role: "ANGGOTA",
      divisiId: assignedDivId
    }
  });

  // Update registration status
  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: "ACCEPTED",
      assignedDivId: assignedDivId
    }
  });

  revalidatePath("/dashboard/registrasi");
}
