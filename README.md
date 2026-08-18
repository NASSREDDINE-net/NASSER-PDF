# NASSER PDF — V3 SaaS

V3.1 Authentication · V3.2 Dashboard · V3.3 Documents/History · V3.4 Storage · V3.5 Free/Pro

## Local
Backend:
`cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`

Frontend:
`cd frontend && npm install && npm run dev`

## Netlify
Deploy `frontend/` and set `VITE_API_URL` to the public backend URL.

Production: PostgreSQL + S3/R2 + HTTPS + rate limiting + email verification + Stripe webhooks.
