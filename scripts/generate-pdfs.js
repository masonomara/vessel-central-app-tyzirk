const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const documents = [
  { file: 'vessel_registration.pdf', title: 'Vessel Registration', subtitle: 'Purely Blu — USCG Documentation' },
  { file: 'hull_insurance.pdf', title: 'Hull & Machinery Insurance', subtitle: 'Policy Year 2026–2027' },
  { file: 'dpnr_registration.pdf', title: 'USVI DPNR Registration', subtitle: 'Department of Planning & Natural Resources' },
  { file: 'captain_license.pdf', title: 'Captain License', subtitle: 'Brett Nealson — USCG Master 100 Ton' },
  { file: 'fcc_license.pdf', title: 'FCC Station License', subtitle: 'Ship Radio Station Authorization' },
  { file: 'bahamas_permit.pdf', title: 'Bahamas Import Permit', subtitle: 'Temporary Cruising Permit' },
  { file: 'safety_manual.pdf', title: 'Safety Manual', subtitle: 'Purely Blu — Emergency Procedures' },
];

const outDir = path.join(__dirname, '..', 'assets', 'documents');

async function generate() {
  fs.mkdirSync(outDir, { recursive: true });

  for (const doc of documents) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Title
    const titleSize = 24;
    const titleWidth = boldFont.widthOfTextAtSize(doc.title, titleSize);
    page.drawText(doc.title, {
      x: (612 - titleWidth) / 2,
      y: 500,
      size: titleSize,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Subtitle
    const subSize = 14;
    const subWidth = font.widthOfTextAtSize(doc.subtitle, subSize);
    page.drawText(doc.subtitle, {
      x: (612 - subWidth) / 2,
      y: 465,
      size: subSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Footer
    const footer = 'SAMPLE DOCUMENT — Vessel & Co. Yacht Management';
    const footerSize = 10;
    const footerWidth = font.widthOfTextAtSize(footer, footerSize);
    page.drawText(footer, {
      x: (612 - footerWidth) / 2,
      y: 50,
      size: footerSize,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });

    const bytes = await pdf.save();
    fs.writeFileSync(path.join(outDir, doc.file), bytes);
    console.log(`Created ${doc.file}`);
  }
}

generate().catch(console.error);
