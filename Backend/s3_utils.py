import boto3
import os
from botocore.exceptions import ClientError
from PIL import Image
import io
from datetime import datetime
from typing import Tuple, Optional
from file_utils import get_mime_type
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get AWS credentials from environment variables
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION')
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

def process_image(file_content: bytes, max_size: Tuple[int, int] = (800, 800)) -> bytes:
    """Process and resize image if needed"""
    try:
        image = Image.open(io.BytesIO(file_content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        # Resize if larger than max_size
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save processed image
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85)
        return output.getvalue()
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise ValueError(f"Error processing image: {str(e)}")

def upload_to_s3(file_content: bytes, original_filename: str) -> Tuple[str, str]:
    """Upload file to S3 and return URL and key"""
    try:
        print(f"Starting S3 upload for file: {original_filename}")
        
        # Process image
        try:
            processed_content = process_image(file_content)
            print("Image processed successfully")
        except Exception as e:
            print(f"Image processing failed: {str(e)}")
            raise
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_extension = os.path.splitext(original_filename)[1].lower()
        unique_filename = f"profile_images/{timestamp}_{os.urandom(4).hex()}{file_extension}"
        
        print(f"Generated unique filename: {unique_filename}")
        
        # Upload to S3
        try:
            print("Attempting S3 upload...")
            s3_client.put_object(
                Bucket=AWS_BUCKET_NAME,
                Key=unique_filename,
                Body=processed_content,
                ContentType='image/jpeg'
            )
            print("S3 upload successful")
        except ClientError as e:
            print(f"S3 upload failed with error: {str(e)}")
            print(f"AWS Credentials being used:")
            print(f"Access Key ID: {AWS_ACCESS_KEY_ID[:5]}...")
            print(f"Secret Key: {AWS_SECRET_ACCESS_KEY[:5]}...")
            print(f"Region: {AWS_REGION}")
            print(f"Bucket: {AWS_BUCKET_NAME}")
            raise
        
        # Generate URL
        url = f"{AWS_BUCKET_URL}/{unique_filename}"
        print(f"Generated URL: {url}")
        
        return url, unique_filename
        
    except Exception as e:
        print(f"Error in upload_to_s3: {str(e)}")
        raise

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

# Test AWS credentials on module load
try:
    print("Testing AWS credentials...")
    s3_client.list_buckets()
    print("AWS credentials verified successfully")
except Exception as e:
    print(f"Warning: AWS credentials verification failed: {str(e)}")