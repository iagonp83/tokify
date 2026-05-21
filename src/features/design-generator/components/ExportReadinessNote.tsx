const excludedExportPayloads = [
  "Generated component code and adapters are not included.",
  "runtimePlan, emitted runtime variables, graph diagnostics, and composition graph data are not included.",
  "Warnings, aggregate diagnostics, strict mode, and structured public diagnostics are not active here."
];

export function ExportReadinessNote() {
  return (
    <section aria-label="Export readiness" className="export-readiness-note">
      <h2>Token exports only</h2>
      <p>CSS and JSON exports include the current token payloads only.</p>
      <ul>
        {excludedExportPayloads.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  );
}
