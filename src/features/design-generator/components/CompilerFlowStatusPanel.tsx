import type { CompilerFlowStatusViewModel } from "../compilerFlowStatus";

type CompilerFlowStatusPanelProps = {
  status: CompilerFlowStatusViewModel;
};

export function CompilerFlowStatusPanel({
  status
}: CompilerFlowStatusPanelProps) {
  const allItems = status.sections.flatMap((section) => section.items);
  const blockedCount = allItems.filter((item) => item.status === "blocked")
    .length;
  const readyCount = allItems.length - blockedCount;

  return (
    <section
      aria-label="Internal compiler-flow status"
      className="compiler-flow-status"
    >
      <div className="compiler-flow-status__header">
        <div>
          <p>Internal</p>
          <h2>{status.title}</h2>
        </div>
        <span
          className={`compiler-flow-status__summary-badge ${
            blockedCount > 0
              ? "compiler-flow-status__summary-badge--blocked"
              : "compiler-flow-status__summary-badge--ready"
          }`}
        >
          {readyCount}/{allItems.length}
        </span>
      </div>
      <p className="compiler-flow-status__summary">{status.summary}</p>
      <ul className="compiler-flow-status__constraints">
        {status.constraints.map((constraint) => (
          <li key={constraint}>{constraint}</li>
        ))}
      </ul>
      <div className="compiler-flow-status__sections">
        {status.sections.map((section) => (
          <div className="compiler-flow-status__section" key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => (
                <li className="compiler-flow-status__item" key={item.id}>
                  <div className="compiler-flow-status__item-heading">
                    <span>{item.label}</span>
                    <span
                      className={`compiler-flow-status__badge compiler-flow-status__badge--${item.status}`}
                    >
                      {item.status === "ready" ? "Ready" : "Blocked"}
                    </span>
                  </div>
                  <p>{item.detail}</p>
                  {item.messages.length > 0 ? (
                    <ul className="compiler-flow-status__messages">
                      {item.messages.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
