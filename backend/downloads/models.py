from django.db import models

class File(models.Model):
    file_name = models.CharField(max_length=512, null=True)
    file_size = models.BigIntegerField()
    mime_type = models.CharField(max_length=100, null=True)
    sha256_hash = models.CharField(max_length=64, db_index=True, null=True)
    download_path = models.CharField(max_length=1024, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
