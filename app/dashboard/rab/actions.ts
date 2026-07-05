"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getRabData() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN" && user.role !== "BENDAHARA" && user.role !== "PENASIHAT" && user.role !== "SEKRETARIS" && user.role !== "KOORDINATOR_DIVISI") {
    throw new Error("Forbidden");
  }

  const rabs = await prisma.rAB.findMany({
    include: { items: true, creator: true },
    orderBy: { createdAt: "desc" }
  });

  return { rabs, role: user.role };
}

export async function createRab(title: string, items: any[]) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role !== "BENDAHARA" && user.role !== "SEKRETARIS" && user.role !== "KOORDINATOR_DIVISI") {
    throw new Error("Forbidden: Cannot create RAB");
  }

  await prisma.rAB.create({
    data: {
      title,
      status: "DRAFT",
      creatorId: user.id,
      items: {
        create: items.map(i => ({
          category: i.category,
          item: i.item,
          qty: i.qty,
          unitPrice: i.unitPrice,
          subtotal: i.qty * i.unitPrice
        }))
      }
    }
  });

  revalidatePath("/dashboard/rab");
}

export async function updateRabStatus(rabId: string, status: "SUBMITTED" | "APPROVED" | "REJECTED" | "USULAN" | "DRAFT") {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  const rab = await prisma.rAB.findUnique({ where: { id: rabId } });
  
  if (status === "USULAN" && user.id !== rab?.creatorId) {
    throw new Error("Only the creator can submit as USULAN");
  }

  if (status === "SUBMITTED" && user.role !== "BENDAHARA") {
    throw new Error("Only Bendahara can submit RAB to Admin");
  }
  
  if (status === "DRAFT" && user.role !== "BENDAHARA") {
    // Only Bendahara can revert USULAN back to DRAFT (rejecting the proposal)
    throw new Error("Only Bendahara can revert to DRAFT");
  }

  if ((status === "APPROVED" || status === "REJECTED") && user.role !== "SUPER_ADMIN") {
    throw new Error("Only Super Admin can approve/reject RAB");
  }

  await prisma.rAB.update({
    where: { id: rabId },
    data: { status }
  });

  revalidatePath("/dashboard/rab");
}
