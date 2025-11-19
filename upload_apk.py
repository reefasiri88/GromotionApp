import requests
import os
import json

def upload_to_gofile():
    """Upload APK to GoFile.io"""
    file_path = "android/app/build/outputs/apk/release/app-release.apk"
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        return None
    
    try:
        # Get server from GoFile
        server_response = requests.get("https://api.gofile.io/getServer")
        if server_response.status_code != 200:
            print("Failed to get GoFile server")
            return None
            
        server_data = server_response.json()
        if server_data["status"] != "ok":
            print("GoFile API error")
            return None
            
        server = server_data["data"]["server"]
        upload_url = f"https://{server}.gofile.io/uploadFile"
        
        # Upload file
        with open(file_path, "rb") as f:
            files = {"file": ("app-release.apk", f, "application/vnd.android.package-archive")}
            response = requests.post(upload_url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            if result["status"] == "ok":
                download_url = result["data"]["downloadPage"]
                print(f"Upload successful!")
                print(f"Download URL: {download_url}")
                return download_url
            else:
                print(f"Upload failed: {result}")
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error uploading to GoFile: {e}")
        
    return None

def upload_to_anonfiles():
    """Upload APK to AnonFiles"""
    file_path = "android/app/build/outputs/apk/release/app-release.apk"
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        return None
    
    try:
        with open(file_path, "rb") as f:
            files = {"file": ("app-release.apk", f, "application/vnd.android.package-archive")}
            response = requests.post("https://api.anonfiles.com/upload", files=files, timeout=300)
        
        if response.status_code == 200:
            result = response.json()
            if result["status"]:
                download_url = result["data"]["file"]["url"]["full"]
                print(f"Upload successful!")
                print(f"Download URL: {download_url}")
                return download_url
            else:
                print(f"Upload failed: {result}")
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error uploading to AnonFiles: {e}")
        
    return None

if __name__ == "__main__":
    print("Starting APK upload process...")
    
    # Try GoFile first
    print("\nTrying GoFile.io...")
    url = upload_to_gofile()
    
    if not url:
        # Try AnonFiles as backup
        print("\nTrying AnonFiles.com...")
        url = upload_to_anonfiles()
    
    if url:
        print(f"\n✅ SUCCESS! Download URL: {url}")
    else:
        print("\n❌ All upload attempts failed. Please try manual upload.")