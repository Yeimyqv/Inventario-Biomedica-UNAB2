import os
import logging
from flask import Flask, render_template, send_from_directory

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__, static_folder='.')
app.secret_key = os.environ.get("SESSION_SECRET", "lab_management_secret_key")

@app.route('/')
def index():
    """Serve the main index page."""
    return render_template('index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files."""
    return send_from_directory('.', path)
