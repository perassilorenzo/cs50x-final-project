/* ==========================================================================
   OmniTools - Image Resizer
   Ridimensiona un'immagine con le API native del browser (FileReader, Image
   e Canvas) e permette di scaricare il risultato. L'immagine non viene mai
   inviata a un server: tutto avviene sulla macchina dell'utente.

   Nota CS50x: questo file e' stato generato con l'aiuto di un assistente AI
   (OpenCode / Claude).
   ========================================================================== */
(function () {
  "use strict";

  const fileInput = document.getElementById("image-file");
  if (!fileInput) return;

  const widthInput = document.getElementById("image-width");
  const heightInput = document.getElementById("image-height");
  const lockInput = document.getElementById("image-lock");
  const canvas = document.getElementById("image-canvas");
  const emptyPreview = document.getElementById("image-empty");
  const meta = document.getElementById("image-meta");
  const fileNameLabel = document.getElementById("image-file-name");
  const applyButton = document.getElementById("image-apply");
  const downloadButton = document.getElementById("image-download");
  const resetButton = document.getElementById("image-reset");
  const status = document.getElementById("image-status");
  const errorBox = document.getElementById("image-error");
  const errorMessage = document.getElementById("image-error-message");

  const MAX_SIDE = 4000; // limite di sicurezza: un canvas troppo grande fa fallire il browser

  // Formati che il canvas riesce a scrivere. Per gli altri (per esempio GIF
  // o BMP) si ripiega sul PNG, che e' sempre supportato.
  const WRITABLE_TYPES = ["image/png", "image/jpeg", "image/webp"];
  const EXTENSIONS = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp"
  };

  let originalImage = null; // elemento <img> con l'immagine originale
  let originalWidth = 0;
  let originalHeight = 0;
  let originalName = "image";
  let originalType = "image/png";

  /** Il formato con cui viene scritto il risultato finale. */
  function outputType() {
    return WRITABLE_TYPES.indexOf(originalType) !== -1 ? originalType : "image/png";
  }

  /** L'estensione del file da usare per il download, in base al formato reale. */
  function extensionFor(type) {
    return EXTENSIONS[type] || ".png";
  }

  function showError(message) {
    Omni.showError(errorBox, errorMessage, message);
    // La riga di stato resta vuota: il messaggio e' gia' nel riquadro di errore.
    if (message) Omni.setStatus(status, "");
  }

  function clearError() {
    Omni.showError(errorBox, errorMessage, "");
  }

  /* -------------------------- CARICAMENTO ------------------------------ */

  function loadFile(file) {
    if (!file) return;
    clearError();

    // Alcuni browser non forniscono il tipo MIME: in quel caso si lascia
    // decidere al caricamento dell'immagine, che e' il test piu' affidabile.
    if (file.type && file.type.indexOf("image/") !== 0) {
      showError("That file is not an image. Pick a PNG, JPEG, WebP or GIF file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {
      const image = new Image();

      image.onload = function () {
        originalImage = image;
        originalWidth = image.naturalWidth;
        originalHeight = image.naturalHeight;
        originalName = file.name;
        originalType = file.type;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;

        meta.textContent =
          originalName + " — " + originalWidth + " x " + originalHeight + " px, " + Omni.formatBytes(file.size);
        if (fileNameLabel) fileNameLabel.textContent = originalName;

        applySize();
        Omni.setStatus(status, "Image loaded. Choose the new size.", "success");
      };

      image.onerror = function () {
        showError("The file could not be read as an image.");
      };

      image.src = reader.result;
    };

    reader.onerror = function () {
      showError("The file could not be read.");
    };

    reader.readAsDataURL(file);
  }

  /* -------------------------- RIDIMENSIONAMENTO ------------------------ */

  function applySize() {
    if (!originalImage) {
      showError("Choose an image first.");
      return;
    }
    clearError();

    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);

    if (!width || !height || width < 1 || height < 1) {
      showError("Enter a valid width and height.");
      return;
    }
    if (width > MAX_SIDE || height > MAX_SIDE) {
      showError("The maximum supported size is " + MAX_SIDE + " x " + MAX_SIDE + " px.");
      return;
    }

    // Il formato di uscita segue quello del file originale (il PNG e' il
    // formato di riserva per i casi non supportati dal canvas).
    const type = outputType();

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    // Il JPEG non supporta la trasparenza: senza riempirelo lo sfondo
    // diventerebbe nero.
    if (type === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(originalImage, 0, 0, width, height);

    canvas.classList.remove("d-none");
    if (emptyPreview) emptyPreview.classList.add("d-none");

    downloadButton.disabled = false;
    applyButton.disabled = false;

    // toBlob serve a due cose: il peso reale del file e i dati per il download.
    canvas.toBlob(function (blob) {
      if (!blob) return;
      Omni.setStatus(
        status,
        "Resized to " + width + " x " + height + " px — " + Omni.formatBytes(blob.size) + ".",
        "success"
      );
    }, type);
  }

  /** Ricalcola l'altezza (o la larghezza) mantenendo le proporzioni. */
  function keepAspectRatio(changed) {
    if (!lockInput.checked || !originalImage) return;

    if (changed === "width") {
      const width = parseInt(widthInput.value, 10);
      if (!width) return;
      heightInput.value = Math.round((width * originalHeight) / originalWidth);
    } else {
      const height = parseInt(heightInput.value, 10);
      if (!height) return;
      widthInput.value = Math.round((height * originalWidth) / originalHeight);
    }
  }

  /* ------------------------------ DOWNLOAD ------------------------------ */

  function downloadImage() {
    if (!originalImage) {
      Omni.setStatus(status, "There is no image to download yet.", "error");
      return;
    }

    const type = outputType();

    canvas.toBlob(function (blob) {
      if (!blob) {
        Omni.setStatus(status, "The image could not be prepared for download.", "error");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Il nome del file si costruisce in due pezzi: il nome dell'originale
      // (senza estensione) e l'estensione del formato realmente prodotto.
      // Se il formato non e' supportato dal canvas, il risultato e' un PNG
      // anche se il file originale era un GIF: chiamarlo ".gif" mentirebbe.
      const dot = originalName.lastIndexOf(".");
      const base = dot > 0 ? originalName.slice(0, dot) : originalName;
      link.download = base + "-resized" + extensionFor(blob.type || type);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // L'URL temporaneo va liberato, altrimenti il file resta in memoria.
      URL.revokeObjectURL(url);

      Omni.setStatus(status, "Image downloaded.", "success");
    }, type);
  }

  function resetAll() {
    originalImage = null;
    originalWidth = 0;
    originalHeight = 0;
    fileInput.value = "";
    widthInput.value = "";
    heightInput.value = "";
    meta.textContent = "No image selected.";
    if (fileNameLabel) fileNameLabel.textContent = "Choose an image";
    canvas.classList.add("d-none");
    if (emptyPreview) emptyPreview.classList.remove("d-none");
    downloadButton.disabled = true;
    applyButton.disabled = true;
    resetButton.disabled = true;
    clearError();
    Omni.setStatus(status, "Cleared.");
  }

  /* ------------------------------- EVENTI ------------------------------- */

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (file) {
      resetButton.disabled = false;
      loadFile(file);
    }
    // Si svuota il campo: cosi' scegliere di nuovo lo stesso file ricarica
    // l'evento change.
    fileInput.value = "";
  });

  widthInput.addEventListener("input", function () {
    keepAspectRatio("width");
  });

  heightInput.addEventListener("input", function () {
    keepAspectRatio("height");
  });

  // Gli eventi dei pulsanti arrivano tutti da data-action, come negli altri
  // strumenti del sito.
  document.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      const action = button.getAttribute("data-action");

      if (action === "apply") {
        applySize();
      } else if (action === "download") {
        downloadImage();
      } else if (action === "reset") {
        resetAll();
      }
    });
  });
})();
