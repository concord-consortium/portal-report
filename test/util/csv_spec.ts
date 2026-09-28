import { csvCell, csvFromRows, htmlToText, formatCsvDate, formatCsvDateTime, safeFileNamePart } from "../../js/util/csv";

// A minimal RFC 4180 parser, enough to check that csvFromRows output reads back as written.
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" && text[i + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
    } else {
      cell += ch;
    }
  }
  return rows;
};

describe("csv helpers", () => {
  describe("csvCell", () => {
    it("passes plain text through", () => {
      expect(csvCell("plain text")).toBe("plain text");
      expect(csvCell("Café ✓")).toBe("Café ✓");
    });

    it("quotes commas, quotes and line breaks, doubling quotes", () => {
      expect(csvCell("a, b")).toBe('"a, b"');
      expect(csvCell('say "hi"')).toBe('"say ""hi"""');
      expect(csvCell("line 1\nline 2")).toBe('"line 1\nline 2"');
      expect(csvCell("line 1\r\nline 2")).toBe('"line 1\r\nline 2"');
    });

    it("prefixes text a spreadsheet would run as a formula", () => {
      expect(csvCell("=SUM(A1)")).toBe("'=SUM(A1)");
      expect(csvCell("+1")).toBe("'+1");
      expect(csvCell("-5")).toBe("'-5");
      expect(csvCell("@x")).toBe("'@x");
      expect(csvCell("\tx")).toBe("'\tx");
      expect(csvCell("\rx")).toBe("\"'\rx\"");
    });

    it("both prefixes and quotes a formula that needs quotes", () => {
      expect(csvCell('=HYPERLINK("x", "y")')).toBe('"\'=HYPERLINK(""x"", ""y"")"');
    });

    it("makes null and undefined empty", () => {
      expect(csvCell(null)).toBe("");
      expect(csvCell(undefined)).toBe("");
    });

    it("stringifies numbers", () => {
      expect(csvCell(0)).toBe("0");
      expect(csvCell(33.3)).toBe("33.3");
    });
  });

  describe("csvFromRows", () => {
    it("starts with a byte order mark and ends every row with CRLF", () => {
      const csv = csvFromRows([["a", "b"], ["c", "d"]]);
      expect(csv).toBe("﻿a,b\r\nc,d\r\n");
    });

    it("round-trips every special case", () => {
      const row = ["plain", "a, b", 'say "hi"', "line 1\nline 2", "=1+1", "Café ✓", 42, null, ""];
      const csv = csvFromRows([["header"], row]);
      const parsed = parseCsv(csv.slice(1));
      expect(parsed).toEqual([
        ["header"],
        ["plain", "a, b", 'say "hi"', "line 1\nline 2", "'=1+1", "Café ✓", "42", "", ""]
      ]);
    });
  });

  describe("htmlToText", () => {
    it("removes tags, decodes entities and collapses whitespace", () => {
      expect(htmlToText("<p>Hot&nbsp;&amp; dry</p><p>next</p>")).toBe("Hot & dry next");
    });

    it("keeps a less-than sign that isn't a tag", () => {
      expect(htmlToText("I <3 science, 2<5 and 1 < 2")).toBe("I <3 science, 2<5 and 1 < 2");
      expect(htmlToText("<p>1 &lt; 2</p>")).toBe("1 < 2");
    });

    it("gives an empty string for empty input", () => {
      expect(htmlToText("")).toBe("");
      expect(htmlToText(null)).toBe("");
      expect(htmlToText(undefined)).toBe("");
    });

    it("returns a script's text as text without running it", () => {
      (window as any).csvSpecScriptRan = false;
      expect(htmlToText("<script>window.csvSpecScriptRan = true;</script>ok")).toBe("window.csvSpecScriptRan = true; ok");
      expect(htmlToText("&lt;script&gt;window.csvSpecScriptRan = true;&lt;/script&gt;")).toBe("<script>window.csvSpecScriptRan = true;</script>");
      expect((window as any).csvSpecScriptRan).toBe(false);
    });
  });

  describe("formatCsvDate", () => {
    it("formats a date in local time with zero padding", () => {
      expect(formatCsvDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    });
  });

  describe("formatCsvDateTime", () => {
    it("formats a UTC timestamp in local time without seconds", () => {
      // Built from local time, so the expected value holds in any time zone.
      const utcValue = new Date(2025, 4, 10, 6, 3, 45).toISOString();
      expect(utcValue).toMatch(/Z$/);
      expect(formatCsvDateTime(utcValue)).toBe("2025-05-10 06:03");
    });

    it("gives an empty string for a missing or invalid date", () => {
      expect(formatCsvDateTime(null)).toBe("");
      expect(formatCsvDateTime(undefined)).toBe("");
      expect(formatCsvDateTime("")).toBe("");
      expect(formatCsvDateTime("not a date")).toBe("");
    });
  });

  describe("safeFileNamePart", () => {
    it("replaces characters Windows and macOS don't allow", () => {
      expect(safeFileNamePart("a/b:c*?")).toBe("a_b_c__");
      expect(safeFileNamePart('x\\y"z<w>|v')).toBe("x_y_z_w__v");
    });

    it("replaces control characters and collapses whitespace", () => {
      expect(safeFileNamePart(" Period\u00013   Science\n")).toBe("Period_3 Science_");
    });
  });
});
