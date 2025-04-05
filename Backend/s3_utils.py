import boto3
import os
from botocore.exceptions import ClientError
from PIL import Image
import io
import uuid
import logging
from typing import Tuple, Optional
from file_utils import get_mime_type
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Get AWS credentials from environment variables
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')
AWS_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
AWS_BUCKET_URL = os.getenv('AWS_BUCKET_URL')

# Verify credentials are available
if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME, AWS_BUCKET_URL]):
    raise ValueError("Missing AWS credentials in environment variables")

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def validate_image(file_content: bytes, filename: str) -> Tuple[bool, Optional[str]]:
    """Validate if the file is an image and its type"""
    return get_mime_type(file_content, filename)

def process_image(image_file) -> Optional[bytes]:
    """Process and optimize image for upload"""
    try:
        # Open image using PIL
        image = Image.open(image_file)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (max 1920x1080)
        max_size = (1920, 1080)
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.LANCZOS)
        
        # Save optimized image to bytes buffer
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85, optimize=True)
        buffer.seek(0)
        
        return buffer.getvalue()
    except Exception as e:
        logger.error("Image processing error", exc_info=True)
        return None

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename for S3 upload"""
    extension = os.path.splitext(original_filename)[1].lower()
    return f"{uuid.uuid4()}{extension}"

def upload_to_s3(file_data, original_filename: str) -> Tuple[bool, str, str]:
    """
    Upload file to S3 bucket
    Returns: (success: bool, url: str, key: str)
    """
    try:
        # Process image
        processed_data = process_image(file_data)
        if not processed_data:
            logger.error("Failed to process image")
            return False, "", ""

        # Generate unique filename
        unique_filename = generate_unique_filename(original_filename)
        
        # Upload to S3
        s3_client.put_object(
            Bucket=AWS_BUCKET_NAME,
            Key=unique_filename,
            Body=processed_data,
            ContentType='image/jpeg'
        )
        
        # Generate URL
        url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
        
        return True, url, unique_filename
        
    except ClientError as e:
        logger.error("AWS S3 error", exc_info=True)
        return False, "", ""
    except Exception as e:
        logger.error("Upload error", exc_info=True)
        return False, "", ""

def delete_from_s3(key: str) -> bool:
    """Delete file from S3"""
    try:
        s3_client.delete_object(
            Bucket=AWS_BUCKET_NAME,
            Key=key
        )
        return True
    except ClientError as e:
        raise Exception(f"Error deleting from S3: {str(e)}")

def verify_aws_credentials() -> bool:
    """Verify AWS credentials are valid"""
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        s3_client.list_buckets()
        return True
    except Exception as e:
        logger.error("AWS credentials verification failed", exc_info=True)
        return False

# Test AWS credentials on module load
try:
    print("Testing AWS credentials...")
    s3_client.list_buckets()
    print("AWS credentials verified successfully")
except Exception as e:
    print(f"Warning: AWS credentials verification failed: {str(e)}")