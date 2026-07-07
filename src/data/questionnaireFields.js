// Source of truth for the S1-S7 questionnaire structure, derived from
// public/assets/The_Corporate_Supplier_Questionnaire_2026.xlsx (single sheet,
// one row per question). Shared by the Guided Form (Door 1), the upload
// parser + Upload Review (Door 2), and the PDF export, so all three read the
// exact same field shape.
//
// The sheet's S1 EcoVadis-bypass question and its conditional scorecard-link
// field are intentionally omitted here — see PROGRESS.md "Build decisions."
// The sheet's closing declaration block is represented below as
// DECLARATION_FIELDS, appended to the end of Section 7 rather than as an S8.

export const SECTIONS = [
  { id: 'S1', title: 'General Information', esrsHeader: 'All ESRS' },
  { id: 'S2', title: 'Climate & Decarbonisation', esrsHeader: 'ESRS E1' },
  { id: 'S3', title: 'Pollution & PFAS', esrsHeader: 'ESRS E2' },
  { id: 'S4', title: 'Water & Marine Resources', esrsHeader: 'ESRS E3' },
  { id: 'S5', title: 'Circular Economy & Waste', esrsHeader: 'ESRS E5' },
  { id: 'S6', title: 'Biodiversity & Ecosystems', esrsHeader: 'ESRS E4' },
  { id: 'S7', title: 'Social, Labour & Governance', esrsHeader: 'ESRS S2 · G1' },
];

