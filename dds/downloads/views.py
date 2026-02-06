from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import DownloadFile

@api_view(['POST'])
def check_duplicate(request):
    filename = request.data.get("filename")
    size = request.data.get("size")
    mime = request.data.get("mime")
    file_hash = request.data.get("hash")

    if not all([filename, size, mime, file_hash]):
        return Response({"error": "Missing fields"}, status=400)

    try:
        existing = DownloadFile.objects.filter(file_hash=file_hash).first()
    except Exception:
        return Response({
            "duplicate": False,
            "warning": "Database not initialized yet"
        })

    if existing:
        return Response({
            "duplicate": True,
            "existing_file": {
                "filename": existing.filename,
                "size": existing.file_size,
                "mime": existing.mime_type,
                "downloaded_at": existing.created_at
            }
        })

    return Response({
        "duplicate": False,
        "message": "No duplicate detected"
    })
