import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const rabId = url.searchParams.get("rabId");
  if (!rabId) return new NextResponse("Missing rabId", { status: 400 });

  const rab = await prisma.rAB.findUnique({
    where: { id: rabId },
    include: { items: true },
  });

  if (!rab) return new NextResponse("RAB not found", { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

  let y = 800;

  page.drawText(`Rencana Anggaran Biaya: ${rab.title}`, { x: 50, y, size: 16, font: boldFont });
  y -= 30;

  page.drawText(`Status: ${rab.status}`, { x: 50, y, size: 12, font });
  page.drawText(`Tanggal: ${rab.createdAt.toLocaleDateString()}`, { x: 50, y: y - 15, size: 12, font });
  y -= 50;

  // Header Table
  page.drawText("Item", { x: 50, y, size: 10, font: boldFont });
  page.drawText("Qty", { x: 300, y, size: 10, font: boldFont });
  page.drawText("Harga", { x: 350, y, size: 10, font: boldFont });
  page.drawText("Subtotal", { x: 450, y, size: 10, font: boldFont });
  y -= 20;

  rab.items.forEach(item => {
    page.drawText(item.item.substring(0, 40), { x: 50, y, size: 10, font });
    page.drawText(item.qty.toString(), { x: 300, y, size: 10, font });
    page.drawText(item.unitPrice.toLocaleString('id-ID'), { x: 350, y, size: 10, font });
    page.drawText(item.subtotal.toLocaleString('id-ID'), { x: 450, y, size: 10, font });
    y -= 15;
  });

  y -= 15;
  const total = rab.items.reduce((acc, curr) => acc + curr.subtotal, 0);
  page.drawText("TOTAL:", { x: 350, y, size: 12, font: boldFont });
  page.drawText(total.toLocaleString('id-ID'), { x: 450, y, size: 12, font: boldFont });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="RAB_${rab.title}.pdf"`,
    },
  });
}
