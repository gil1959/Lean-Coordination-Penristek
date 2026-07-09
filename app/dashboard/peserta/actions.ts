"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPesertaData() {
  const tracks = await prisma.bootcampTrack.findMany({ orderBy: { name: "asc" } });
  const participants = await prisma.participantRegistration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      track1: true,
      track2: true
    }
  });

  return { tracks, participants };
}

export async function updateTrackLink(trackId: string, link: string) {
  await prisma.bootcampTrack.update({
    where: { id: trackId },
    data: { whatsappGroupLink: link }
  });
  revalidatePath("/dashboard/peserta");
}
