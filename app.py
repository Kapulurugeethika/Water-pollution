import hmac
import os
import re
import sqlite3
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # Feedback requests should stay small.

DEFAULT_CORS_ORIGINS = [
    "https://kapulurugeethika.github.io",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
configured_origins = os.environ.get("CORS_ORIGINS", "")
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in configured_origins.split(",")
    if origin.strip()
] or DEFAULT_CORS_ORIGINS
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})


def database_path():
    """Use WATER_POLLUTION_DB to select a persistent database location."""
    path = Path(os.environ.get("WATER_POLLUTION_DB", "instance/waterpollution.sqlite3"))
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def get_db():
    connection = sqlite3.connect(database_path(), timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def error(message, status):
    return jsonify({"error": message}), status


@app.get("/")
def home():
    return jsonify({"message": "Water Pollution Awareness API", "health": "/api/health"})


@app.get("/api/health")
def health():
    try:
        with get_db() as connection:
            connection.execute("SELECT 1").fetchone()
        return jsonify({"status": "ok", "database": "connected"})
    except sqlite3.Error:
        app.logger.exception("Database health check failed")
        return error("Database is unavailable", 503)


@app.post("/api/feedback")
def submit_feedback():
    if not request.is_json:
        return error("Request body must be JSON", 415)

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be a JSON object", 400)

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")
    if not all(isinstance(value, str) for value in (name, email, message)):
        return error("Name, email, and feedback are required", 400)

    name, email, message = name.strip(), email.strip(), message.strip()
    if not name or len(name) > 100:
        return error("Name is required and must be 100 characters or fewer", 400)
    if not email or len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return error("Enter a valid email address", 400)
    if not message or len(message) > 5000:
        return error("Feedback is required and must be 5,000 characters or fewer", 400)

    try:
        with get_db() as connection:
            cursor = connection.execute(
                "INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)",
                (name, email, message),
            )
            feedback_id = cursor.lastrowid
        return jsonify({"message": "Feedback saved successfully", "id": feedback_id}), 201
    except sqlite3.Error:
        app.logger.exception("Could not save feedback")
        return error("Could not save feedback right now", 500)


@app.get("/api/admin/feedback")
def list_feedback():
    """Admin-only endpoint; set ADMIN_API_TOKEN before using it."""
    expected_token = os.environ.get("ADMIN_API_TOKEN", "")
    provided_token = request.headers.get("Authorization", "")
    if not expected_token:
        return error("Admin access is not configured", 503)
    if not provided_token.startswith("Bearer ") or not hmac.compare_digest(
        provided_token[7:], expected_token
    ):
        return error("Unauthorized", 401)

    try:
        limit = min(max(int(request.args.get("limit", "50")), 1), 100)
        offset = max(int(request.args.get("offset", "0")), 0)
    except ValueError:
        return error("Limit and offset must be integers", 400)

    try:
        with get_db() as connection:
            rows = connection.execute(
                """SELECT id, name, email, message, created_at
                   FROM feedback ORDER BY id DESC LIMIT ? OFFSET ?""",
                (limit, offset),
            ).fetchall()
        return jsonify([dict(row) for row in rows])
    except sqlite3.Error:
        app.logger.exception("Could not retrieve feedback")
        return error("Could not retrieve feedback right now", 500)


# Create the table for both local Flask and production WSGI servers such as Gunicorn.
init_db()


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1")
