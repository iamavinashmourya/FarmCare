import mimetypes
import os
from typing import Tuple, Optional

def get_mime_type(file_content: bytes, filename: str) -> Tuple[bool, Optional[str]]:
    """Get MIME type using file extension and content checking"""
    try:
        # Get MIME type from file extension
        mime_type, _ = mimetypes.guess_type(filename)
        
        # If can't determine from extension, check file signature
        if not mime_type:
            # Check file signature for common image types
            if file_content.startswith(b'\xFF\xD8\xFF'):  # JPEG
                mime_type = 'image/jpeg'
            elif file_content.startswith(b'\x89PNG\r\n\x1a\n'):  # PNG
                mime_type = 'image/png'
            elif file_content.startswith(b'GIF87a') or file_content.startswith(b'GIF89a'):  # GIF
                mime_type = 'image/gif'
            elif file_content.startswith(b'RIFF') and file_content[8:12] == b'WEBP':  # WEBP
                mime_type = 'image/webp'
        
        if not mime_type:
            return False, "Could not determine file type"
        
        if not mime_type.startswith('image/'):
            return False, "File must be an image"
        
        return True, mime_type
    except Exception as e:
        return False, str(e) 