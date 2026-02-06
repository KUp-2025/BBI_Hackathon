from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import File

@api_view(['POST'])
def check_duplicate(request):
    filename = request.data.get("filename")
    size = request.data.get("size")
    mime = request.data.get("mime")
    file_hash = request.data.get("file_hash")

    if not all([filename, size, mime, file_hash]):
        return Response(
            {"error": "Missing required fields"},
            status=400
        )

    # 1) Check for existing file with same hash
    existing = File.objects.filter(sha256_hash=file_hash).first()
    if existing:
        return Response({
            "duplicate": True,
            "reason": "HASH_MATCH",
            "file_id": existing.id,
        })

    # 2) If no existing, SAVE this file as new
    File.objects.create(
        file_name=filename,
        file_size=size,
        mime_type=mime,
        sha256_hash=file_hash,
        download_path="",  # optional: fill later from extension
    )

    return Response({
        "duplicate": False,
        "reason": "NEW_FILE_SAVED"
    })


@api_view(['GET'])
def recent_files(request):
    files = File.objects.order_by('-created_at')[:20]

    data = [
        {
            "file_name": f.file_name,
            "size": f.file_size,
            "mime": f.mime_type,
            "sha256_hash": f.sha256_hash,
            "created_at": f.created_at,
        }
        for f in files
    ]

    return Response(data)
