# OmniTools

#### Video Demo: https://youtu.be/0qo8cTlRELQ

#### Description:
OmniTools is a small collection of free web utilities that run entirely in the
browser: a Text Toolkit, a JSON Formatter, a QR Code Generator and an Image
Resizer. It is my final project for CS50x 2026, built with Flask, Jinja and
vanilla JavaScript.

---

## The four tools

| Tool | What it does |
|---|---|
| **Text Toolkit** (`/tool/text`) | Counts characters, characters without spaces, words, sentences and lines while you type. Converts the text to upper or lower case, capitalises the first letter of each word, removes extra spaces, joins the lines into one, and copies the result to the clipboard. |
| **JSON Formatter** (`/tool/json`) | Checks that a JSON payload is valid, pretty-prints it (2 spaces, 4 spaces or tab) or minifies it to a single line. When the JSON is broken it explains what is wrong, shows the line and column of the mistake and selects it in the input. |
| **QR Code Generator** (`/tool/qr`) | Turns a link or a text into a QR code, with a choice of size (200–512 px) and error-correction level. The code can be downloaded as a PNG file or copied to the clipboard. |
| **Image Resizer** (`/tool/image`) | Loads a PNG, JPEG, WebP or GIF picture, shows its real size and weight, resizes it with an optional lock on the aspect ratio, previews the result and downloads it. The picture is never uploaded anywhere. |

Everything is stateless: you close the tab and nothing is left behind.

## Why I built it

I am an Italian high-school student, and I like projects small enough to read
from the first line to the last one. For the final project I did not want
another set of isolated exercises: I wanted one thing that works, that I would
actually use, and that I could finish properly.

So I set myself a deliberately modest scope — four tools, one page each, one
JavaScript file per tool — and I tried to build them the way I would like to
find them: fast, quiet, no accounts, and no data leaving the device. Most of
the work went into details that are invisible in a screenshot but make the
difference in daily use: a JSON error that tells you *where* the mistake is, a
file name that matches the format you actually get, keyboard navigation and a
visible focus ring.

## Technologies

- **Python 3.9+** with **Flask 3.1.3** — routes, the tool catalog and a small
  JSON API.
- **Jinja 2** templates, one per page, with shared macros.
- **Bootstrap 5.3.3** (MIT) loaded from a CDN with a pinned version and the
  `integrity` attribute (SRI), plus a custom stylesheet in
  `static/css/style.css`.
- **Vanilla JavaScript**, one file per tool, using only native browser APIs
  (`JSON.parse`/`stringify`, `FileReader`, `Canvas`, `Blob`, Clipboard API).
- **qrcode.js 1.0.0** by davidshimjs (MIT), the only third-party JavaScript,
  vendored in `static/vendor/` together with its licence so the QR generator
  does not depend on a CDN.
- **pytest** for the automated tests.

## How to run it locally

```bash
# 1. virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. dependencies
pip install -r requirements.txt

# 3. start the server
flask --app app run --debug
```

The site is then available at **http://127.0.0.1:5000**. `python app.py` does
the same thing. This is Flask's development server: it listens only on
`127.0.0.1` and is meant for local use — to publish the project online you
would need a real server (gunicorn or uWSGI) behind a reverse proxy.

To run the tests:

```bash
pip install -r requirements-dev.txt
python -m pytest
```

## Project structure

```
cs50x-final-project/
├── app.py                     # Flask app: routes, TOOLS catalog, JSON API, 404 page
├── requirements.txt           # runtime dependencies (Flask)
├── requirements-dev.txt       # development dependencies (pytest)
├── README.md
├── LICENSE                    # MIT licence
├── .gitignore
├── templates/                 # Jinja templates
│   ├── base.html              # shared layout: head, navbar, footer, scripts
│   ├── macros.html            # macros: SVG icons, tool card, page blocks
│   ├── index.html             # home: hero, about, tools, closing, social links
│   ├── tools.html             # full catalog of the tools
│   ├── tool_text.html         # Text Toolkit page
│   ├── tool_json.html         # JSON Formatter page
│   ├── tool_qr.html           # QR Code Generator page
│   ├── tool_image.html        # Image Resizer page
│   └── 404.html               # custom error page
├── static/
│   ├── css/style.css          # design tokens and Bootstrap customisation
│   ├── js/main.js             # shared helpers (clipboard, status messages, sizes)
│   ├── js/text-tool.js        # Text Toolkit logic
│   ├── js/json-tool.js        # JSON Formatter logic
│   ├── js/qr-tool.js          # QR Code Generator logic
│   ├── js/image-resizer.js    # Image Resizer logic
│   ├── img/favicon.svg        # favicon
│   └── vendor/
│       ├── qrcode.min.js      # qrcode.js 1.0.0 (MIT), vendored locally
│       └── qrcode.LICENSE     # MIT licence text
└── tests/
    └── test_app.py            # automated tests with pytest
```

`app.py` is the entry point: it defines the `TOOLS` list, the seven routes
(`/`, `/tools`, the four tool pages and `/api/tools`) and the 404 handler.
The templates only describe the pages; the four JavaScript files contain the
logic of the tools; `main.js` holds the few helpers they share.

## Design decisions

