"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getRaciData(divisiId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  const whereClause: any = {};
  
  if (divisiId && divisiId !== "ALL") {
    whereClause.divisiId = divisiId;
  } else if (user.role === "PJ" || user.role === "ANGGOTA") {
    // Only see tasks in their division
    whereClause.divisiId = user.divisiId;
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      divisi: true,
      raci: {
        include: { user: true }
      }
    },
    orderBy: { title: "asc" }
  });

  const divisions = await prisma.divisi.findMany({ orderBy: { name: "asc" } });
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return { tasks, divisions, users, role: user.role };
}

export async function updateRaciAssignment(taskId: string, userId: string, roleType: "R" | "A" | "C" | "I", isAdding: boolean) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  
  // RBAC: Only Super Admin and Sekretaris can change RACI assignments
  if (user.role !== "SUPER_ADMIN" && user.role !== "SEKRETARIS") {
    throw new Error("Forbidden: You do not have permission to edit RACI assignments");
  }

  if (isAdding) {
    // Upsert or create
    const existing = await prisma.rACI.findFirst({
      where: { taskId, userId, roleType }
    });
    if (!existing) {
      await prisma.rACI.create({
        data: { taskId, userId, roleType }
      });
    }
  } else {
    // Remove
    await prisma.rACI.deleteMany({
      where: { taskId, userId, roleType }
    });
  }

  revalidatePath("/dashboard/raci");
}
