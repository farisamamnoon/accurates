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
  n.toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
  terms: TermItem[],
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors based on the reference image
  const black: [number, number, number] = [0, 0, 0];
  const primaryColor: [number, number, number] = [30, 80, 130]; // dark blue
  const darkGray: [number, number, number] = [80, 80, 80];
  const lightGray: [number, number, number] = [170, 170, 170];
  const tableBorder: [number, number, number] = [200, 200, 200];
  const totalBg: [number, number, number] = [255, 248, 220]; // Keep the totalBg as is
  let y = margin;

  // --- Header ---
  // Company Name
  doc.setTextColor(...black);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(header.companyName.toUpperCase(), margin, y);

  // Logo (Top Right)
  try {
    const base64Logo = await loadImageAsBase64(logoUrl);
    // Positioned at top right: 35mm wide, 20mm high
    doc.addImage(base64Logo, "PNG", pageWidth - margin - 35, 12, 35, 20);
  } catch (error) {
    console.error("Logo failed to load", error);
  }
  y += 7;

  // Horizontal line separating header
  y += 8;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- Client Info & Quotation Details (Two columns) ---
  const initialY = y;
  doc.setTextColor(...black);
  doc.setFontSize(10);

  // Left Column - Client Info
  doc.setFont("helvetica", "bold");
  doc.text(`To: ${header.to}`, margin, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(`Attn: ${header.attn}`, margin, y);
  y += 5;
  doc.text(header.tel, margin, y);
  y += 5;
  doc.text(header.email, margin, y);

  // Right Column - Quotation Details (Matching key-value pair style)
  doc.setFont("helvetica", "bold");
  doc.text("Quotation No.", pageWidth - margin - 60, initialY);
  doc.text("Date:", pageWidth - margin - 60, initialY + 5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkGray);
  doc.text(header.qtn, pageWidth - margin - 35, initialY);
  doc.text(header.date, pageWidth - margin - 35, initialY + 5);

  y = initialY + 25; // Move down for the table

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
    head: [
      ["#", "Material Description", "Qty", "Unit", "Unit Price", "Total SAR"],
    ],
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
  y = doc.lastAutoTable.finalY + 7;

  // --- Totals Section (Three row structure) ---
  const subtotal = items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0,
  );
  // Calculate VAT (assuming 15%)
  const vat = subtotal * 0.15;
  const grandTotal = subtotal + vat;

  const totalsX = pageWidth - margin - 70;
  const valX = pageWidth - margin;

  const drawTotalRow = (
    label: string,
    value: string,
    isBold: boolean,
    textColor: [number, number, number] = [0, 0, 0],
    bg?: [number, number, number],
  ) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 11 : 10);
    doc.setTextColor(...textColor);

    if (bg) {
      doc.setFillColor(...bg);
      doc.rect(totalsX - 2, y - 4.5, valX - totalsX + 4, 8, "F");
    }

    doc.text(label, totalsX, y);
    doc.text(value, valX, y, { align: "right" });
    y += 8;
  };

  drawTotalRow("SUBTOTAL:", fmt(subtotal), false, black);
  drawTotalRow("TAX:", fmt(vat), false, black);
  drawTotalRow("TOTAL:", fmt(grandTotal), true, black, totalBg); // Yellowish highlight

  const pageHeight = doc.internal.pageSize.getHeight();
  const footerMargin = 20; // Distance from the very bottom of the paper

  // 1. Calculate how much space the terms actually need
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const termsText = terms
    .filter((t) => t.text.trim())
    .map((t, idx) => `${idx + 1}. ${t.text}`);

  // splitTextToSize handles long lines that might wrap
  const wrappedTerms = doc.splitTextToSize(termsText.join("\n"), contentWidth);
  const lineCount = wrappedTerms.length;
  const termsBlockHeight = lineCount * 5 + 10; // 5mm per line + 10mm for title

  // 2. Set Y to the bottom of the page minus the height of our terms
  let termsY = pageHeight - footerMargin - termsBlockHeight;

  // 3. Draw the Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Terms and Conditions:", margin, termsY);

  termsY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);

  terms.forEach((term, idx) => {
    if (term.text.trim()) {
      const line = `${idx + 1}. ${term.text}`;
      const splitLine = doc.splitTextToSize(line, contentWidth);
      doc.text(splitLine, margin, termsY);
      termsY += splitLine.length * 5; // Increment Y based on wrapped lines
    }
  });

  // --- Output ---
  const filename = header.qtn ? `Quotation-${header.qtn}.pdf` : "Quotation.pdf";
  doc.save(filename);
};
