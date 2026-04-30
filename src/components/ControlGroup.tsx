import type { ReactNode } from "react";

type ControlGroupProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function ControlGroup({ children, description, title }: ControlGroupProps) {
  return (
    <section className="control-group" aria-labelledby={`${title}-title`}>
      <div className="control-group__heading">
        <h2 id={`${title}-title`}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="control-group__body">{children}</div>
    </section>
  );
}
