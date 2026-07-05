"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getMyTasks() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  const tasks = await prisma.task.findMany({
    where: { 
      OR: [
        { picId: user.id },
        { raci: { some: { userId: user.id, roleType: "R" } } }
      ]
    },
    include: { divisi: true, comments: { include: { user: true }, orderBy: { timestamp: "asc" } } },
    orderBy: { deadline: "asc" }
  });

  return tasks;
}

export async function updateMyTaskProgress(taskId: string, status: "BELUM" | "PROSES" | "SELESAI" | "TERHAMBAT", proofUrl?: string, proofNotes?: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  
  const task = await prisma.task.findUnique({ 
    where: { id: taskId },
    include: { raci: true } 
  });
  if (!task) throw new Error("Task not found");
  
  const isPic = task.picId === user.id;
  const isResponsible = task.raci.some((r: any) => r.userId === user.id && r.roleType === "R");
  
  if (!isPic && !isResponsible) {
    throw new Error("You are not the PIC or Responsible (R) for this task");
  }

  const updateData: any = { status };
  if (proofUrl !== undefined) updateData.proofUrl = proofUrl;
  if (proofNotes !== undefined) updateData.proofNotes = proofNotes;

  await prisma.task.update({
    where: { id: taskId },
    data: updateData
  });

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/tracking");
}
