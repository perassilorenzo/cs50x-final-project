/* ==========================================================================
   OmniTools - Text Toolkit
   Conteggio di caratteri, parole, frasi e righe; conversione del case;
   rimozione degli spazi superflui; copia del risultato.

   Nota CS50x: questo file e' stato generato con l'aiuto di un assistente AI
   (OpenCode / Claude).
   ========================================================================== */
(function () {
  "use strict";

  const input = document.getElementById("text-input");
  if (!input) return; // questa pagina non contiene lo strumento: esce subito.

  const status = document.getElementById("text-status");
  const stats = {
    chars: document.getElementById("stat-chars"),
    charsNoSpaces: document.getElementById("stat-chars-nospace"),
    words: document.getElementById("stat-words"),
    sentences: document.getElementById("stat-sentences"),
    lines: document.getElementById("stat-lines")
  };

  /* ----------------------------- CONTAGGI ------------------------------- */

  function countWords(text) {
    const trimmed = text.trim();
    // split(/\s+/) divide su qualunque sequenza di spazi, tab o a capo.
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function countSentences(text) {
    // Una frase termina con . ! o ? : si spezza il testo e si contano i pezzi
    // non vuoti.
    return text
      .split(/[.!?]+/)
      .filter(function (part) {
        return part.trim().length > 0;
      }).length;
  }

  function countLines(text) {
    // Si normalizzano prima i tre modi di andare a capo (\r\n, \r, \n).
    return text.length ? text.split(/\r\n|\r|\n/).length : 0;
  }

  function updateStats() {
    const text = input.value;
    stats.chars.textContent = text.length;
    stats.charsNoSpaces.textContent = text.replace(/\s/g, "").length;
    stats.words.textContent = countWords(text);
    stats.sentences.textContent = countSentences(text);
    stats.lines.textContent = countLines(text);
  }

  /* -------------------------- TRASFORMAZIONI ---------------------------- */
  /* Ogni trasformazione riceve il testo e restituisce il testo nuovo.     */

  const transformations = {
    uppercase: {
      label: "Text converted to UPPERCASE.",
      run: function (text) {
        return text.toLocaleUpperCase();
      }
    },

    lowercase: {
      label: "Text converted to lowercase.",
      run: function (text) {
        return text.toLocaleLowerCase();
      }
    },

    capitalize: {
      label: "First letter of every word capitalized.",
      // Si mette in maiuscolo solo la prima lettera: il resto della parola
      // resta com'e' (cosi' "iPhone" non diventa "Iphone").
      run: function (text) {
        return text.replace(/\S+/g, function (word) {
          return word.charAt(0).toLocaleUpperCase() + word.slice(1);
        });
      }
    },

    trim: {
      label: "Extra spaces removed.",
      run: function (text) {
        return text
          .split(/\r\n|\r|\n/)
          .map(function (line) {
            // Spazi e tab consecutivi diventano uno; spazi in fondo riga via.
            return line.replace(/[ \t ]+/g, " ").trim();
          })
          .join("\n")
          .replace(/\n{3,}/g, "\n\n") // al massimo una riga vuota fra i blocchi
          .trim();
      }
    },

    join: {
      label: "Lines joined into a single line.",
      run: function (text) {
        return text
          .replace(/[ \t]*\r?\n[ \t]*/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
      }
    }
  };

  function applyTransformation(name) {
    const transformation = transformations[name];
    if (!transformation) return;

    if (!input.value) {
      Omni.setStatus(status, "There is no text to work on.", "error");
      return;
    }

    input.value = transformation.run(input.value);
    updateStats();
    Omni.setStatus(status, transformation.label, "success");
  }

  async function copyResult() {
    if (!input.value) {
      Omni.setStatus(status, "There is no text to copy.", "error");
      return;
    }
    const copied = await Omni.copyToClipboard(input.value);
    if (copied) {
      Omni.setStatus(status, "Text copied to the clipboard.", "success");
    } else {
      Omni.setStatus(status, "The browser blocked the copy. Select the text and copy it manually.", "error");
    }
  }

  function clearAll() {
    input.value = "";
    updateStats();
    input.focus();
    Omni.setStatus(status, "Text cleared.");
  }

  /* ------------------------------ EVENTI -------------------------------- */

  input.addEventListener("input", updateStats);

  document.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      const action = button.getAttribute("data-action");

      if (action === "copy") {
        copyResult();
      } else if (action === "clear") {
        clearAll();
      } else {
        applyTransformation(action);
      }
    });
  });

  // Stato iniziale.
  updateStats();
})();
