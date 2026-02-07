import os
import json
import re
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# 1. AUTO-DETECT DOWNLOADS FOLDER
# This works dynamically on Windows/Mac/Linux
DOWNLOADS_PATH = str(Path.home() / "Downloads")
print(f"📂 Django is monitoring Real Files at: {DOWNLOADS_PATH}")

@csrf_exempt
def check_duplicate(request):
    """
    Checks if a file exists in the local Downloads folder.
    Smartly handles Chrome's 'file (1).ext' renaming.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            original_filename = data.get('filename')
            incoming_size = data.get('size', 0)

            print(f"🔍 Checking: {original_filename} ({incoming_size} bytes)")

            # SMART CLEANING: "arduino (1).exe" -> "arduino.exe"
            # Regex removes " (N)" before the extension
            clean_filename = re.sub(r' \(\d+\)(\.[^.]+)$', r'\1', original_filename)
            
            # Check paths for BOTH raw name and cleaned name
            paths_to_check = [
                os.path.join(DOWNLOADS_PATH, original_filename),
                os.path.join(DOWNLOADS_PATH, clean_filename)
            ]

            for file_path in paths_to_check:
                if os.path.exists(file_path):
                    local_size = os.path.getsize(file_path)
                    
                    # LOGIC: Size Match = Duplicate
                    # (Allowing >0 check ensures we don't block empty temp files)
                    if incoming_size > 0 and local_size == incoming_size:
                        print(f"❌ BLOCKED: Found {file_path}")
                        return JsonResponse({
                            "duplicate": True,
                            "existing_path": file_path,
                            "confidence": "High (Name + Size)"
                        })
            
            print(f"✅ CLEAN: Safe to download.")
            return JsonResponse({"duplicate": False})
            
        except Exception as e:
            print(f"⚠️ Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "POST method required"}, status=400)


@csrf_exempt
def recent_files(request):
    """
    Returns the 5 most recently modified files in the Downloads folder.
    Used for the Dashboard UI.
    """
    if request.method == 'GET':
        try:
            files = []
            # Scan directory for files only
            with os.scandir(DOWNLOADS_PATH) as entries:
                for entry in entries:
                    if entry.is_file():
                        files.append({
                            "file_name": entry.name,
                            "timestamp": entry.stat().st_mtime,
                            "size": entry.stat().st_size
                        })
            
            # Sort by timestamp (newest first)
            files.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Return top 5
            return JsonResponse(files[:5], safe=False)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
            
    return JsonResponse({"error": "GET method required"}, status=400)
