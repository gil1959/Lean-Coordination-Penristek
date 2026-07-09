"use server";

import { prisma } from "@/lib/prisma";
import { ExperienceLevel } from "@prisma/client";

export async function getTracks() {
  return await prisma.bootcampTrack.findMany({ orderBy: { name: "asc" } });
}

export async function submitBootcampRegistration(data: {
  name: string;
  npm: string;
  angkatan: string;
  phone: string;
  email: string;
  track1Id: string;
  reason1: string;
  experience1: ExperienceLevel;
  track2Id: string;
  reason2: string;
  experience2: ExperienceLevel;
  commitment: boolean;
}) {
  // Check if email already exists
  const existingReg = await prisma.participantRegistration.findUnique({ where: { email: data.email } });
  if (existingReg) {
    throw new Error("Email ini sudah terdaftar.");
  }

  const result = await prisma.participantRegistration.create({
    data: {
      name: data.name,
      npm: data.npm,
      angkatan: data.angkatan,
      phone: data.phone,
      email: data.email,
      track1Id: data.track1Id,
      reason1: data.reason1,
      experience1: data.experience1,
      track2Id: data.track2Id,
      reason2: data.reason2,
      experience2: data.experience2,
      commitment: data.commitment,
    }
  });

  // Fetch the tracks to get WA links
  const track1 = await prisma.bootcampTrack.findUnique({ where: { id: data.track1Id } });
  const track2 = await prisma.bootcampTrack.findUnique({ where: { id: data.track2Id } });

  return {
    success: true,
    links: {
      track1: { name: track1?.name, link: track1?.whatsappGroupLink },
      track2: { name: track2?.name, link: track2?.whatsappGroupLink }
    }
  };
}
