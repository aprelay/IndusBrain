import PDFDocument from "pdfkit";

const BLUE = "#1d4ed8";
const DARK = "#0f172a";
const MUTED = "#64748b";

function stripBold(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "$1");
}

/** Renders markdown (the subset our reports use) into a PDF buffer. */
export function markdownToPdf(md: string, title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 54, bottom: 54, left: 54, right: 54 },
      info: { Title: title },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    for (const raw of md.split("\n")) {
      const line = raw.trimEnd();
      if (!line.trim()) {
        doc.moveDown(0.4);
        continue;
      }
      if (line.trim() === "---") {
        doc.addPage();
        continue;
      }
      if (line.startsWith("# ")) {
        doc
          .font("Helvetica-Bold")
          .fontSize(20)
          .fillColor(DARK)
          .text(line.slice(2), { paragraphGap: 6 });
        doc
          .moveTo(doc.page.margins.left, doc.y)
          .lineTo(doc.page.width - doc.page.margins.right, doc.y)
          .strokeColor(BLUE)
          .lineWidth(1.5)
          .stroke();
        doc.moveDown(0.6);
      } else if (line.startsWith("## ")) {
        doc.moveDown(0.4);
        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor(BLUE)
          .text(line.slice(3), { paragraphGap: 4 });
      } else if (line.startsWith("### ")) {
        doc.moveDown(0.2);
        doc
          .font("Helvetica-Bold")
          .fontSize(11.5)
          .fillColor(DARK)
          .text(line.slice(4), { paragraphGap: 3 });
      } else if (line.startsWith("> ")) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(9)
          .fillColor(MUTED)
          .text(line.slice(2), { paragraphGap: 3 });
      } else if (line.startsWith("- ")) {
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(DARK)
          .text(`•  ${stripBold(line.slice(2))}`, {
            indent: 14,
            paragraphGap: 3,
            lineGap: 2,
          });
      } else if (/^\d+\. /.test(line)) {
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(DARK)
          .text(stripBold(line), { indent: 14, paragraphGap: 3, lineGap: 2 });
      } else {
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(DARK)
          .text(stripBold(line), { paragraphGap: 4, lineGap: 2 });
      }
    }
    doc.end();
  });
}
