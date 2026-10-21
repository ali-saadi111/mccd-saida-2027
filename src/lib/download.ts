import type { Event, Venue } from './data/types';
import { localised } from './data/types';
export function downloadFile(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const escapeICS = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;');
function foldLine(line: string) {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 74) {
      lines.push(current);
      current = ' ';
      bytes = 1;
    }
    current += char;
    bytes += size;
  }
  lines.push(current);
  return lines.join('\r\n');
}
export function createICS(event: Event, venue: Venue, locale: string) {
  const stamp = (v: string) =>
    new Date(v)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MCCD Saida 2027//Programme Preview//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + event.id + '@saida2027.example',
      'DTSTAMP:' + stamp(new Date().toISOString()),
      'DTSTART:' + stamp(event.starts_at),
      'DTEND:' + stamp(event.ends_at),
      'SUMMARY:' + escapeICS(localised(event, 'title', locale)),
      'DESCRIPTION:' + escapeICS(localised(event, 'description', locale)),
      'LOCATION:' + escapeICS(localised(venue, 'name', locale)),
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .map(foldLine)
      .join('\r\n') + '\r\n'
  );
}
/** Quote every CSV cell and neutralise spreadsheet formula injection. */
export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return '\uFEFF';
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const cell = (v: unknown) => {
    let s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return (
    '\uFEFF' +
    [
      keys.map(cell).join(','),
      ...rows.map((row) => keys.map((k) => cell(row[k])).join(',')),
    ].join('\r\n')
  );
}
