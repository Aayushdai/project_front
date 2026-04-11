#!/usr/bin/env python3
"""Simple HTTP server for frontend - runs on localhost:3000"""

import http.server
import socketserver
import os

PORT = 3000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Frontend running at http://localhost:{PORT}")
    print("Backend connected to http://localhost:8000")
    print("\nPress Ctrl+C to stop")
    httpd.serve_forever()
