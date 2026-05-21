# API v1 — AnswerEngine Sessions (`/api/v1/ask/sessions/*`)

> Ralph 34. Multi-turn conversation persistence on top of the single-shot
> `/api/v1/ask` endpoint (Ralph 19) and its streaming sibling `/api/v1/ask/stream`
> (Ralph 28).

## Quick start (3-call curl)

```bash
# 1. Create an anonymous session
curl -sX POST https://servicesartisans.fr/api/v1/ask/sessions
# → {"session_id":"<uuid>","public_key":"<43-char-key>","expires_at":"<ISO>","message_cap":50,"_meta":{...}}

SID="<uuid>"
PK="<43-char-key>"

# 2. Send a message
curl -sX POST https://servicesartisans.fr/api/v1/ask/sessions/$SID/messages \
  -H 'Content-Type: application/json' \
  -d "{\"query\":\"Quel barème MaPrimeRénov' pour une PAC air/eau, ménage modeste ?\",\"public_key\":\"$PK\"}"
# → {"result":{"ok":true,"content":"...","citations":[...],"trace":{...}},"session":{...},"_meta":{...}}

# 3. Retrieve the full history
curl -s "https://servicesartisans.fr/api/v1/ask/sessions/$SID?public_key=$PK"
# → {"session":{...},"messages":[{"role":"user",...},{"role":"assistant",...}], "_meta":{...}}

# 4. (Optional) Soft-delete
curl -sX DELETE https://servicesartisans.fr/api/v1/ask/sessions/$SID \
  -H 'Content-Type: application/json' \
  -d "{\"public_key\":\"$PK\"}"
```

## Endpoints

| Method | Path                                      | Purpose                                  | Rate limit              |
| ------ | ----------------------------------------- | ---------------------------------------- | ----------------------- |
| POST   | `/api/v1/ask/sessions`                    | Create a new session                     | 30 req/min/IP fail-open |
| GET    | `/api/v1/ask/sessions/:id?public_key=...` | List conversation messages               | 60 req/min/IP fail-open |
| POST   | `/api/v1/ask/sessions/:id/messages`       | Send a new user message + receive answer | 30 req/min/IP fail-open |
| DELETE | `/api/v1/ask/sessions/:id`                | Soft-delete the session                  | 30 req/min/IP fail-open |

All endpoints respond with JSON. Successful answers carry the `_meta`
envelope shared with `/api/v1/ask` :

```json
{
  "_meta": {
    "api_version": "v1",
    "license": "CC-BY-4.0",
    "docs": "/docs/API-V1-ASK-SESSIONS.md"
  }
}
```

`X-License: CC-BY-4.0` and `X-Disclosure: /transparence-ia` headers are
mirrored for clients that only inspect headers.

## Session lifecycle

- **TTL** : 30 days from `created_at`. After expiry every endpoint
  returns HTTP **410**.
- **Message cap** : 50 messages per session (`message_count`). Once
  reached, `POST /messages` returns HTTP **422** with
  `session_message_cap_exceeded`. The cap is total
  (user + assistant combined), so 25 turns of Q&A.
- **Activity bump** : every insert into `rge_os_ask_messages` updates the
  parent session's `last_activity_at`.
- **Soft delete** : `DELETE` stamps `deleted_at`. Subsequent calls return
  404 (we deliberately do not surface "deleted" as a
  distinct state to keep the threat surface tight).

## Authentication

There is **no user account** — sessions are fully anonymous.

- `session_id` : UUID, addressable but not secret (it appears in URLs and
  logs).
- `public_key` : 32-byte random, returned **once** at creation, never
  recoverable. The server stores it as-is and compares
  via `crypto.timingSafeEqual` so a length-prefix
  short-circuit cannot leak through latency.
- Lose the key → lose the session. Treat it like a password.

## Errors

| HTTP | code                   | When                                                |
| ---- | ---------------------- | --------------------------------------------------- |
| 400  | `invalid_body`         | JSON parse failure                                  |
| 400  | `invalid_query`        | `query` missing / empty / > 4000 chars              |
| 400  | `missing_public_key`   | `public_key` not provided                           |
| 403  | `invalid_public_key`   | Key mismatch                                        |
| 404  | `session_not_found`    | Unknown session_id or already soft-deleted          |
| 410  | `session_expired`      | TTL elapsed                                         |
| 422  | (answer-engine reason) | Critic block / aides ground-truth failure / invalid |
| 429  | `rate_limit`           | Rate-limit bucket exhausted                         |
| 503  | (answer-engine reason) | `llm_unavailable` / `timeout`                       |
| 500  | `internal_error`       | Unexpected exception (also fires Sentry)            |

## Privacy

- `public_key` is the only secret. No email, phone, SIRET, IP or UA is
  required to use the API.
- We capture `ip_first` and `user_agent_first` **only at session creation**
  (DB columns `ip_first`, `user_agent_first`) for abuse forensics. They are
  **not** captured per message.
- Sessions are server-side. The client only needs to remember
  `session_id` + `public_key`.

## AI Act §50 disclosure

This endpoint dispatches to the same AnswerEngine (Ralph 13) used by the
public chat surfaces. Every response is generated by an LLM with optional
ground-truth injection (calculator) and Critic verification on YMYL
domains. See [`/transparence-ia`](https://servicesartisans.fr/transparence-ia)
for the full agent map, provider list, and EU-sovereignty posture.

## Roadmap (v0.2)

- **History feed-back into `answer()`** — currently the persistence layer is
  in place but the LLM does not yet receive prior turns. v0.2 adds a
  summarization pass triggered at `message_count > 30` so we preserve
  semantics while keeping token cost flat.
- **RAG over prior turns** — index each turn into the embeddings store so
  a multi-turn session retrieves relevant excerpts when answering.
- **Export as JSON-LD `Conversation`** — let users archive their session
  in a portable, schema.org-friendly format (CC-BY-4.0).
- **Authenticated sessions** — optional link to `/espace-client` accounts
  for cross-device continuity (still strictly opt-in).
- **Purge cron** — hard-delete sessions with `deleted_at < now - 24h` and
  sessions where `expires_at < now - 7d`.

## References

- Ralph 13 (`8b98d57b0`) — AnswerEngine
- Ralph 19 (`56f4050a3`) — `/api/v1/ask`
- Ralph 28 (`66153deb9`) — `/api/v1/ask/stream`
- `CLAUDE.md` — `search_path` pinning rule (CVE-2018-1058)
- Memory `feedback_legal_data_quality` — YMYL zero-tolerance
- Memory `servicesartisans-upstash-rate-limit-fix-2026-04-22` — fail-open
