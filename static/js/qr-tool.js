/* ==========================================================================
   OmniTools - QR Code Generator
   Genera un codice QR da un testo o da un URL usando la libreria qrcode.js
   (davidshimjs, MIT, inclusa in static/vendor/qrcode.min.js). Permette di
   scaricare il risultato come PNG e di copiarlo negli appunti.

   Nota CS50x: questo file e' stato generato con l'aiuto di un assistente AI
   (OpenCode / Claude).
   ========================================================================== */
(function () {
  "use strict";

  const input = document.getElementById("qr-input");
  if (!input) return;

  const output = document.getElementById("qr-output");
  const hint = document.getElementById("qr-hint");
  const sizeSelect = document.getElementById("qr-size");
  const levelSelect = document.getElementById("qr-level");
  const status = document.getElementById("qr-status");
  const errorBox = document.getElementById("qr-error");
  const errorMessage = document.getElementById("qr-error-message");

  // La libreria espone i livelli di correzione degli errori come costanti.
  const LEVELS = {
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H
  };

  /**
   * Disegna (o cancella) il QR code.
   * La libreria aggiunge al contenitore un <canvas> e un <img>: il primo
   * serve per il download, il secondo viene mostrato all'utente.
   */
  function render() {
    const text = input.value.trim();
    Omni.showError(errorBox, errorMessage, "");
    output.innerHTML = ""; // la libreria appende i suoi elementi: si riparte puliti.

    if (!text) {
      hint.textContent = "Type something to generate a QR code.";
      Omni.setStatus(status, "");
      return;
    }

    const size = parseInt(sizeSelect.value, 10);

    try {
      new QRCode(output, {
        text: text,
        width: size,
        height: size,
        colorDark: "#1b1b19",
        colorLight: "#ffffff",
        correctLevel: LEVELS[levelSelect.value]
      });
      hint.textContent = "";
      Omni.setStatus(status, "QR code generated (" + size + " x " + size + " px).", "success");
    } catch (error) {
      // La libreria lancia "Too long data" se il testo e' troppo lungo.
      hint.textContent = "Type something to generate a QR code.";
      Omni.showError(
        errorBox,
        errorMessage,
        error && error.message
          ? error.message
          : "The text is too long to be encoded in a QR code."
      );
      Omni.setStatus(status, "The QR code could not be generated.", "error");
    }
  }

  // Si aspetta che l'utente finisca di scrivere prima di ridisegnare.
  let timer = null;
  input.addEventListener("input", function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(render, 200);
  });

  sizeSelect.addEventListener("change", render);
  levelSelect.addEventListener("change", render);

  /* ------------------------------ DOWNLOAD ------------------------------ */

  function downloadPng() {
    const canvas = output.querySelector("canvas");
    if (!canvas) {
      Omni.setStatus(status, "There is no QR code to download yet.", "error");
      return;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "omnitools-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Omni.setStatus(status, "QR code downloaded as PNG.", "success");
  }

  /* --------------------------- COPIA IMMAGINE --------------------------- */

  function copyImage() {
    const canvas = output.querySelector("canvas");
    if (!canvas) {
      Omni.setStatus(status, "There is no QR code to copy yet.", "error");
      return;
    }
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      Omni.setStatus(status, "This browser cannot copy images. Use the download button instead.", "error");
      return;
    }

    canvas.toBlob(function (blob) {
      if (!blob) {
        Omni.setStatus(status, "The image could not be copied. Use the download button instead.", "error");
        return;
      }
      navigator.clipboard
        .write([new ClipboardItem({ "image/png": blob })])
        .then(function () {
          Omni.setStatus(status, "QR code image copied to the clipboard.", "success");
        })
        .catch(function () {
          Omni.setStatus(status, "The browser blocked the copy. Use the download button instead.", "error");
        });
    }, "image/png");
  }

  /* ------------------------------- EVENTI ------------------------------- */

  document.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      const action = button.getAttribute("data-action");
      if (action === "download") {
        downloadPng();
      } else if (action === "copy") {
        copyImage();
      }
    });
  });

  render();
})();
