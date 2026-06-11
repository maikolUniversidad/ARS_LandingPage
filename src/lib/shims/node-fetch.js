// Shim de navegador para `node-fetch`. inferencejs lo arrastra como dependencia,
// pero en el browser ya existen `fetch`, `Headers`, `Blob`, etc. nativos. Turbopack
// no puede empaquetar el node-fetch real (usa APIs de Node), así que lo aliaseamos
// aquí a los globales del navegador. Ver next.config.ts → turbopack.resolveAlias.

const f = (...args) => fetch(...args);

export default f;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
export const Blob = globalThis.Blob;
export const File = globalThis.File;
export const FormData = globalThis.FormData;
export const AbortController = globalThis.AbortController;

export class FetchError extends Error {}
export class AbortError extends Error {}

export const isRedirect = (code) => [301, 302, 303, 307, 308].includes(code);
export const blobFrom = async () => new Blob();
export const blobFromSync = () => new Blob();
export const fileFrom = async () => new File([], "");
export const fileFromSync = () => new File([], "");
