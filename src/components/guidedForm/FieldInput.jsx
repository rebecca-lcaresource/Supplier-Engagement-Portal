export default function FieldInput({ field, value, error, onChange }) {
  const inputId = `field-${field.id}`;

  if (field.type === 'checkbox') {
    return (
      <div className="mb-lg">
        <label htmlFor={inputId} className="flex items-start gap-sm cursor-pointer">
          <input
            id={inputId}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1"
          />
          <span>{field.label}</span>
        </label>
        {error && <p className="text-[13px] mt-xs" style={{ color: '#C0392B' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-lg">
      <label htmlFor={inputId} className="block mb-xs">
        <span className="flex items-center gap-sm flex-wrap">
          <span className="font-body text-sm text-ink">{field.label}</span>
          {field.esrsRef && (
            <span className="font-body text-[11px] tracking-[0.12em] uppercase text-stone whitespace-nowrap">
              ESRS {field.esrsRef}
            </span>
          )}
        </span>
      </label>

      {field.type === 'textarea' && (
        <textarea
          id={inputId}
          className={`tc-input ${error ? 'has-error' : ''}`}
          rows={4}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'text' && (
        <input
          id={inputId}
          type="text"
          className={`tc-input ${error ? 'has-error' : ''}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'select' && (
        <select
          id={inputId}
          className={`tc-input ${error ? 'has-error' : ''}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>Select…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {error && <p className="text-[13px] mt-xs" style={{ color: '#C0392B' }}>{error}</p>}
    </div>
  );
}