**A thin server and a thick client.** Flask only renders the pages and serves
the catalog: the actual work happens in the browser. This keeps the user's
data on their own machine, removes sessions, uploads and temporary files from
the picture, and gives each tool a small self-contained file I can read on its
own.

**One catalog for the whole site.** `TOOLS` in `app.py` is the single source of
truth. The cards on the home page, the `/tools` catalog, the pages of the
tools and the JSON API are all generated from that list, so adding a tool means
adding an entry and writing its template — nothing else has to be touched.

**No database.** The tools are stateless and there are no users, so a database
would have added models, migrations and, above all, a reason to store user
data on a server. That is the opposite of what this project is about.

**A calm design.** One neutral palette (`#fafaf8` background, `#ffffff`
surfaces, `#1b1b19` text) and a single accent colour (`#2f6f4e`), no
gradients, no glassmorphism and no decorative shadows — the only `box-shadow`
in the stylesheet is the focus ring. The body text sits at a 16.5:1 contrast
ratio and every other colour used for text stays above the 4.5:1 required by
WCAG AA. Icons are inline SVG written by hand, so there is no icon font, no
emoji and no extra request.

**Accessibility and safety.** Every control is reachable with the keyboard and
shows a visible focus state, the status lines are announced with `aria-live`,
and `prefers-reduced-motion` is respected. User data is never inserted with
`innerHTML` — results are written with `.value` or `.textContent`, so a
malicious JSON payload can never become executable code. There are no
cookies, no sessions and no analytics.

## Tests

`tests/test_app.py` contains **7 pytest tests**, and they all pass:

```bash
$ python -m pytest
.......                                          [100%]
7 passed in 0.95s
```

They check that the home page and the catalog render, that every tool page
answers `200` and contains its tool, that an unknown URL and an unknown tool
id both give the custom `404` page, that `/api/tools` returns the same number
of tools as the catalog, that the static files are served, and that the
"Source on GitHub" link only appears in the footer when the repository URL is
actually set in `app.py`.

I also checked the parts a request/response test cannot see by driving the
site in a real browser (Chromium): downloading the PNG of a QR code, the
GIF-to-PNG conversion of the Image Resizer, the JSON error message and the
highlighted position, the clipboard copy, the tab order, the focus ring on the
file picker, and the absence of horizontal overflow at phone width.

## Limitations and what comes next

- QR codes are limited to short texts: it is a limit of the QR format and of
  the library, not of the page.
- The Image Resizer handles one image at a time and does not crop, rotate or
  convert between formats. Formats the browser canvas cannot write (for
  example GIF) are exported as PNG, and the downloaded file name always
  matches the format that is really produced.
- The JSON Formatter has no tree view and cannot open a `.json` file from
  disk.
- The sentence counter is an approximation: it splits on `.`, `!` and `?`, so
  an abbreviation such as "Mr." is counted as the end of a sentence.
- Possible next steps: a fifth tool, a separate about page and saving the
  settings of each tool in `localStorage`.

## Demo video plan

The video must be at most 3 minutes long and must open with the project
title, my name, my GitHub and edX usernames, my city and country, and the
date of the recording. My plan for the three minutes:

| Time | What I show |
|---|---|
| 0:00 – 0:20 | Opening slide (title, name, usernames, place, date) and the idea: small tools, everything in the browser. |
| 0:20 – 0:40 | The structure in 20 seconds: `app.py` and the `TOOLS` catalog, the templates, the four JavaScript files. |
| 0:40 – 1:30 | **Text Toolkit**: live statistics, uppercase, remove extra spaces, copy. |
| 1:30 – 2:10 | **JSON Formatter**: format a valid payload, then a broken one with the highlighted line. |
| 2:10 – 2:40 | **QR Code Generator**: type a link, generate the code, download the PNG. |
| 2:40 – 3:00 | **Image Resizer**: load a picture, resize it, download it. Closing: the four tools and the privacy idea. |

## Use of artificial intelligence

For the final project CS50x allows the use of AI assistants, as long as the
work stays mine and the use of the tools is cited. This is what I did:

- Every source file (`app.py`, the templates, the CSS, the JavaScript and the
  tests) carries a header comment stating that the code was written with the
  help of an AI assistant (OpenCode, based on Claude) and was then reviewed,
  run and corrected by hand.
- The decisions I took myself — how the counters work, how the JSON errors
  are explained, which dependencies to use, how to structure the project —
  are commented in the code with the reason behind them, so I can explain them
  during the defence.
- No result was accepted without checking it: the code was run, the tests
  were executed and the site was checked in a real browser.

## Where to find me

- GitHub: <https://github.com/perassilorenzo>
- Portfolio: <https://perassilorenzo.github.io/portfolio>
- Instagram: <https://www.instagram.com/diario_di_uno_09/>
- TikTok: <https://www.tiktok.com/@diario_di_uno_09>
- YouTube: <https://www.youtube.com/@diario_di_uno_09>
- LinkedIn: <https://www.linkedin.com/in/perassilorenzo/>

## License

My own code is released under the **MIT** licence. Third-party libraries:
Bootstrap 5.3.3 (MIT), qrcode.js 1.0.0 (MIT).
