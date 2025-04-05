import hashlib
import re
from typing import Tuple, Optional

def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength
    Returns: (is_valid, error_message)
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    
    return True, None

def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email format
    Returns: (is_valid, error_message)
    """
    email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    if not email_pattern.match(email):
        return False, "Invalid email format"
    return True, None

def validate_mobile(mobile: str) -> Tuple[bool, Optional[str]]:
    """
    Validate mobile number format (Indian format)
    Returns: (is_valid, error_message)
    """
    mobile_pattern = re.compile(r"^[6-9]\d{9}$")
    if not mobile_pattern.match(mobile):
        return False, "Invalid mobile number format (must be 10 digits starting with 6-9)"
    return True, None

def hash_password(password: str) -> str:
    """Hash the password using SHA-256 with salt"""
    # In a production environment, you should use a proper salt
    salt = "farmcare_salt_2024"  # This should be unique per user and stored securely
    salted_password = password + salt
    return hashlib.sha256(salted_password.encode()).hexdigest()

def verify_password(input_password: str, stored_password: str) -> bool:
    """Verify password by comparing hashes"""
    hashed_input = hash_password(input_password)
    return hashed_input == stored_password
