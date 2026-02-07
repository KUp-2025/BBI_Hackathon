from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import File

@api_view(['POST'])
def check_duplicate(request):
    data = request.data
    
    filename = data.get("filename") or "unknown.dat"
    size = data.get("size", 0)
    mime = data.get("mime", "application/octet-stream")
    file_hash = data.get("file_hash", f"hash_{size}")

    print(f"🔍 [{filename}] {size} bytes")

    
    if File.objects.filter(file_name__iexact=filename).exists():
        print(f"BLOCKED: {filename}")
        return Response({"duplicate": True, "reason": "SAME_FILENAME"})

   
    if File.objects.filter(sha256_hash=file_hash).exists():
        print(f"BLOCKED: hash match")
        return Response({"duplicate": True, "reason": "HASH_MATCH"})

    
    File.objects.create(
        file_name=filename,
        file_size=size,
        mime_type=mime,
        sha256_hash=file_hash,
        download_path=""
    )
    print(f"SAVED: {filename}")

    return Response({"duplicate": False, "reason": "NEW_FILE"})

@api_view(['GET'])
def recent_files(request):
    files = File.objects.order_by('-created_at')[:10]
    data = [{
        "file_name": f.file_name,
        "size": f.file_size,
        "file_hash": f.sha256_hash
    } for f in files]
    return Response(data)
    
