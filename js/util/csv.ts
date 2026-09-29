import striptags from "striptags";

const BYTE_ORDER_MARK = "﻿";
const FORMULA_START = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;
// A "<" that can't start a tag, comment or doctype, which striptags would otherwise treat as one.
const BARE_LESS_THAN = /<(?![a-zA-Z/!?])/g;

export type CsvValue = string | number | null | undefined;

// Formats one CSV cell. Text a spreadsheet would treat as a formula is prefixed with a
// single quote (OWASP CSV injection guidance), then the cell is quoted if needed.
export const csvCell = (value: CsvValue): string => {
  let text = value == null ? "" : String(value);
  if (FORMULA_START.test(text)) {
    text = "'" + text;
  }
  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Joins rows into a CSV file. The byte order mark makes Excel read the file as UTF-8.
export const csvFromRows = (rows: CsvValue[][]): string =>
  BYTE_ORDER_MARK + rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";

// Converts authored or student HTML to plain text: tags removed, entities decoded,
// whitespace (including &nbsp;) collapsed.
export const htmlToText = (html: string | null | undefined): string => {
  if (!html) {
    return "";
  }
  const stripped = striptags(html.replace(BARE_LESS_THAN, "&lt;"), [], " ");
  const doc = new DOMParser().parseFromString(stripped, "text/html");
  return (doc.documentElement.textContent || "").replace(/\s+/g, " ").trim();
};

const pad = (n: number) => n.toString().padStart(2, "0");

// YYYY-MM-DD in the browser's local time zone.
export const formatCsvDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// YYYY-MM-DD HH:MM in the browser's local time zone, or "" for a missing or invalid date.
export const formatCsvDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return "";
  }
  return `${formatCsvDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Replaces characters that Windows or macOS don't allow in file names. Control characters are
// checked by code point, since the repo's ESLint config rejects them in a regex (no-control-regex).
export const safeFileNamePart = (name: string): string =>
  Array.from(name)
    .map(ch => ch.charCodeAt(0) < 32 || '\\/:*?"<>|'.includes(ch) ? "_" : ch)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
