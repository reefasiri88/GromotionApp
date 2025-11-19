import requests
import os
import json
import time

def upload_to_fileio():
    """Upload APK to File.io"""
    file_path = "android/app/build/outputs/apk/release/app-release.apk"
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        return None
    
    try:
        with open(file_path, "rb") as f:
            files = {"file": ("app-release.apk", f, "application/vnd.android.package-archive")}
            response = requests.post("https://file.io", files=files, timeout=300)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                download_url = result["link"]
                print(f"Upload successful!")
                print(f"Download URL: {download_url}")
                return download_url
            else:
                print(f"Upload failed: {result}")
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error uploading to File.io: {e}")
        
    return None

def upload_to_transfer():
    """Upload APK to Transfer.sh"""
    file_path = "android/app/build/outputs/apk/release/app-release.apk"
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        return None
    
    try:
        with open(file_path, "rb") as f:
            files = {"file": ("app-release.apk", f, "application/vnd.android.package-archive")}
            response = requests.post("https://transfer.sh", files=files, timeout=300)
        
        if response.status_code == 200:
            download_url = response.text.strip()
            print(f"Upload successful!")
            print(f"Download URL: {download_url}")
            return download_url
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error uploading to Transfer.sh: {e}")
        
    return None

def upload_to_0x0():
    """Upload APK to 0x0.st"""
    file_path = "android/app/build/outputs/apk/release/app-release.apk"
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found")
        return None
    
    try:
        with open(file_path, "rb") as f:
            files = {"file": ("app-release.apk", f, "application/vnd.android.package-archive")}
            response = requests.post("https://0x0.st", files=files, timeout=300)
        
        if response.status_code == 200:
            download_url = response.text.strip()
            print(f"Upload successful!")
            print(f"Download URL: {download_url}")
            return download_url
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error uploading to 0x0.st: {e}")
        
    return None

if __name__ == "__main__":
    print("Starting APK upload process...")
    
    services = [
        ("File.io", upload_to_fileio),
        ("Transfer.sh", upload_to_transfer),
        ("0x0.st", upload_to_0x0)
    ]
    
    for service_name, upload_func in services:
        print(f"\nTrying {service_name}...")
        url = upload_func()
        if url:
            print(f"\n✅ SUCCESS! Download URL: {url}")
            break
        else:
            print(f"{service_name} failed, trying next service...")
            time.sleep(2)  # Small delay between attempts
    
    if not url:
        print("\n❌ All upload attempts failed.")
        print("\n📝 MANUAL UPLOAD INSTRUCTIONS:")
        print("1. Download the APK from your local machine:")
        print("   File: android/app/build/outputs/apk/release/app-release.apk")
        print("   Size: 3.74 MB")
        print("\n2. Upload it to one of these services manually:")
        print("   - https://file.io")
        print("   - https://transfer.sh")
        print("   - https://0x0.st")
        print("   - https://gofile.io")
        print("\n3. Share the download link with the user.")