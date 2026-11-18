from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

# Database connection
def get_db():
    return sqlite3.connect("waterpollution.db")

# Create database table
def create_table():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Home route
@app.route("/")
def home():
    return "Water Pollution Awareness Backend is Running!"

# Save feedback
@app.route("/submit-feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()

    name = data.get("name", "").strip()
    message = data.get("message", "").strip()

    if not name or not message:
        return jsonify({"error": "Name and feedback are required"}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO feedback (name, message) VALUES (?, ?)",
        (name, message)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Feedback saved successfully!"})

# Admin: View feedback
@app.route("/admin/feedback")
def view_feedback():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, name, message FROM feedback ORDER BY id DESC"
    ).fetchall()
    conn.close()

    return jsonify(rows)

# Start server
if __name__ == "__main__":
    create_table()
    app.run(debug=True)
