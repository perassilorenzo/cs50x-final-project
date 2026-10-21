/* ==========================================================================
   OmniTools - main.js
   Helper condivisi da tutte le pagine: copia negli appunti, messaggi di
   stato e formattazione dei file. Non contiene logica specifica degli
   strumenti, cosi' puo' restare corto e leggibile.

   Nota CS50x: questo file e' stato generato con l'aiuto di un assistente AI
   (OpenCode / Claude).
   ========================================================================== */
(function () {
  "use strict";

  const Omni = {
    /**
     * Copia una stringa negli appunti.
     *
     * navigator.clipboard funziona solo in un "contesto sicuro" (https oppure
     * localhost). Sui file aperti dal disco (file://) la API non c'e', quindi
     * si ripiega sul vecchio document.execCommand("copy").
     *
     * @returns {Promise<boolean>} true se la copia e' andata a buon fine.
     */
    async copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (error) {
          // Permesso negato o contesto non sicuro: si prova il metodo di riserva.
        }
      }

      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      document.body.appendChild(area);
      area.select();

      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(area);
      return copied;
    },

    /**
     * Scrive un messaggio nella riga di stato di uno strumento.
     * @param {HTMLElement} element  la riga di stato (o null)
     * @param {string} message        il testo del messaggio
     * @param {string} [kind]         "success", "error" oppure undefined
     */
    setStatus(element, message, kind) {
      if (!element) return;
      element.textContent = message;
      element.classList.remove("is-success", "is-error");
      if (kind) element.classList.add("is-" + kind);
    },

    /**
     * Mostra oppure nasconde il riquadro di errore di uno strumento.
     * @param {HTMLElement} box         il riquadro .ot-alert
     * @param {HTMLElement} messageEl   il paragrafo con il dettaglio
     * @param {string} message          il dettaglio (stringa vuota = nascondi)
     */
    showError(box, messageEl, message) {
      if (!box) return;
      if (message) {
        if (messageEl) messageEl.textContent = message;
        box.classList.remove("d-none");
      } else {
        box.classList.add("d-none");
        if (messageEl) messageEl.textContent = "";
      }
    },

    /**
     * Formatta un numero di byte in una stringa leggibile.
     * @param {number} bytes
     * @returns {string} es. "12.4 KB"
     */
    formatBytes(bytes) {
      if (!bytes) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
      const value = bytes / Math.pow(1024, exponent);
      const rounded = exponent === 0 ? value : value.toFixed(1);
      return rounded + " " + units[exponent];
    }
  };

  // Esposto globalmente: i file degli strumenti lo usano come "Omni.xyz(...)".
  window.Omni = Omni;
})();
