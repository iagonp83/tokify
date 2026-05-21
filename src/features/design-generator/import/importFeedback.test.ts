import { describe, expect, it } from "vitest";
import {
  createImportErrorFeedback,
  createImportReadErrorFeedback
} from "./importFeedback";

describe("import feedback", () => {
  it("shows a retryable JSON parsing message without parser details", () => {
    const message = createImportErrorFeedback(
      new SyntaxError("Unexpected token } in JSON at position 12")
    );

    expect(message).toBe(
      "No se pudo importar el JSON. Revisa que el archivo sea un JSON valido y vuelve a intentarlo."
    );
    expect(message).not.toContain("position");
  });

  it("shows a retryable token import message without internal token paths", () => {
    const message = createImportErrorFeedback(
      new Error("Token global.layout.density invalido.")
    );

    expect(message).toBe(
      "No se pudo importar el JSON. Revisa que los tokens del archivo sean validos y vuelve a intentarlo."
    );
    expect(message).not.toContain("global.layout");
  });

  it("shows a retryable file read message", () => {
    expect(createImportReadErrorFeedback()).toBe(
      "No se pudo leer el archivo JSON. Selecciona el archivo de nuevo para intentarlo otra vez."
    );
  });
});
