const exportReadinessBoundary =
  "Export excludes component code generation, adapters, runtimePlan, emitted runtime variables, graph diagnostics, and composition graph data. Warnings, aggregate diagnostics, strict mode, and structured public diagnostics remain inactive.";

export function ExportReadinessNote() {
  return (
    <section aria-label="Export readiness" className="export-readiness-note">
      <h2>Export readiness</h2>
      <p>CSS and JSON exports are token-only.</p>
      <p className="export-readiness-note__boundary">
        {exportReadinessBoundary}
      </p>
    </section>
  );
}
