/* ==========================================================================
   OmniTools - JSON Formatter
   Valida, formatta e minifica un payload JSON, con un messaggio d'errore
   comprensibile e l'indicazione della riga in cui il JSON e' sbagliato.

   Nota CS50x: questo file e' stato generato con l'aiuto di un assistente AI
   (OpenCode / Claude).
   ========================================================================== */
(function () {
  "use strict";

  const input = document.getElementById("json-input");
  if (!input) return;

  const output = document.getElementById("json-output");
  const indentSelect = document.getElementById("json-indent");
  const status = document.getElementById("json-status");
  const errorBox = document.getElementById("json-error");
  const errorMessage = document.getElementById("json-error-message");

  function currentIndent() {
    const value = indentSelect.value;
    return value === "tab" ? "\t" : parseInt(value, 10);
  }

  /**
   * Trasforma l'errore di JSON.parse in un messaggio leggibile.
   *
   * JSON.parse lancia un SyntaxError con un messaggio tecnico, per esempio:
   *   Expected ',' or '}' after property value in JSON at position 42
   *   (line 3 column 5)
   * Da li' si ricavano la descrizione del problema e la posizione.
   */
  function describeError(error) {
    const raw = (error && error.message) || "The JSON could not be parsed.";
    const lineColumn = raw.match(/line (\d+) column (\d+)/);
    const position = raw.match(/position (\d+)/);

    // Si toglie la parte tecnica per lasciare solo la descrizione.
    const summary = raw
      .replace(/\s*in JSON at position \d+(\s*\(line \d+ column \d+\))?/i, "")
      .replace(/\s*\(\d+:\d+\)\s*$/, "")
      .trim();

    let where = "";
    if (lineColumn) {
      where = "line " + lineColumn[1] + ", column " + lineColumn[2];
    } else if (position) {
      where = "position " + position[1];
    }

    return {
      summary: summary,
      where: where,
      position: position ? parseInt(position[1], 10) : null
    };
  }

  /* Evidenzia il punto del testo in cui si e' verificato l'errore. */
  function highlightPosition(position) {
    if (typeof position !== "number") return;
    input.focus();
    const end = Math.min(position + 1, input.value.length);
    input.setSelectionRange(position, end);
  }

  /**
   * Tenta di leggere il JSON.
   * @returns {{ok: boolean, value?: any, error?: object}}
   */
  function parseInput() {
    if (!input.value.trim()) {
      return { ok: false, empty: true };
    }
    try {
      return { ok: true, value: JSON.parse(input.value) };
    } catch (error) {
      return { ok: false, error: describeError(error) };
    }
  }

  function showFailure(result) {
    if (result.empty) {
      Omni.showError(errorBox, errorMessage, "");
      Omni.setStatus(status, "Paste a JSON payload first.", "error");
      return;
    }
    const message = result.error.where
      ? result.error.summary + " (" + result.error.where + ")"
      : result.error.summary;
    Omni.showError(errorBox, errorMessage, message);
    Omni.setStatus(status, "The JSON is not valid.", "error");
    highlightPosition(result.error.position);
  }

  /* ------------------------------- AZIONI ------------------------------- */

  function format() {
    const result = parseInput();
    if (!result.ok) {
      output.value = "";
      showFailure(result);
      return;
    }
    output.value = JSON.stringify(result.value, null, currentIndent());
    Omni.showError(errorBox, errorMessage, "");
    Omni.setStatus(status, "JSON formatted.", "success");
  }

  function minify() {
    const result = parseInput();
    if (!result.ok) {
      output.value = "";
      showFailure(result);
      return;
    }
    // Senza il secondo parametro JSON.stringify produce una sola riga.
    output.value = JSON.stringify(result.value);
    Omni.showError(errorBox, errorMessage, "");
    Omni.setStatus(status, "JSON minified on a single line.", "success");
  }

  function validate() {
    const result = parseInput();
    if (!result.ok) {
      showFailure(result);
      return;
    }
    Omni.showError(errorBox, errorMessage, "");
    Omni.setStatus(status, "The JSON is valid.", "success");
  }

  async function copyOutput() {
    if (!output.value) {
      Omni.setStatus(status, "There is no output to copy yet.", "error");
      return;
    }
    const copied = await Omni.copyToClipboard(output.value);
    if (copied) {
      Omni.setStatus(status, "Output copied to the clipboard.", "success");
    } else {
      Omni.setStatus(status, "The browser blocked the copy. Select the output and copy it manually.", "error");
    }
  }

  function clearAll() {
    input.value = "";
    output.value = "";
    Omni.showError(errorBox, errorMessage, "");
    Omni.setStatus(status, "Cleared.");
    input.focus();
  }

  /* ------------------------------- EVENTI ------------------------------- */

  document.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      const action = button.getAttribute("data-action");

      if (action === "format") {
        format();
      } else if (action === "minify") {
        minify();
      } else if (action === "validate") {
        validate();
      } else if (action === "copy") {
        copyOutput();
      } else if (action === "clear") {
        clearAll();
      }
    });
  });

  // Cambiando il rientro si riformatta subito l'output gia' presente.
  indentSelect.addEventListener("change", function () {
    if (output.value) format();
  });
})();
