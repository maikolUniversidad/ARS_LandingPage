// Shim de navegador para `fetch-blob` (dep transitiva de node-fetch vía inferencejs).
// En el browser `Blob`/`File` son nativos. Ver next.config.ts → turbopack.resolveAlias.

export default globalThis.Blob;
export const Blob = globalThis.Blob;
export const File = globalThis.File;
export const fileFromSync = () => new File([], "");
export const fileFrom = async () => new File([], "");
export const blobFromSync = () => new Blob();
export const blobFrom = async () => new Blob();
