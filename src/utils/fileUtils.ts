/**
 * Utility functions for handling file names and export naming conventions
 */

/**
 * Extract clean base name from a file name, removing common extensions
 * (.docx, .doc, .txt, .tsv, .csv, .json, .xlsx) and sanitizing illegal characters.
 */
export function getBaseFileName(fileName?: string, fallback = '数字缩略语语料'): string {
  if (!fileName || !fileName.trim()) return fallback;

  let name = fileName.trim();

  // Strip extension
  name = name.replace(/\.(docx?|txt|tsv|csv|json|xlsx|md)$/i, '');

  // Strip illegal OS filename characters: \ / : * ? " < > |
  name = name.replace(/[\\/:*?"<>|]/g, '_');

  // Replace multiple underscores / spaces
  name = name.replace(/[\s_]+/g, '_');

  // Trim underscores and periods from start/end
  name = name.replace(/^[_.]+|[_.]+$/g, '').trim();

  return name || fallback;
}

/**
 * Format current timestamp for filenames: YYYYMMDD_HHmm
 */
export function getTimestampString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}`;
}

/**
 * Generate standard export filename for Word docx incorporating source file name
 */
export function generateDocxExportFileName(
  sourceName?: string,
  suffix = 'Natrans标注交付文档'
): string {
  const base = getBaseFileName(sourceName, '数字缩略语语料');
  const timestamp = getTimestampString();
  return `${base}_${suffix}_${timestamp}.docx`;
}

/**
 * Generate standard export filename for TSV spreadsheet incorporating source file name
 */
export function generateTsvExportFileName(
  sourceName?: string,
  suffix = 'Natrans翻译技巧清单'
): string {
  const base = getBaseFileName(sourceName, '数字缩略语语料');
  const timestamp = getTimestampString();
  return `${base}_${suffix}_${timestamp}.tsv`;
}

/**
 * Trigger browser file download from string content (e.g. TSV, CSV, text)
 */
export function downloadTextFile(content: string, fileName: string, mimeType = 'text/tab-separated-values;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType }); // \uFEFF BOM for Excel Chinese support
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
