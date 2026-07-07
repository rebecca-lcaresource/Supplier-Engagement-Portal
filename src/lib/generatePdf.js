import { SECTIONS, fieldsForSection, DECLARATION_FIELDS } from '../data/questionnaireFields.js';

// jsPDF ships only PDF-standard fonts (no custom TTF embedding in this build —
// see PROGRESS.md Known issues). 'times' approximates the brand's Playfair
// Display serif for headings; 'helvetica' approximates DM Sans for body text.
const INK = [0, 0, 0];
const STONE = [182, 176, 159];
const CHALK = [242, 242, 242];

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function doorLabel(door) {
  return door === 'door1' ? 'In-tool guided form' : 'Download & upload';
}

function formatDate() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateSubmissionPdf({ answers, door }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 0;

  function newPage() {
    doc.addPage();
    y = MARGIN;
  }

  function ensureSpace(neededHeight) {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN - 10) {
      newPage();
    }
  }

  function drawFootersOnAllPages() {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...STONE);
      doc.text(`Submitted ${formatDate()} — ${doorLabel(door)}`, MARGIN, PAGE_HEIGHT - 10);
      doc.text(`${i} / ${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: 'right' });
    }
  }

  // --- Header band ---
  doc.setFillColor(...INK);
  doc.rect(0, 0, PAGE_WIDTH, 30, 'F');
  doc.setFillColor(...CHALK);
  doc.rect(MARGIN, 9, 10, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('C', MARGIN + 5, 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...CHALK);
  doc.text('THE CORPORATE', MARGIN + 16, 15.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...CHALK);
  doc.text('Supplier Questionnaire Submission', MARGIN, 25);

  y = 40;

  const supplierName = answers.s1_q1;
  if (supplierName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...STONE);
    doc.text(`Submitted by: ${supplierName}`, MARGIN, y);
    y += 10;
  }

  SECTIONS.forEach((section) => {
    ensureSpace(20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...STONE);
    doc.text(`${section.id} — ${section.esrsHeader}`, MARGIN, y);
    y += 6;

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(section.title, MARGIN, y);
    y += 4;
    doc.setDrawColor(...STONE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 8;

    const fieldList = section.id === 'S7'
      ? [...fieldsForSection(section.id), ...DECLARATION_FIELDS]
      : fieldsForSection(section.id);

    fieldList.forEach((field) => {
      const questionLines = doc.splitTextToSize(field.label, CONTENT_WIDTH);
      const rawAnswer = field.type === 'checkbox'
        ? (answers[field.id] ? 'Confirmed' : 'Not confirmed')
        : (answers[field.id] || 'Not answered');
      const answerLines = doc.splitTextToSize(String(rawAnswer), CONTENT_WIDTH);

      const blockHeight = questionLines.length * 4.5 + answerLines.length * 5 + 8;
      ensureSpace(blockHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...STONE);
      doc.text(questionLines, MARGIN, y);
      y += questionLines.length * 4.5 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(answerLines, MARGIN, y);
      y += answerLines.length * 5 + 6;
    });

    y += 4;
  });

  drawFootersOnAllPages();
  doc.save('The-Corporate-Supplier-Submission.pdf');
}
