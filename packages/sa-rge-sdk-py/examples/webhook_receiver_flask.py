"""Flask webhook receiver with signature verification.

Install Flask separately:
    pip install Flask

Then run:
    SA_WEBHOOK_SECRET=whsec_xxx python examples/webhook_receiver_flask.py

Verify locally with:
    curl -X POST http://localhost:5000/sa-webhook \
      -H "X-SA-Signature: <sig>" -H "X-SA-Timestamp: <ts>" \
      -d '{"event":"rge.updated"}'
"""
from __future__ import annotations

import json
import os
import sys

from sa_rge_sdk import verify_signature


def build_app() -> object:
    try:
        from flask import Flask, request  # noqa: WPS433  (optional dep)
    except ImportError:
        print("Flask is not installed. Run: pip install Flask", file=sys.stderr)
        raise

    secret = os.environ.get("SA_WEBHOOK_SECRET")
    if not secret:
        print("SA_WEBHOOK_SECRET env var is required", file=sys.stderr)
        sys.exit(2)

    app = Flask(__name__)

    @app.route("/sa-webhook", methods=["POST"])
    def receive():  # type: ignore[no-untyped-def]
        raw = request.get_data()
        sig = request.headers.get("X-SA-Signature")
        ts = request.headers.get("X-SA-Timestamp")
        ok, reason = verify_signature(raw, sig, ts, secret)
        if not ok:
            return {"ok": False, "reason": reason}, 401
        event = json.loads(raw.decode("utf-8")) if raw else {}
        # ... your handler here. Be idempotent: server may retry on 5xx.
        print(f"[webhook] received event={event.get('event')} ts={ts}")
        return {"ok": True}, 200

    return app


if __name__ == "__main__":
    app = build_app()
    app.run(host="127.0.0.1", port=5000)  # type: ignore[attr-defined]
