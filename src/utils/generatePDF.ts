import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/accurate-logo.png";

interface HeaderInfo {
  companyName: string;
  date: string;
  to: string;
  attn: string;
  qtn: string;
  tel: string;
  email: string;
}

interface LineItem {
  id: number;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface TermItem {
  id: number;
  text: string;
}

const VAT_RATE = 0.15;

const fmt = (n: number) =>
  n.toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const generatePDF = async (
  header: HeaderInfo,
  items: LineItem[],
  terms: TermItem[]
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor: [number, number, number] = [30, 80, 130]; // dark blue
  const headerBg: [number, number, number] = [30, 80, 130];
  const lightGray: [number, number, number] = [245, 245, 245];
  const totalBg: [number, number, number] = [255, 248, 220];

  // --- Header bar with logo ---
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, 32, "F");

  try {
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", margin, 4, 24, 24);
  } catch {
    // skip logo if it fails to load
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(header.companyName.toUpperCase(), margin + 28, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("QUOTATION", margin + 28, 22);

  // --- Info fields ---
  let y = 40;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const infoLeft = [
    ["Date", header.date],
    ["To", header.to],
    ["Attn", header.attn],
  ];
  const infoRight = [
    ["QTN", header.qtn],
    ["Tel", header.tel],
    ["Email", header.email],
  ];

  infoLeft.forEach(([label, value], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y + i * 7);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", margin + 20, y + i * 7);
  });

  infoRight.forEach(([label, value], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, pageWidth / 2 + 10, y + i * 7);
    doc.setFont("helvetica", "normal");
    doc.text(value || "—", pageWidth / 2 + 30, y + i * 7);
  });

  y += 28;

  // --- Items table ---
  const tableBody = items.map((item, idx) => [
    String(idx + 1),
    item.description,
    String(item.qty),
    item.unit,
    fmt(item.unitPrice),
    fmt(item.qty * item.unitPrice),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Material Description", "Qty", "Unit", "Unit Price", "Total SAR"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      2: { halign: "center", cellWidth: 15 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "right", cellWidth: 28 },
      5: { halign: "right", cellWidth: 30 },
    },
    alternateRowStyles: { fillColor: lightGray },
    theme: "grid",
  });

  // @ts-ignore - autoTable adds finalY
  y = doc.lastAutoTable.finalY + 2;

  // --- Totals ---
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;

  const totalsX = pageWidth - margin - 70;
  const valX = pageWidth - margin;

  const drawTotalRow = (label: string, value: string, isBold: boolean, bg?: [number, number, number]) => {
    if (bg) {
      doc.setFillColor(...bg);
      doc.rect(totalsX - 5, y - 4, 75, 7, "F");
    }
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 11 : 9);
    doc.setTextColor(0, 0, 0);
    doc.text(label, totalsX, y);
    doc.text(value, valX, y, { align: "right" });
    y += 7;
  };

  drawTotalRow("TOTAL SAR", fmt(subtotal), false);
  drawTotalRow("VAT 15%", fmt(vat), false);
  drawTotalRow("GRAND TOTAL SAR", fmt(grandTotal), true, totalBg);

  // --- Terms & Conditions ---
  y += 8;
  if (terms.length > 0 && terms.some((t) => t.text.trim())) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("Terms & Conditions", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    terms.forEach((term, idx) => {
      if (term.text.trim()) {
        doc.text(`${idx + 1}. ${term.text}`, margin, y);
        y += 5;
      }
    });
  }

  // Save
  const filename = header.qtn ? `Quotation-${header.qtn}.pdf` : "Quotation.pdf";
  doc.save(filename);
};
