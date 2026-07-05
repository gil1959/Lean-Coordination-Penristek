"use server";

import { prisma } from "@/lib/prisma";

export async function getDivisions() {
  return await prisma.divisi.findMany({ orderBy: { name: "asc" } });
}

export async function submitRegistration(data: {
  name: string;
  email: string;
  phone: string;
  divisionId: string;
  reason: string;
  willingToMove: boolean;
  moveReason: string;
}) {
  // Check if email already exists
  const existingReg = await prisma.registration.findUnique({ where: { email: data.email } });
  if (existingReg) {
    throw new Error("Email ini sudah digunakan untuk pendaftaran.");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error("Email ini sudah terdaftar sebagai panitia aktif.");
  }

  await prisma.registration.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      divisionId: data.divisionId,
      reason: data.reason,
      willingToMove: data.willingToMove,
      moveReason: data.moveReason,
    }
  });

  return { success: true };
}
