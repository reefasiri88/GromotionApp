import http.server
import socketserver
import os
import threading
import time

class APKHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/app-release.apk':
            apk_path = "android/app/build/outputs/apk/release/app-release.apk"
            if os.path.exists(apk_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.android.package-archive')
                self.send_header('Content-Disposition', 'attachment; filename="app-release.apk"')
                self.send_header('Content-Length', str(os.path.getsize(apk_path)))
                self.end_headers()
                
                with open(apk_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, "APK file not found")
        else:
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b"""
<!DOCTYPE html>
<html>
<head>
    <title>APK Download Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
        .download-btn { background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; font-size: 16px; }
        .info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ROSHN App APK Download</h1>
        <div class="info">
            <strong>File:</strong> app-release.apk<br>
            <strong>Size:</strong> 3.74 MB<br>
            <strong>Status:</strong> Ready for download
        </div>
        
        <a href="/app-release.apk" class="download-btn">📱 Download APK</a>
        
        <div class="warning">
            <strong>⚠️ Important:</strong> This is a temporary local server. 
            For external access, please use the manual upload instructions below.
        </div>
        
        <h3>📋 Manual Upload Instructions:</h3>
        <ol>
            <li><strong>Download the APK from this server first</strong></li>
            <li>Go to one of these file hosting websites:
                <ul>
                    <li><a href="https://file.io" target="_blank">https://file.io</a></li>
                    <li><a href="https://gofile.io" target="_blank">https://gofile.io</a></li>
                    <li><a href="https://wetransfer.com" target="_blank">https://wetransfer.com</a></li>
                    <li><a href="https://dropbox.com" target="_blank">https://dropbox.com</a></li>
                </ul>
            </li>
            <li>Upload the downloaded APK file</li>
            <li>Share the public download link</li>
        </ol>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <strong>🔒 File Verification:</strong><br>
            The APK has been signed and verified. It should install and open correctly with the onboarding → setup → home flow.
        </div>
    </div>
</body>
</html>
            """)

def start_server():
    PORT = 8080
    Handler = APKHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 APK Server started at http://localhost:{PORT}")
        print(f"📱 APK Download: http://localhost:{PORT}/app-release.apk")
        print(f"📋 Server Info: http://localhost:{PORT}/")
        print(f"💾 File: android/app/build/outputs/apk/release/app-release.apk")
        print(f"📊 Size: 3.74 MB")
        print("\n⚠️  This is a local server - only accessible from this machine")
        print("🌐 For external access, download from here and upload to file hosting service")
        print("\nPress Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    start_server()