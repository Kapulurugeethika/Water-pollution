# Water Pollution Awareness

A static awareness website hosted on GitHub Pages, with a Flask + SQLite API for storing feedback. GitHub Pages can serve the frontend but cannot run Python or host the database; deploy the API separately.

## Run the backend locally

Requires Python 3.10+.

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`. The SQLite database is created at `instance/waterpollution.sqlite3` automatically. Check `GET /api/health` and submit feedback with `POST /api/feedback`.

## Connect GitHub Pages to the API

1. Deploy this repository's Flask app to a Python web host (for example, Render) using `pip install -r requirements.txt` and `gunicorn app:app` as the start command.
2. Configure these environment variables on the backend host:
   - `WATER_POLLUTION_DB`: use a persistent disk path, such as `/var/data/waterpollution.sqlite3`, if your host provides a mounted disk. Without a persistent disk, SQLite data may be lost when the service is recreated.
   - `CORS_ORIGINS`: `https://kapulurugeethika.github.io` (or a comma-separated list of exact frontend origins).
   - `ADMIN_API_TOKEN`: a long, private random value if you need to use the protected admin endpoint. Do not put this token in frontend code.
3. Set `window.WATER_POLLUTION_API_URL` in `api-config.js` to the deployed backend URL (for example, `https://your-service.onrender.com`, without a trailing slash), then commit the change. The backend URL must be public over HTTPS for the GitHub Pages site to call it.

## API

- `GET /api/health` — API and database health.
- `POST /api/feedback` — store `{ "name": "...", "email": "...", "message": "..." }` in SQLite.
- `GET /api/admin/feedback?limit=50&offset=0` — list feedback; requires `Authorization: Bearer <ADMIN_API_TOKEN>`. The secret belongs only on a trusted admin client/server, never in the public website.

The feedback form reports success only after the backend confirms the record was stored. Until `api-config.js` points at a deployed API, it will explain that the service is not configured.
