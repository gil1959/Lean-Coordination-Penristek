"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

export async function getTrackingData() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  const isGlobalViewer = user.role === "SUPER_ADMIN" || user.role === "SEKRETARIS" || user.role === "PENASIHAT";

  let tasks;
  
  if (isGlobalViewer) {
    tasks = await prisma.task.findMany({
      include: { divisi: true, pic: true, raci: { include: { user: true } }, comments: { include: { user: true }, orderBy: { timestamp: "asc" } } },
      orderBy: { deadline: "asc" }
    });
  } else {
    // Only see tasks where they are PIC, or have a RACI record, or informAll is true
    tasks = await prisma.task.findMany({
      where: {
        OR: [
          { picId: user.id },
          { raci: { some: { userId: user.id } } },
          { informAll: true },
          ...(user.role === "KOORDINATOR_DIVISI" && user.divisiId ? [{ divisiId: user.divisiId }] : [])
        ]
      },
      include: { divisi: true, pic: true, raci: { include: { user: true } }, comments: { include: { user: true }, orderBy: { timestamp: "asc" } } },
      orderBy: { deadline: "asc" }
    });
  }

  const divisions = await prisma.divisi.findMany({ orderBy: { name: "asc" } });
  const users = await prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, role: true, divisiId: true } });

  return { tasks, divisions, users, role: user.role, userId: user.id, userDivisiId: user.divisiId };
}

export async function createTask(data: { 
  title: string; divisiId: string; picIds: string[]; deadline: string; notes: string;
  accountableId?: string; consultedIds?: string[]; informedIds?: string[]; informAll?: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  if (user.role === "ANGGOTA" || user.role === "PENASIHAT") {
    throw new Error("Forbidden: Cannot create tasks");
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      divisiId: data.divisiId,
      picId: data.picIds && data.picIds.length > 0 ? data.picIds[0] : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      notes: data.notes,
      status: "BELUM",
      approvalStatus: "WAITING",
      informAll: data.informAll || false
    }
  });

  // Create RACI records
  const raciData = [];
  
  // Responsible (R) -> PICs
  if (data.picIds && data.picIds.length > 0) {
    data.picIds.forEach((id) => {
      raciData.push({ taskId: task.id, userId: id, roleType: "R" });
    });
  }
  
  // Accountable (A)
  if (data.accountableId) {
    raciData.push({ taskId: task.id, userId: data.accountableId, roleType: "A" });
  }

  // Consulted (C)
  if (data.consultedIds && data.consultedIds.length > 0) {
    data.consultedIds.forEach((id) => {
      raciData.push({ taskId: task.id, userId: id, roleType: "C" });
    });
  }

  // Informed (I)
  if (data.informedIds && data.informedIds.length > 0) {
    data.informedIds.forEach((id) => {
      raciData.push({ taskId: task.id, userId: id, roleType: "I" });
    });
  }

  if (raciData.length > 0) {
    await prisma.rACI.createMany({
      data: raciData as any
    });
  }

  revalidatePath("/dashboard/tracking");
}

export async function updateTaskStatus(taskId: string, status: "BELUM" | "PROSES" | "SELESAI" | "TERHAMBAT") {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  const user = session.user as any;
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { raci: true } });
  if (!task) throw new Error("Task not found");

  const isPic = task.picId === user.id;
  const isR = task.raci.some(r => r.userId === user.id && r.roleType === "R");
  const canEdit = isPic || isR || user.role === "SUPER_ADMIN";

  if (!canEdit) throw new Error("Forbidden: Cannot update status");

  await prisma.task.update({
    where: { id: taskId },
    data: { status }
  });

  revalidatePath("/dashboard/tracking");
}

export async function approveTask(taskId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const user = session.user as any;

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { raci: true } });
  if (!task) throw new Error("Task not found");

  const isA = task.raci.some(r => r.userId === user.id && r.roleType === "A");
  if (!isA && user.role !== "SUPER_ADMIN") throw new Error("Forbidden: You are not Accountable for this task");

  await prisma.task.update({
    where: { id: taskId },
    data: { approvalStatus: "APPROVED", status: "SELESAI" }
  });

  revalidatePath("/dashboard/tracking");
}

export async function rejectTask(taskId: string, notes: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const user = session.user as any;

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { raci: true } });
  if (!task) throw new Error("Task not found");

  const isA = task.raci.some(r => r.userId === user.id && r.roleType === "A");
  if (!isA && user.role !== "SUPER_ADMIN") throw new Error("Forbidden: You are not Accountable for this task");

  await prisma.task.update({
    where: { id: taskId },
    data: { approvalStatus: "REJECTED", approvalNotes: notes, status: "PROSES" } // return to PROSES
  });

  revalidatePath("/dashboard/tracking");
}

export async function giveConsultedFeedback(taskId: string, text: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const user = session.user as any;

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { raci: true } });
  if (!task) throw new Error("Task not found");

  const isC = task.raci.some(r => r.userId === user.id && r.roleType === "C");
  if (!isC && user.role !== "SUPER_ADMIN") throw new Error("Forbidden: You are not Consulted for this task");

  await prisma.comment.create({
    data: {
      taskId,
      userId: user.id,
      text: `[SARAN CONSULTED] ${text}`
    }
  });

  revalidatePath("/dashboard/tracking");
}
