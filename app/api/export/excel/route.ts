import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rabId = req.nextUrl.searchParams.get("rabId");
    if (!rabId) {
      return NextResponse.json({ error: "RAB ID is required" }, { status: 400 });
    }

    const rab = await prisma.rAB.findUnique({
      where: { id: rabId },
      include: {
        items: true,
        creator: true,
      },
    });

    if (!rab) {
      return NextResponse.json({ error: "RAB not found" }, { status: 404 });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("RAB - " + rab.title);

    // Add title
    sheet.mergeCells("A1:E1");
    sheet.getCell("A1").value = "Rencana Anggaran Biaya (RAB): " + rab.title;
    sheet.getCell("A1").font = { size: 14, bold: true };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    // Add creator and date
    sheet.mergeCells("A2:E2");
    const dateStr = new Date(rab.createdAt).toLocaleDateString("id-ID");
    sheet.getCell("A2").value = `Dibuat oleh: ${rab.creator?.name || "-"} | Tanggal: ${dateStr}`;
    sheet.getCell("A2").font = { italic: true };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Spacer
    sheet.addRow([]);

    // Headers
    const headers = ["No", "Kategori", "Item", "Qty", "Harga Satuan", "Subtotal"];
    sheet.addRow(headers);
    const headerRow = sheet.getRow(4);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Data
    let total = 0;
    rab.items.forEach((item, idx) => {
      total += item.subtotal;
      const row = sheet.addRow([
        idx + 1,
        item.category,
        item.item,
        item.qty,
        item.unitPrice,
        item.subtotal,
      ]);
      row.getCell(5).numFmt = 'Rp#,##0.00';
      row.getCell(6).numFmt = 'Rp#,##0.00';
      
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Total row
    const totalRow = sheet.addRow(["", "", "", "", "TOTAL:", total]);
    totalRow.getCell(5).font = { bold: true };
    totalRow.getCell(6).font = { bold: true };
    totalRow.getCell(6).numFmt = 'Rp#,##0.00';

    // Set column widths
    sheet.getColumn(1).width = 5;
    sheet.getColumn(2).width = 25;
    sheet.getColumn(3).width = 30;
    sheet.getColumn(4).width = 10;
    sheet.getColumn(5).width = 20;
    sheet.getColumn(6).width = 20;

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="RAB_${rab.title.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
