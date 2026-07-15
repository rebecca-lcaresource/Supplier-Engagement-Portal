import { FIELDS, EMAIL_RE } from '../data/questionnaireFields.js';

// Anchor cells that must match the unchanged template exactly. Used to
// hard-fail on any structural mismatch rather than guess or partially map.
// [row, col, expectedValue] — 0-indexed row/col, matching sheet_to_json's
// header:1 array-of-arrays output.
const ANCHORS = [
  [2, 0, 'SECTION'],
  [2, 3, 'QUESTION / METRIC'],
  [2, 4, 'SUPPLIER RESPONSE'],
  [4, 3, 'General Information & EcoVadis Bypass'],
  [9, 3, 'Climate & Decarbonisation'],
  [16, 3, 'Pollution & PFAS'],
  [21, 3, 'Water & Marine Resources'],
  [26, 3, 'Circular Economy & Waste'],
  [31, 3, 'Biodiversity & Ecosystems'],
  [35, 3, 'Social, Labour & Governance'],
];

const MISMATCH_ERROR =
  "This doesn't match The Corporate's questionnaire template. Please re-upload the unmodified file.";

function readFileAsWorkbook(XLSX, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    reader.onerror = () => reject(new Error('Could not read the file.'));

    reader.onload = () => {
      try {
        if (isCsv) {
          const wb = XLSX.read(reader.result, { type: 'string' });
          resolve(wb);
        } else {
          const wb = XLSX.read(reader.result, { type: 'array' });
          resolve(wb);
        }
      } catch {
        reject(new Error('Could not parse the file.'));
      }
    };

    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

export async function parseUploadedQuestionnaire(file) {
  const validExtension = /\.(xlsx|csv)$/i.test(file.name);
  if (!validExtension) {
    return { success: false, error: 'Please upload a .xlsx or .csv file.' };
  }

  const XLSX = await import('xlsx');

  let workbook;
  try {
    workbook = await readFileAsWorkbook(XLSX, file);
  } catch {
    return { success: false, error: MISMATCH_ERROR };
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { success: false, error: MISMATCH_ERROR };
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

  for (const [rowIndex, colIndex, expected] of ANCHORS) {
    const cell = rows[rowIndex]?.[colIndex];
    if (String(cell ?? '').trim() !== expected) {
      return { success: false, error: MISMATCH_ERROR };
    }
  }

  const answers = {};
  FIELDS.forEach((field) => {
    // S1 identity fields (company/country/contact) have no sheetRow — they are
    // collected on the Upload Review screen, not parsed from the workbook.
    if (field.sheetRow == null) return;
    const rowArray = rows[field.sheetRow - 1]; // sheetRow is 1-indexed Excel row
    const rawValue = rowArray?.[4]; // column E = "SUPPLIER RESPONSE"
    const value = String(rawValue ?? '').trim();
    if (value) {
      answers[field.id] = value;
    }
  });

  // Best-effort pre-fill for the on-screen contact fields, from the workbook's
  // original free-text S1 cells (row 6 = legal name + country, row 7 = contact
  // name/title/email). The supplier confirms/edits these on the Review screen.
  const legalCell = String(rows[5]?.[4] ?? '').trim(); // Excel row 6, col E
  const contactCell = String(rows[6]?.[4] ?? '').trim(); // Excel row 7, col E
  const emailMatch = contactCell.match(EMAIL_RE) || contactCell.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const contactHints = {
    company_name: legalCell,
    country: '',
    contact_name: contactCell,
    contact_email: emailMatch ? emailMatch[0] : '',
  };

  return { success: true, answers, contactHints };
}
