import type { Propuesta } from "@/data/propuesta/tipos";
import type { FuenteImagen, ImagenesPdf, Pedido } from "./imagenes";

export type ExtrasPdf = {
  /** Vistas de la experiencia 3D (dataURL PNG o JPEG). Máximo 3. */
  capturas3d?: string[];
};

/**
 * Genera el PDF de la propuesta en el navegador y lo descarga como
 * `Propuesta-ARS-{empresa}.pdf`. react-pdf, el documento y los catálogos se
 * cargan con import() dinámico: nada pesa hasta que la persona pide el PDF.
 * Las imágenes se bajan del propio sitio y se reducen con canvas.
 */
export async function descargarPropuestaPdf(propuesta: Propuesta, extras?: ExtrasPdf): Promise<void> {
  const [{ generarBlobPropuesta }, { fuentesDesdeOrigen, nombreArchivo }, { pedidosImagenes }] = await Promise.all([
    import("./DocumentoPropuesta"),
    import("./estilos"),
    import("./imagenes"),
  ]);
  const origen = window.location.origin;
  const [imagenes, capturas3d] = await Promise.all([
    cargarImagenes(pedidosImagenes(propuesta), origen),
    Promise.all((extras?.capturas3d ?? []).slice(0, 3).map((d) => reducir(d, 1600, "jpg").catch(() => null))),
  ]);
  const blob = await generarBlobPropuesta({
    propuesta,
    recursos: { fuente: fuentesDesdeOrigen(origen), imagenes },
    capturas3d: capturas3d.filter((x): x is string => x !== null),
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo(propuesta.empresa);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function cargarImagenes(pedidos: Pedido[], origen: string): Promise<ImagenesPdf> {
  const pares = await Promise.all(
    pedidos.map(async (p): Promise<[string, FuenteImagen | null]> => {
      for (const ruta of p.rutas) {
        try {
          const res = await fetch(new URL(ruta, origen));
          if (!res.ok) continue;
          const tipo = res.headers.get("content-type") ?? "";
          if (!tipo.startsWith("image/")) continue;
          return [p.clave, await reducir(await res.blob(), p.ancho, p.formato)];
        } catch {
          // probamos el siguiente candidato
        }
      }
      return [p.clave, null];
    }),
  );
  const out: ImagenesPdf = {};
  for (const [clave, img] of pares) if (img) out[clave] = img;
  return out;
}

/** Reduce una imagen (Blob o dataURL) a `ancho` máximo y la devuelve como dataURL. */
async function reducir(origen: Blob | string, ancho: number, formato: "png" | "jpg"): Promise<string> {
  const blob = typeof origen === "string" ? await (await fetch(origen)).blob() : origen;
  const bmp = await createImageBitmap(blob);
  try {
    const escala = Math.min(1, ancho / bmp.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * escala));
    canvas.height = Math.max(1, Math.round(bmp.height * escala));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D no disponible");
    if (formato === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return formato === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    bmp.close();
  }
}
