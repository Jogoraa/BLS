from typing import Dict
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, status

class CloudinaryService:
    def __init__(self, cloud_name: str, api_key: str, api_secret: str):
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )

    async def upload_image(self, file_path: str, folder: str = "birtu_logistics") -> str:
        """Uploads an image to Cloudinary and returns its URL."""
        try:
            upload_result = cloudinary.uploader.upload(file_path, folder=folder)
            return upload_result["secure_url"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary upload failed: {e}"
            )

    async def delete_image(self, public_id: str) -> Dict:
        """Deletes an image from Cloudinary."""
        try:
            delete_result = cloudinary.uploader.destroy(public_id)
            return delete_result
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary deletion failed: {e}"
            )


