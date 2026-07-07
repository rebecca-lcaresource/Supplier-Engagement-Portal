export default function Resources() {
  return (
    <>
      <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
        Resources
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <ResourceCard title="Supplier Code of Conduct" desc="Our expectations for suppliers across ethics, labour, and environmental practice.">
          <a href="/assets/The_Corporate_Supplier_Code_of_Conduct_2026.PDF" download>Download PDF</a>
        </ResourceCard>
        <ResourceCard title="Global Environmental Policy" desc="The Corporate's environmental commitments and operating standards.">
          <a href="/assets/The_Corporate_Global_Environmental_Policy.PDF" download>Download PDF</a>
        </ResourceCard>
        <ResourceCard title="EHS help desk" desc="Questions about the programme, the questionnaire, or your submission.">
          <a href="mailto:support@thecorporate.com">Email support@thecorporate.com</a>
        </ResourceCard>
      </div>
    </>
  );
}

function ResourceCard({ title, desc, children }) {
  return (
    <div className="bg-white border-[0.5px] border-[rgba(182,176,159,0.35)] p-lg">
      <h3 className="font-body text-lg font-medium tracking-[0.08em] uppercase mb-sm">{title}</h3>
      <p>{desc}</p>
      <div className="mt-sm text-[13px]">{children}</div>
    </div>
  );
}
