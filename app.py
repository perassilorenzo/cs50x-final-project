"""OmniTools - applicazione web (CS50x Final Project).

Architettura: "server sottile, client spesso".
Flask si occupa soltanto di renderizzare i template Jinja e di esporre il
catalogo degli strumenti. Tutta la logica degli strumenti gira nel browser
con JavaScript vanilla: i dati dell'utente (testi, JSON, immagini) non
lasciano mai il dispositivo e OmniTools non conserva alcun dato personale.

Nessun database: per questo progetto non serve, quindi non c'e' (vedi README,
sezione "Design decisions").

Nota CS50x: questo codice e' stato scritto con l'aiuto di un assistente AI
(OpenCode, basato su Claude). Ogni file contiene un commento intestazione
che segnala l'uso dell'AI, come richiesto dalle linee guida del corso.
"""

from flask import Flask, abort, jsonify, render_template, url_for

app = Flask(__name__)

# Unico posto dove impostare l'indirizzo del repository GitHub.
#
# Il valore None lascia il footer senza link: e' preferibile non avere un
# collegamento a una pagina che non esiste ancora. Quando il repository sara'
# pubblico, basta scrivere qui l'indirizzo e il link compare da solo in tutte
# le pagine.
GITHUB_URL = "https://github.com/perassilorenzo/cs50x-final-project"

# ---------------------------------------------------------------------------
# Catalogo degli strumenti.
#
# Questo e' l'unica fonte di verita' del sito: da qui nascono le card della
# home, il catalogo /tools, il menu' e l'API JSON. Per aggiungere uno
# strumento basta inserire un elemento in questa lista e creare il template
# templates/tool_<id>.html.
# ---------------------------------------------------------------------------
TOOLS = [
    {
        "id": "text",
        "name": "Text Toolkit",
        "tagline": "Count, clean and re-case a text.",
        "description": (
            "Paste a text to count characters, words and sentences, change the "
            "case and remove extra spaces."
        ),
        "icon": "text",
        "features": [
            "Live count of characters, words, sentences and lines",
            "Uppercase, lowercase and capitalize words",
            "Remove extra spaces and join the lines",
            "Copy the result to the clipboard",
        ],
    },
    {
        "id": "json",
        "name": "JSON Formatter",
        "tagline": "Format or minify a JSON payload.",
        "description": (
            "Paste a JSON payload to check that it is valid, format it in a "
            "readable way or minify it back to a single line."
        ),
        "icon": "code",
        "features": [
            "Validation with a readable error message",
            "Highlight of the line where the JSON is broken",
            "Formatting with 2 spaces, 4 spaces or tabs",
            "Copy of the formatted output",
        ],
    },
    {
        "id": "qr",
        "name": "QR Code Generator",
        "tagline": "Create a QR code from a link or a text.",
        "description": (
            "Type a URL or a text and get a QR code you can download as a PNG "
            "image or copy to the clipboard."
        ),
        "icon": "qr",
        "features": [
            "Live generation while you type",
            "Choose the size and the error correction level",
            "Download the QR code as a PNG file",
            "Copy the image straight to the clipboard",
        ],
    },
    {
        "id": "image",
        "name": "Image Resizer",
        "tagline": "Resize a picture without uploading it.",
        "description": (
            "Load a picture, choose the new width and height and download the "
            "resized copy. The image never leaves your browser."
        ),
        "icon": "image",
        "features": [
            "Original size and weight of the file",
            "Optional lock of the aspect ratio",
            "Preview of the resized image",
            "Download keeping the original file format",
        ],
    },
]


@app.context_processor
def inject_globals():
    """Rende disponibili nei template i valori comuni a tutte le pagine."""
    return {
        "github_url": GITHUB_URL,
        "tools": TOOLS,
    }


@app.route("/")
def index():
    """Homepage: presentazione del progetto e anteprima degli strumenti."""
    return render_template("index.html")


@app.route("/tools")
def tools_page():
    """Catalogo completo degli strumenti."""
    return render_template("tools.html")


@app.route("/tool/<tool_id>")
def tool_page(tool_id):
    """Pagina di un singolo strumento.

    Il template scelto dipende dal tool_id, ma solo per gli id presenti in
    TOOLS: qualsiasi altro valore riceve un 404, quindi non si puo' fare
    path traversal sui template.
    """
    tool = next((t for t in TOOLS if t["id"] == tool_id), None)
    if tool is None:
        abort(404)
    return render_template(f"tool_{tool_id}.html", tool=tool)


@app.route("/api/tools")
def api_tools():
    """Catalogo in formato JSON (usato anche dai test automatici)."""
    return jsonify(
        [
            {
                "id": tool["id"],
                "name": tool["name"],
                "tagline": tool["tagline"],
                "description": tool["description"],
                "url": url_for("tool_page", tool_id=tool["id"]),
            }
            for tool in TOOLS
        ]
    )


@app.errorhandler(404)
def not_found(error):
    """Pagina 404 con lo stesso aspetto del resto del sito."""
    return render_template("404.html"), 404


if __name__ == "__main__":
    # Comodo per un avvio rapido in locale: python app.py
    #
    # Il server di sviluppo di Flask resta in ascolto solo su 127.0.0.1 e
    # accetta una sola richiesta alla volta: va bene per provare il progetto
    # in locale, ma per pubblicarlo online serve un server vero (gunicorn,
    # uwsgi, ...) dietro a un reverse proxy.
    app.run(debug=True, host="127.0.0.1", port=5000)
