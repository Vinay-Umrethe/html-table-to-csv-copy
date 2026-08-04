/**
 * @license
 * SPDX-License-Identifier: MIT
 * Copyright (C) 2026 Vinay Umrethe <umrethevinay@gmail.com>.
 */

(() => {
  /**
   * Escapes a cell's string value for RFC 4180 CSV compliance.
   * Encloses in quotes if it contains commas, newlines, or quotes.
   */
  function escapeCSVCell(text) {
    // Preserve newlines, but collapse horizontal spaces (spaces and tabs)
    const cleanText = text.replace(/[ \t]+/g, " ").trim();

    if (/[",\n\r]/.test(cleanText)) {
      return `"${cleanText.replace(/"/g, '""')}"`;
    }
    return cleanText;
  }

  /**
   * Extracts text from a cell while converting KaTeX math back to LaTeX.
   */
  function extractCellText(cell) {
    const clone = cell.cloneNode(true);

    // Replace all KaTeX rendered math with LaTeX.
    const katexElements = clone.querySelectorAll(".katex");
    for (const el of katexElements) {
      const texAnnotation = el.querySelector(
        "annotation[encoding='application/x-tex']",
      );
      if (texAnnotation) {
        el.replaceWith(
          document.createTextNode(`$${texAnnotation.textContent}$`),
        );
      }
    }

    /**
     * Hidden screen-reader elements that might cause duplicate text.
     * Removed to prevent duplicate text.
     * Kept in math blocks as a fallback if LaTeX extraction fails.
     */
    const hiddenElements = clone.querySelectorAll(
      ".sr-only, [aria-hidden='true']",
    );
    for (const el of hiddenElements) {
      if (!el.closest(".katex")) {
        el.remove();
      }
    }

    // Convert <br> tags to newlines.
    const brElements = clone.querySelectorAll("br");
    for (const br of brElements) {
      br.replaceWith(document.createTextNode("\n"));
    }

    // Convert <li> items to bullet-points.
    const liElements = Array.from(clone.querySelectorAll("li")).reverse();
    for (const li of liElements) {
      const isOrdered = li.parentElement?.tagName === "OL";
      const bullet = isOrdered ? "1. " : "- ";
      li.replaceWith(document.createTextNode(`\n${bullet}${li.textContent.trim()}`));
    }

    return clone.textContent.trim();
  }

  /**
   * Converts a table DOM node into a CSV string.
   */
  function tableToCSV(tableElement) {
    const rows = Array.from(tableElement.querySelectorAll("tr"));

    return rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        return cells
          .map((cell) => escapeCSVCell(extractCellText(cell)))
          .join(",");
      })
      .filter((rowString) => rowString.length > 0)
      .join("\n");
  }

  /**
   * Finds the closest parent table of a DOM node.
   * For checking whether the text selection starts or ends inside a table.
   */
  function findParentTable(node) {
    if (!node) return null;
    const element = node instanceof Element ? node : node.parentElement;
    return element ? element.closest("table") : null;
  }

  // Intercept the copy event.
  document.addEventListener("copy", (e) => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || !e.clipboardData) return;

    const range = selection.getRangeAt(0);

    // Expand selection if user started or ended copy mid-table.
    const startTable = findParentTable(range.startContainer);
    if (startTable) range.setStartBefore(startTable);

    const endTable = findParentTable(range.endContainer);
    if (endTable) range.setEndAfter(endTable);

    const container = range.cloneContents();
    const allTables = Array.from(container.querySelectorAll("table"));

    // Filter top-level tables only to prevent nested tables from being processed twice.
    const tables = allTables.filter(
      (table) => !table.parentElement?.closest("table"),
    );

    if (tables.length === 0) return;

    const csvOutputs = tables.map(tableToCSV);
    const pureCsvData = csvOutputs.filter((csv) => csv.length > 0).join("\n\n");
    if (!pureCsvData) return;

    // Preserve HTML.
    const htmlDiv = document.createElement("div");
    htmlDiv.appendChild(container.cloneNode(true));
    const htmlData = htmlDiv.innerHTML;

    // Replace tables in the container with their CSV text.
    tables.forEach((table, index) => {
      const csv = csvOutputs[index];
      if (csv) {
        const textNode = document.createTextNode(`\n${csv}\n`);
        table.replaceWith(textNode);
      } else {
        table.remove();
      }
    });

    /**
     * A container for text extraction.
     * Temporarily mounted to an off-screen div.
     * This ensures innerText preserves paragraph line breaks.
     */
    const textDiv = document.createElement("div");
    textDiv.style.position = "absolute";
    textDiv.style.left = "-9999px";
    textDiv.style.whiteSpace = "pre-wrap";
    textDiv.appendChild(container);
    document.body.appendChild(textDiv);

    // Extract plain text from textDiv.
    const plainTextData = textDiv.innerText.trim();
    document.body.removeChild(textDiv);

    // Set the clipboard data.
    e.clipboardData.setData("text/html", htmlData);
    e.clipboardData.setData("text/plain", plainTextData);
    e.clipboardData.setData("text/csv", pureCsvData);

    e.preventDefault();
  });
})();
