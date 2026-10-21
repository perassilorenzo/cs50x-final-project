"""Test automatici di OmniTools (CS50x Final Project).

Verificano che il sito risponda correttamente su tutte le rotte e che il
catalogo degli strumenti sia coerente.

Esecuzione:  python -m pytest

Nota CS50x: questo file e' stato generato con l'aiuto di un assistente AI
(OpenCode / Claude).
"""

import app as application
from app import TOOLS


def test_home_renders():
    client = application.app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert b"Small tools. Simple solutions." in response.data


def test_tools_page_lists_every_tool():
    client = application.app.test_client()
    response = client.get("/tools")
    assert response.status_code == 200
    for tool in TOOLS:
        assert tool["name"].encode() in response.data


def test_every_tool_page_renders():
    client = application.app.test_client()
    for tool in TOOLS:
        response = client.get("/tool/" + tool["id"])
        assert response.status_code == 200
        assert tool["name"].encode() in response.data


def test_unknown_tool_returns_404():
    client = application.app.test_client()
    assert client.get("/tool/not-a-tool").status_code == 404
    assert client.get("/not-a-page").status_code == 404


def test_api_returns_the_catalog():
    client = application.app.test_client()
    response = client.get("/api/tools")
    assert response.status_code == 200
    payload = response.get_json()
    assert len(payload) == len(TOOLS)
    for entry in payload:
        assert entry["url"].startswith("/tool/")


def test_static_files_are_served():
    client = application.app.test_client()
    for path in (
        "/static/css/style.css",
        "/static/js/main.js",
        "/static/js/text-tool.js",
        "/static/js/json-tool.js",
        "/static/js/qr-tool.js",
        "/static/js/image-resizer.js",
        "/static/vendor/qrcode.min.js",
    ):
        assert client.get(path).status_code == 200


def test_github_link_appears_only_when_the_repository_exists(monkeypatch):
    """Il link al repository non deve comparire finche' non e' stato creato."""
    client = application.app.test_client()

    monkeypatch.setattr(application, "GITHUB_URL", None)
    assert b"Source on GitHub" not in client.get("/").data

    monkeypatch.setattr(application, "GITHUB_URL", "https://github.com/example/omnitools")
    assert b"Source on GitHub" in client.get("/").data
