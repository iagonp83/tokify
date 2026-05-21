export function createImportErrorFeedback(error: unknown) {
  if (error instanceof SyntaxError) {
    return "No se pudo importar el JSON. Revisa que el archivo sea un JSON valido y vuelve a intentarlo.";
  }

  return "No se pudo importar el JSON. Revisa que los tokens del archivo sean validos y vuelve a intentarlo.";
}

export function createImportReadErrorFeedback() {
  return "No se pudo leer el archivo JSON. Selecciona el archivo de nuevo para intentarlo otra vez.";
}
