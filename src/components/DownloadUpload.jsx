import { useState, useRef } from 'react';
import Header from './landing/Header.jsx';
import { parseUploadedQuestionnaire } from '../lib/parseUpload.js';

export default function DownloadUpload({ onBack, onParsed }) {
  const [status, setStatus] = useState('idle'); // idle | parsing | error
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('parsing');
    setError(null);

    const result = await parseUploadedQuestionnaire(file);

    if (!result.success) {
      setStatus('error');
      setError(result.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    onParsed(result.answers);
  }

  return (
    <div className="min-h-screen">
      <header className="py-lg">
        <div className="max-w-page mx-auto px-md md:px-2xl flex items-center justify-between">
          <Header />
          <button type="button" onClick={onBack} className="text-[13px] tracking-[0.08em] uppercase underline">
            Back
          </button>
        </div>
      </header>

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
          <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
            Door 2
          </p>
          <h1 className="font-display text-2xl md:text-[32px] font-normal mb-xl">
            Download and complete offline
          </h1>

          <div className="bg-white border-[0.5px] border-stone p-lg mb-lg">
            <h2 className="font-body text-lg font-medium tracking-[0.08em] uppercase mb-sm">
              1. Download the template
            </h2>
            <p className="mb-lg">
              Complete it individually or with colleagues, in Excel or any spreadsheet tool that
              supports .xlsx.
            </p>
            <a
              href="/assets/The_Corporate_Supplier_Questionnaire_2026.xlsx"
              download
              className="tc-btn-primary"
            >
              Download Template
            </a>
          </div>

          <div className="bg-white border-[0.5px] border-stone p-lg">
            <h2 className="font-body text-lg font-medium tracking-[0.08em] uppercase mb-sm">
              2. Upload your completed file
            </h2>
            <p className="mb-lg">
              Accepts .xlsx or a .csv export of the same file. We'll show you what we read before
              anything is submitted.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              disabled={status === 'parsing'}
              className="tc-input"
            />

            {status === 'parsing' && (
              <p className="text-[13px] mt-sm text-stone">Reading your file…</p>
            )}

            {status === 'error' && (
              <p className="text-[13px] mt-sm" style={{ color: '#C0392B' }}>{error}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
