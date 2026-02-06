from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def check_duplicate(request):
    filename = request.data.get("filename")
    size = request.data.get("size")
    mime = request.data.get("mime")

    return Response({
        "duplicate": False,
        "received": {
            "filename": filename,
            "size": size,
            "mime": mime
        }
    })
