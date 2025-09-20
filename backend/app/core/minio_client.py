from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import io

class MinIOClient:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
        except S3Error as e:
            print(f"Error creating bucket: {e}")
    
    def upload_file(self, file_data: bytes, file_name: str, content_type: str = "image/jpeg") -> str:
        """Upload file to MinIO and return the file URL"""
        try:
            file_stream = io.BytesIO(file_data)
            self.client.put_object(
                self.bucket_name,
                file_name,
                file_stream,
                length=len(file_data),
                content_type=content_type
            )
            return f"/{self.bucket_name}/{file_name}"
        except S3Error as e:
            print(f"Error uploading file: {e}")
            raise e
    
    def get_file_url(self, file_name: str) -> str:
        """Get presigned URL for file access"""
        try:
            return self.client.presigned_get_object(self.bucket_name, file_name)
        except S3Error as e:
            print(f"Error getting file URL: {e}")
            raise e
    
    def delete_file(self, file_name: str) -> bool:
        """Delete file from MinIO"""
        try:
            self.client.remove_object(self.bucket_name, file_name)
            return True
        except S3Error as e:
            print(f"Error deleting file: {e}")
            return False

# Global MinIO client instance
minio_client = MinIOClient()