// type: 'text' | 'textarea' | 'select'
export const FIELDS = [
  // --- S1 — General Information ---
  {
    id: 's1_q1',
    section: 'S1',
    esrsRef: null,
    type: 'text',
    label: 'Legal name and registered country of the responding entity.',
    required: true,
  },
  {
    id: 's1_q2',
    section: 'S1',
    esrsRef: null,
    type: 'text',
    label: 'Primary contact name, title, and email address for this assessment.',
    required: true,
  },

  // --- S2 — Climate & Decarbonisation ---
  {
    id: 's2_q1',
    section: 'S2',
    esrsRef: 'E1-4',
    type: 'text',
    label: 'Total Scope 1 emissions for last fiscal year (metric tonnes CO2e). Include verification method.',
    required: true,
  },
  {
    id: 's2_q2',
    section: 'S2',
    esrsRef: 'E1-4',
    // The source sheet pairs this question with a "verification method" dropdown
    // in the response cell rather than a free numeric answer — mirrored as-is.
    type: 'select',
    label: 'Total Scope 2 emissions for last fiscal year — market-based (metric tonnes CO2e).',
    options: ['Verified by Third Party', 'Internally Calculated', 'Estimated', 'Not Tracked'],
    required: true,
  },
  {
    id: 's2_q3',
    section: 'S2',
    esrsRef: 'E1-4',
    type: 'text',
    label: 'Total Scope 3 emissions for last fiscal year (metric tonnes CO2e). Specify categories included.',
    required: true,
  },
  {
    id: 's2_q4',
    section: 'S2',
    esrsRef: 'E1-3',
    type: 'select',
    label: 'Does your organisation have a Science-Based Target (SBTi) validated decarbonisation target?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 's2_q5',
    section: 'S2',
    esrsRef: 'E1-2',
    type: 'textarea',
    label: 'Describe your top three decarbonisation projects currently in progress or planned for the next 24 months. Include estimated tCO2e reduction and the specific technology being utilised.',
    required: true,
  },
  {
    id: 's2_q6',
    section: 'S2',
    esrsRef: 'E1-2',
    type: 'textarea',
    label: 'What are the primary technical or financial barriers preventing you from reaching a 50% reduction in Scope 1 and 2 emissions by 2030?',
    required: true,
  },

  // --- S3 — Pollution & PFAS ---
  {
    id: 's3_q1',
    section: 'S3',
    esrsRef: 'E2-3',
    type: 'text',
    label: 'Total weight of substances of concern (REACH, SVHC list) used in production last fiscal year (kg).',
    required: true,
  },
  {
    id: 's3_q2',
    section: 'S3',
    esrsRef: 'E2-3',
    type: 'select',
    label: 'Do any of your products or production processes contain or utilise PFAS compounds ("Forever Chemicals")?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 's3_q3',
    section: 'S3',
    esrsRef: 'E2-3',
    type: 'textarea',
    label: 'If your products contain PFAS, detail your substitution roadmap. Have you identified viable non-PFAS alternatives? Provide your target date for a complete phase-out.',
    required: true,
  },
  {
    id: 's3_q4',
    section: 'S3',
    esrsRef: 'E2-2',
    type: 'textarea',
    label: 'Describe your industrial wastewater treatment process. What specific measures are in place to ensure zero leakage of hazardous chemicals into local water systems?',
    required: true,
  },

  // --- S4 — Water & Marine Resources ---
  {
    id: 's4_q1',
    section: 'S4',
    esrsRef: 'E3-1',
    type: 'text',
    label: 'Total water withdrawal last fiscal year (m3). Specify source (municipal, groundwater, surface).',
    required: true,
  },
  {
    id: 's4_q2',
    section: 'S4',
    esrsRef: 'E3-1',
    type: 'select',
    label: 'Is your primary production facility located in a high-water-stress region (WRI Aqueduct score >=3)?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 's4_q3',
    section: 'S4',
    esrsRef: 'E3-2',
    type: 'textarea',
    label: 'Provide details on any water-saving or closed-loop recycling projects implemented at your facility. How has your total water intensity (litres per unit produced) changed over the last three years?',
    required: true,
  },
  {
    id: 's4_q4',
    section: 'S4',
    esrsRef: 'E3-2',
    type: 'textarea',
    label: 'If your facility is in a high-water-stress region, what is your operational contingency plan for severe drought conditions to ensure supply continuity to The Corporate?',
    required: true,
  },

  // --- S5 — Circular Economy & Waste ---
  {
    id: 's5_q1',
    section: 'S5',
    esrsRef: 'E5-2',
    type: 'text',
    label: 'Total waste generated last fiscal year (tonnes). Breakdown: landfill / recycled / energy recovery / hazardous.',
    required: true,
  },
  {
    id: 's5_q2',
    section: 'S5',
    esrsRef: 'E5-4',
    type: 'text',
    label: 'Percentage of post-consumer recycled (PCR) content in the components supplied to The Corporate (%).',
    required: true,
  },
  {
    id: 's5_q3',
    section: 'S5',
    esrsRef: 'E5-3',
    type: 'textarea',
    label: 'How are you incorporating circularity into the specific components you supply to The Corporate? Examples: design for disassembly, modularity, or increasing PCR content.',
    required: true,
  },
  {
    id: 's5_q4',
    section: 'S5',
    esrsRef: 'E5-2',
    type: 'textarea',
    label: 'Detail your strategy for achieving Zero Waste to Landfill. What are your primary waste streams, and what innovative recycling or upcycling initiatives have you launched recently?',
    required: true,
  },

  // --- S6 — Biodiversity & Ecosystems ---
  {
    id: 's6_q1',
    section: 'S6',
    esrsRef: 'E4-2',
    type: 'select',
    label: 'Are any of your production sites located within or adjacent to (within 1 km) a protected area or biodiversity hotspot?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 's6_q2',
    section: 'S6',
    esrsRef: 'E4-3',
    type: 'textarea',
    label: 'Describe any initiatives taken to minimise the impact of your operations on local biodiversity. Include land-use management, native planting schemes, or light/noise pollution reduction.',
    required: true,
  },
  {
    id: 's6_q3',
    section: 'S6',
    esrsRef: 'E4-5',
    type: 'textarea',
    label: 'Have you undertaken a biodiversity impact assessment (TNFD or equivalent) for your primary production sites? If yes, share key findings. If no, provide your target assessment date.',
    required: true,
  },

  // --- S7 — Social, Labour & Governance ---
  {
    id: 's7_q1',
    section: 'S7',
    esrsRef: 'S2-1',
    type: 'select',
    label: 'Does your organisation have a formal Human Rights and Labour Rights Policy, aligned with the UN Guiding Principles on Business and Human Rights?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 's7_q2',
    section: 'S7',
    esrsRef: 'S2-2',
    type: 'select',
    label: 'Have you conducted a human rights due diligence assessment of your Tier 1 and Tier 2 supply chains in the last 24 months?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 's7_q3',
    section: 'S7',
    esrsRef: 'S2-4',
    type: 'textarea',
    label: 'Describe the grievance mechanism available to workers in your supply chain. How many grievances were filed and resolved in the last 12 months?',
    required: true,
  },
  {
    id: 's7_q4',
    section: 'S7',
    esrsRef: 'G1-1',
    type: 'select',
    label: 'Does your organisation have a verified conflict minerals policy (3TG — tin, tantalum, tungsten, gold) in place, including OECD Due Diligence guidance compliance?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 's7_q5',
    section: 'S7',
    esrsRef: 'G1-2',
    type: 'textarea',
    label: 'Describe your supplier code of conduct and how compliance is monitored across your own supply chain. Include details of any third-party audits conducted in the last 24 months.',
    required: true,
  },
];

export const DECLARATION_FIELDS = [
  {
    id: 'declaration_confirm',
    type: 'checkbox',
    label: 'I confirm that the information provided in this assessment is accurate and complete to the best of my knowledge.',
    required: true,
  },
  {
    id: 'declaration_signatory',
    type: 'text',
    label: 'Authorised Signatory Name',
    required: true,
  },
];

export function fieldsForSection(sectionId) {
  return FIELDS.filter((f) => f.section === sectionId);
}

export function isSectionValid(sectionId, answers) {
  return fieldsForSection(sectionId).every((f) => isFieldValid(f, answers[f.id]));
}

export function isFieldValid(field, value) {
  if (!field.required) return true;
  if (field.type === 'checkbox') return value === true;
  return typeof value === 'string' && value.trim().length > 0;
}

export function isDeclarationValid(answers) {
  return DECLARATION_FIELDS.every((f) => isFieldValid(f, answers[f.id]));
}

export function allRequiredFieldsValid(answers) {
  return FIELDS.every((f) => isFieldValid(f, answers[f.id])) && isDeclarationValid(answers);
}
