import type { DesignState } from "../types";

type TokenInspectorProps = {
  code: string;
  state: DesignState;
};

export function TokenInspector({ code, state }: TokenInspectorProps) {
  return (
    <div className="token-inspector">
      <div>
        <p>Tokens activos</p>
        <h2>{state.motion.presetId}</h2>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
