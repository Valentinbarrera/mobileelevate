/**
 * Reconstruye una grilla de texto (filas × columnas) a partir de un PDF.
 *
 * Un PDF no tiene tablas: tiene fragmentos de texto con coordenadas. Acá los
 * volvemos a armar —agrupando por altura para formar renglones, y por distancia
 * horizontal para separar celdas— hasta obtener algo con la misma forma que una
 * hoja de cálculo. Eso permite que el intérprete de antropometría sea UNO SOLO,
 * el mismo motor que ya usa la web del coach con Excel.
 *
 * Las columnas se alinean a nivel página (no por renglón), así una etiqueta que
 * está arriba de su valor queda en la misma columna que él y la búsqueda
 * "hacia abajo" funciona.
 *
 * pdf.js pesa lo suyo, así que este módulo se importa de forma dinámica y queda
 * en un chunk aparte.
 */

/** Dos fragmentos están en el mismo renglón si su base vertical difiere menos que esto. */
const LINE_TOLERANCE = 3;

/** Hueco horizontal (en unidades de PDF) a partir del cual empieza una celda nueva. */
const CELL_GAP = 6;

/** Distancia máxima entre inicios de celda para considerarlos la misma columna. */
const COLUMN_TOLERANCE = 12;

interface Fragment {
  text: string;
  x: number;
  y: number;
  width: number;
}

export interface PdfPageGrid {
  page: number;
  rows: string[][];
}

let workerConfigured = false;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    workerConfigured = true;
  }
  return pdfjs;
}

/**
 * Arma la grilla de una página a partir de los fragmentos crudos que devuelve
 * pdf.js. Exportado para poder verificar la reconstrucción sin arrancar pdf.js.
 */
export function buildPageGrid(items: unknown[]): string[][] {
  return cellsToGrid(groupIntoLines(toFragments(items)).map(lineToCells));
}

/** Fragmentos de una página, ya sin los vacíos. */
function toFragments(items: unknown[]): Fragment[] {
  const fragments: Fragment[] = [];
  for (const raw of items) {
    const item = raw as { str?: string; transform?: number[]; width?: number };
    const text = (item.str ?? "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const transform = item.transform;
    if (!transform || transform.length < 6) continue;
    fragments.push({
      text,
      x: transform[4],
      y: transform[5],
      width: item.width ?? 0,
    });
  }
  return fragments;
}

/** Agrupa por altura: de arriba hacia abajo, cada grupo es un renglón. */
function groupIntoLines(fragments: Fragment[]): Fragment[][] {
  const sorted = [...fragments].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: Fragment[][] = [];

  for (const fragment of sorted) {
    const current = lines[lines.length - 1];
    if (current && Math.abs(current[0].y - fragment.y) <= LINE_TOLERANCE) {
      current.push(fragment);
    } else {
      lines.push([fragment]);
    }
  }

  return lines.map((line) => [...line].sort((a, b) => a.x - b.x));
}

interface Cell {
  text: string;
  x: number;
}

/** Une los fragmentos pegados de un renglón; un hueco grande abre celda nueva. */
function lineToCells(line: Fragment[]): Cell[] {
  const cells: Cell[] = [];
  let currentText = "";
  let currentX = 0;
  let cursor = -Infinity;

  for (const fragment of line) {
    if (currentText && fragment.x - cursor > CELL_GAP) {
      cells.push({ text: currentText.trim(), x: currentX });
      currentText = "";
    }
    if (!currentText) currentX = fragment.x;
    currentText += (currentText ? " " : "") + fragment.text;
    cursor = fragment.x + fragment.width;
  }

  if (currentText.trim()) cells.push({ text: currentText.trim(), x: currentX });
  return cells;
}

/**
 * Columnas de la página: cada inicio de celda se redondea al eje más cercano.
 * Sin esto, "Peso" en el renglón 3 y "78,2" en el renglón 4 caerían en índices
 * distintos y la lectura vertical no encontraría nada.
 */
function buildColumnAxes(rows: Cell[][]): number[] {
  const xs = rows.flat().map((c) => c.x).sort((a, b) => a - b);
  const axes: number[] = [];
  for (const x of xs) {
    if (!axes.length || x - axes[axes.length - 1] > COLUMN_TOLERANCE) axes.push(x);
  }
  return axes;
}

function columnIndex(axes: number[], x: number): number {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < axes.length; i++) {
    const distance = Math.abs(axes[i] - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

function cellsToGrid(rows: Cell[][]): string[][] {
  const axes = buildColumnAxes(rows);
  return rows.map((cells) => {
    const row: string[] = new Array(axes.length).fill("");
    for (const cell of cells) {
      const index = columnIndex(axes, cell.x);
      // Dos celdas en la misma columna (raro): se concatenan en vez de pisarse.
      row[index] = row[index] ? `${row[index]} ${cell.text}` : cell.text;
    }
    return row;
  });
}

export interface PdfExtraction {
  pages: PdfPageGrid[];
  /** Todo el texto plano, útil para buscar la fecha o mostrar un diagnóstico. */
  text: string;
  pageCount: number;
}

/** Máximo de páginas que leemos: un informe de antropometría no pasa de esto. */
const MAX_PAGES = 20;

/**
 * Lee el PDF y devuelve una grilla por página.
 * Lanza un Error en español si el archivo no se puede abrir.
 */
export async function extractPdfGrids(file: File | ArrayBuffer): Promise<PdfExtraction> {
  const pdfjs = await loadPdfjs();
  const data = file instanceof ArrayBuffer ? file : await file.arrayBuffer();

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
  } catch {
    throw new Error("No pudimos abrir el PDF. Puede estar dañado o protegido con contraseña.");
  }

  const pages: PdfPageGrid[] = [];
  const chunks: string[] = [];
  const total = doc.numPages;
  const pageCount = Math.min(total, MAX_PAGES);

  for (let n = 1; n <= pageCount; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const rows = buildPageGrid(content.items);

    pages.push({ page: n, rows });
    chunks.push(rows.map((cells) => cells.filter(Boolean).join("  ")).join("\n"));
    page.cleanup();
  }

  await doc.destroy();

  return { pages, text: chunks.join("\n\n"), pageCount: total };
}
