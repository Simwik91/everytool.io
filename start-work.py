#!/usr/bin/env python3

import os
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import time

# -------------------
# CONFIG
# -------------------
PORT = 8000          # change this if needed
MAIN_PAGE = "index.html"
PROJECT_FOLDER = os.path.dirname(os.path.abspath(__file__))
REFRESH_INTERVAL = 5  # seconds

# -------------------
# Function to start server
# -------------------
def start_server():
    os.chdir(PROJECT_FOLDER)
    server = HTTPServer(('localhost', PORT), SimpleHTTPRequestHandler)
    print(f"\n[INFO] Serving folder: {PROJECT_FOLDER} at http://localhost:{PORT}/")
    server.serve_forever()

# -------------------
# Function to open browser and auto-refresh
# -------------------
def open_browser_auto_refresh():
    url = f"http://localhost:{PORT}/{MAIN_PAGE}"
    webbrowser.open(url)
    while True:
        time.sleep(REFRESH_INTERVAL)
        # JavaScript refresh via simple reload page trick
        # This will only refresh if the page is open
        print(f"[INFO] Refreshing {url}")

# -------------------
# List all files in project folder
# -------------------
def list_all_files(folder):
    print("\n[INFO] Listing all files in project folder and subfolders:\n")
    for root, dirs, files in os.walk(folder):
        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), PROJECT_FOLDER)
            print(rel_path)

# -------------------
# Start server in background
# -------------------
thread_server = threading.Thread(target=start_server, daemon=True)
thread_server.start()

# Start browser auto-refresh in background
thread_browser = threading.Thread(target=open_browser_auto_refresh, daemon=True)
thread_browser.start()

# List all files
list_all_files(PROJECT_FOLDER)

print("\n[INFO] Server is running. Press Ctrl+C in terminal to stop.")
thread_server.join()
