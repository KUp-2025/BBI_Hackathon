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

    # 1️⃣ FILENAME DUPLICATE (90% cases)
    if File.objects.filter(file_name__iexact=filename).exists():
        print(f"✅ BLOCKED: {filename}")
        return Response({"duplicate": True, "reason": "SAME_FILENAME"})

    # 2️⃣ HASH DUPLICATE (future)
    if File.objects.filter(sha256_hash=file_hash).exists():
        print(f"✅ BLOCKED: hash match")
        return Response({"duplicate": True, "reason": "HASH_MATCH"})

    # 3️⃣ SAVE NEW
    File.objects.create(
        file_name=filename,
        file_size=size,
        mime_type=mime,
        sha256_hash=file_hash,
        download_path=""
    )
    print(f"➕ SAVED: {filename}")

    return Response({"duplicate": False, "reason": "NEW_FILE"})

@api_view(['GET'])
def recent_files(request):
    files = File.objects.order_by('-created_at')[:10]
    return Response([{
        "name": f.file_name,
        "size": f.file_size,
        "reason": f.sha256_hash[:8]
    } for f in files])
