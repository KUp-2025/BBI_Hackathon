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

    # Check for duplicate hash
    existing = File.objects.filter(sha256_hash=file_hash).first()
    if existing:
        return Response({
            "duplicate": True,
            "reason": "HASH_MATCH",
            "file_id": existing.id
        })

    # Optional: Check for size + mime match if hash is different (rare but possible)
    existing = File.objects.filter(
        file_size=size,
        mime_type=mime
    ).first()

    if existing:
        return Response({
            "duplicate": True,
            "reason": "SIZE_MIME_MATCH",
            "file_id": existing.id
        })

    return Response({"duplicate": False})
