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
