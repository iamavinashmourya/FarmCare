import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pathlib import Path
import jwt
import datetime
from functools import wraps
from bson import ObjectId
from db import (
    create_user, get_user_by_email_or_mobile,
    create_scheme, update_scheme, delete_scheme, get_schemes,
    create_price, update_price, delete_price, get_prices,
    get_historical_prices, create_expert_article, get_expert_articles,
    get_expert_article, update_expert_article, delete_expert_article,
    create_daily_news, get_daily_news, get_daily_news_item,
    update_daily_news, delete_daily_news, users_collection, uploads_collection
)
from s3_utils import upload_to_s3
import requests  # Add this at the top with other imports
import math
from push_notifications import PushNotification
from pymongo import MongoClient
import logging
import re
from werkzeug.security import generate_password_hash

from auth import hash_password, verify_password, validate_password, validate_email

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS with proper settings
CORS(app, resources={
    r"/*": {
        "origins": ["https://myfarmcare.vercel.app", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"],
        "allow_credentials": True,
        "max_age": 3600
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ["https://myfarmcare.vercel.app", "http://localhost:5173"]:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '3600')
    return response

# MongoDB connection
try:
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        raise ValueError("MONGO_URI environment variable not set")
    client = MongoClient(mongo_uri)
    db = client.get_database('farmcare')
    blacklist_collection = db.get_collection('token_blacklist')  # Initialize blacklist collection
    logger.info("Connected to MongoDB successfully!")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    raise

# Root route
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "Welcome to FarmCare API",
        "status": "active",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "auth": {
                "register": "/auth/register",
                "login": "/auth/login"
            },
            "analysis": {
                "upload": "/upload/image",
                "history": "/analysis/history",
                "count": "/user/analysis/count"
            }
        }
    }), 200

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        return jsonify({
            "status": "healthy",
            "message": "Server is running and database is connected",
            "database": "connected",
            "api": "running"
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "message": str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    logger.warning(f"Route not found: {request.url}")
    return jsonify({
        "error": "Not Found",
        "message": "The requested URL was not found on the server",
        "status": 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({
        "error": "Internal Server Error",
        "message": "An internal server error occurred",
        "status": 500
    }), 500

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"An error occurred: {error}")
    return jsonify({
        "error": str(error.__class__.__name__),
        "message": str(error),
        "status": 500
    }), 500

# Set JWT Secret Key
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

# Configure Google Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

generation_config = {
    "temperature": 0.4,
    "top_p": 1,
    "top_k": 32,
    "max_output_tokens": 4096,
}

safety_settings = [
    {"category": f"HARM_CATEGORY_{category}", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
    for category in ["HARASSMENT", "HATE_SPEECH", "SEXUALLY_EXPLICIT", "DANGEROUS_CONTENT"]
]

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    safety_settings=safety_settings,
)

def read_image_data(file_path):
    image_path = Path(file_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Could not find image: {image_path}")
    return {"mime_type": "image/jpeg", "data": image_path.read_bytes()}

def generate_gemini_response(prompt, image_path):
    image_data = read_image_data(image_path)
    response = model.generate_content([prompt, image_data])
    return response.text

# Initial input prompt for plant disease detection
input_prompt = '''
As a highly skilled plant pathologist, provide simple and easy-to-understand advice for farmers. Use basic language and clear explanations. Avoid technical terms where possible, and when you must use them, explain their meaning in simple words.

**Guidelines for Simple Analysis:**

1. **What is the Problem:**
   - Name the disease in simple terms
   - Describe what it looks like in everyday language
   - Use familiar words to explain which parts of the plant are affected

2. **Why it Happened:**
   - Explain the causes in simple terms
   - Describe signs that farmers can easily spot
   - Use examples that farmers will understand

3. **How to Fix It:**
   - Give step-by-step solutions
   - Start with simple, low-cost solutions
   - Explain what to do first, second, and third

4. **How to Prevent it Next Time:**
   - Simple tips for preventing the problem
   - Easy-to-follow daily or weekly tasks
   - Clear warning signs to watch for

5. **Treatment Options:**
   - List common medicines (both chemical and natural)
   - Give local names where possible
   - Mention costs in Indian Rupees (₹)
   - Simple instructions for using treatments safely

6. **Where to Get Help:**
   - Local Krishi Vigyan Kendra (KVK) location and contact
   - Available government help for buying medicines
   - Names of local agriculture officers
   - Where to buy safe and genuine medicines

**Safety Note:**
*"This advice is to help you understand your plant's problem. For safety, please:
- Show this information to your local agriculture officer
- Buy medicines only from authorized shops
- Follow all safety rules when using medicines
- Ask for help if you're unsure about anything"*

Please look at the plant image and give advice that any farmer can easily understand and use.
'''

def token_required(f):
    """Decorator to check if a request has a valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token_header = request.headers.get("Authorization")
        if not token_header or not token_header.startswith("Bearer "):
            return jsonify({"error": "Token is missing or invalid"}), 401

        token = token_header.split(" ")[1]  # Extract actual token
        
        try:
            decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.user = decoded_data  # Attach user data to request
            print(f"Decoded Token: {decoded_data}")  # Debugging
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to check if the user has admin privileges"""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if not request.user.get("is_admin"):
            return jsonify({"error": "Admin privileges required"}), 403
        return f(*args, **kwargs)
    return decorated

def user_or_admin_required(f):
    """Decorator to check if a request has a valid user or admin token"""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        # Both users and admins can access these routes
        return f(*args, **kwargs)
    return decorated

# Dictionary of Indian states and their regions/cities
INDIAN_STATES_AND_REGIONS = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Raigarh', 'Durg'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar'],
    'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Kullu', 'Mandi', 'Solan'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'],
    'Manipur': ['Imphal', 'Thoubal', 'Kakching', 'Ukhrul', 'Churachandpur'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
    'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie', 'Haldwani'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Darjeeling'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Leh'],
    'Ladakh': ['Leh', 'Kargil', 'Diskit', 'Zanskar', 'Nubra'],
    'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    'Andaman and Nicobar Islands': ['Port Blair', 'Car Nicobar', 'Havelock', 'Diglipur'],
    'Chandigarh': ['Chandigarh'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
    'Lakshadweep': ['Kavaratti', 'Agatti', 'Amini', 'Andrott']
}

@app.route('/user/register', methods=['POST'])
def user_register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'mobile', 'password', 'state', 'region']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Validate full name (at least two words)
        if len(data['full_name'].split()) < 2:
            return jsonify({'error': 'Full name must include first and last name'}), 400

        # Validate mobile number (exactly 10 digits)
        if not re.match(r'^\d{10}$', data['mobile']):
            return jsonify({'error': 'Mobile number must be exactly 10 digits'}), 400

        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate password
        if not validate_password(data['password']):
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400

        # Check if user already exists
        existing_user = get_user_by_email_or_mobile(data['email'], data['mobile'])
        if existing_user:
            return jsonify({'error': 'User with this email or mobile already exists'}), 409

        # Create new user
        hashed_password = hash_password(data['password'])
        user = create_user(
            full_name=data['full_name'],
            email=data['email'],
            mobile=data['mobile'],
            password=hashed_password,
            is_admin=False,
            state=data['state'],
            region=data['region']
        )
        
        return jsonify({
            'message': 'Registration successful',
            'user_id': str(user['_id'])
        }), 201

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@app.route('/user/login', methods=['POST'])
def user_login():
    """Authenticate regular user and return JWT token"""
    data = request.get_json()
    login_id = data.get("login_id")  # Can be email or mobile
    password = data.get("password")

    if not login_id or not password:
        return jsonify({"error": "Email/Mobile and password required"}), 400

    user = get_user_by_email_or_mobile(login_id, login_id)
    if not user or not verify_password(password, user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    if user.get("is_admin", False):
        return jsonify({"error": "Please use admin login"}), 401

    # Generate JWT token for regular user with 10 days expiration
    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "is_admin": False,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=10)
        },
        app.config['SECRET_KEY'],
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "full_name": user["full_name"],
            "email": user["email"],
            "mobile": user["mobile"],
            "profile_image": user.get("profile_image", {
                "collection": "initials",
                "seed": user["full_name"],
                "url": f"https://api.dicebear.com/6.x/initials/svg?seed={user['full_name']}"
            })
        }
    }), 200

@app.route('/user/logout', methods=['POST'])
@token_required
def user_logout():
    """Handle user logout"""
    try:
        # Get the token from the request
        token = request.headers.get('Authorization').split(' ')[1]
        
        # Add token to blacklist in database
        blacklist_token(token)
        
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Logout failed"}), 400

def blacklist_token(token):
    """Add token to blacklist collection"""
    try:
        blacklist_collection.insert_one({
            "token": token,
            "created_at": datetime.datetime.utcnow()
        })
    except Exception as e:
        print(f"Error blacklisting token: {e}")
        raise

@app.before_request
def verify_token_not_blacklisted():
    """Check if token is blacklisted before processing request"""
    if request.endpoint and request.endpoint != 'user_login' and request.endpoint != 'user_register':
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                # Check if token is blacklisted
                if blacklist_collection.find_one({"token": token}):
                    return jsonify({"error": "Token has been revoked"}), 401
            except:
                pass

@app.route('/user/profile', methods=['GET'])
@token_required
def get_profile():
    """Get user profile information"""
    try:
        user_id = request.user["user_id"]
        print(f"Getting profile for user_id: {user_id}")
        
        # Get user data
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        print(f"User found: {user is not None}")
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "user": {
                "full_name": user["full_name"],
                "email": user["email"],
                "mobile": user["mobile"],
                "state": user.get("state", "Delhi"),
                "region": user.get("region", "New Delhi"),
                "profile_image": user.get("profile_image", {
                    "collection": "initials",
                    "seed": user["full_name"],
                    "url": f"https://api.dicebear.com/6.x/initials/svg?seed={user['full_name']}"
                })
            }
        }), 200

    except Exception as e:
        print(f"Error getting profile: {str(e)}")
        return jsonify({"error": "Failed to get profile"}), 500

@app.route('/user/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile information"""
    try:
        data = request.get_json()
        user_id = request.user["user_id"]
        
        print(f"Updating profile for user_id: {user_id}")
        print(f"Update data received: {data}")
        
        # Get current user data
        current_user = users_collection.find_one({"_id": ObjectId(user_id)})
        print(f"Current user found: {current_user is not None}")
        
        if not current_user:
            return jsonify({"error": "User not found"}), 404

        # Create update dictionary
        update_data = {}
        
        # Handle full name update
        if "full_name" in data:
            update_data["full_name"] = data["full_name"]
        
        # Handle email update
        if "email" in data and data["email"] != current_user["email"]:
            is_valid_email, email_error = validate_email(data["email"])
            if not is_valid_email:
                return jsonify({"error": email_error}), 400
                
            # Check if email is already in use
            existing_user = users_collection.find_one({
                "_id": {"$ne": ObjectId(user_id)},
                "email": data["email"]
            })
            if existing_user:
                return jsonify({"error": "Email is already in use"}), 400
            update_data["email"] = data["email"]

        # Handle password update
        if "new_password" in data:
            if not data.get("current_password"):
                return jsonify({"error": "Current password is required"}), 400
                
            if not verify_password(data["current_password"], current_user["password"]):
                return jsonify({"error": "Current password is incorrect"}), 400
                
            # Validate new password
            is_valid_password, password_error = validate_password(data["new_password"])
            if not is_valid_password:
                return jsonify({"error": password_error}), 400
                
            # Hash new password
            update_data["password"] = hash_password(data["new_password"])

        # Handle state and region updates
        if "state" in data:
            update_data["state"] = data["state"]
        if "region" in data:
            update_data["region"] = data["region"]

        # Explicitly ignore mobile number updates
        if "mobile" in data:
            print("Mobile number update attempted but ignored as it's not allowed")

        if not update_data:
            return jsonify({"error": "No updates provided"}), 400

        print(f"Update data to be applied: {update_data}")

        # Add updated timestamp
        update_data["updated_at"] = datetime.datetime.utcnow()

        # Update user data
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        print(f"Update result - matched_count: {result.matched_count}, modified_count: {result.modified_count}")

        if result.modified_count == 0:
            return jsonify({"error": "No changes made to profile"}), 400

        # Get updated user data
        updated_user = users_collection.find_one({"_id": ObjectId(user_id)})
        print(f"Updated user retrieved: {updated_user is not None}")
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "full_name": updated_user["full_name"],
                "email": updated_user["email"],
                "mobile": updated_user["mobile"],
                "state": updated_user["state"],
                "region": updated_user["region"],
                "profile_image": updated_user.get("profile_image", {
                    "collection": "initials",
                    "seed": updated_user["full_name"],
                    "url": f"https://api.dicebear.com/6.x/initials/svg?seed={updated_user['full_name']}"
                })
            }
        }), 200

    except Exception as e:
        print(f"Error updating profile - Full error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Failed to update profile"}), 500

@app.route('/user/profile/image', methods=['POST'])
@token_required
def update_profile_image():
    """Update user's profile image"""
    try:
        print(f"Processing profile image update for user_id: {request.user['user_id']}")
        print(f"Request method: {request.method}")
        print(f"Request headers: {dict(request.headers)}")
        print(f"Request files: {request.files}")
        
        if 'image' not in request.files:
            print("No image file in request")
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if not file.filename:
            print("No selected filename")
            return jsonify({"error": "No selected file"}), 400

        print(f"Received file: {file.filename}")
        
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        if '.' not in file.filename or \
           file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            print(f"Invalid file type: {file.filename}")
            return jsonify({"error": "Invalid file type. Allowed types: JPG, PNG, GIF, WEBP"}), 400

        # Read file content
        file_content = file.read()
        file_size = len(file_content)
        print(f"File size: {file_size} bytes")
        
        # Check file size (limit to 5MB)
        if file_size > 5 * 1024 * 1024:  # 5MB in bytes
            print(f"File too large: {file_size} bytes")
            return jsonify({"error": "File size too large. Maximum size: 5MB"}), 400
        
        # Upload to S3
        try:
            print("Attempting S3 upload...")
            image_url, image_key = upload_to_s3(file_content, file.filename)
            print(f"S3 upload successful. URL: {image_url}")
        except Exception as e:
            print(f"S3 upload failed: {str(e)}")
            return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

        # Update user's profile image in database
        try:
            print("Updating user profile in database...")
            result = users_collection.update_one(
                {"_id": ObjectId(request.user["user_id"])},
                {
                    "$set": {
                        "profile_image": {
                            "url": image_url,
                            "key": image_key
                        },
                        "updated_at": datetime.datetime.utcnow()
                    }
                }
            )
            print(f"Database update result - matched_count: {result.matched_count}, modified_count: {result.modified_count}")
            
            if result.matched_count == 0:
                print("User not found in database")
                return jsonify({"error": "User not found"}), 404
                
            if result.modified_count == 0:
                print("No changes made to database")
                return jsonify({"error": "Failed to update profile image in database"}), 500
                
        except Exception as e:
            print(f"Database update failed: {str(e)}")
            return jsonify({"error": "Failed to update profile image in database"}), 500

        return jsonify({
            "message": "Profile image updated successfully",
            "profile_image": {
                "url": image_url,
                "key": image_key
            }
        }), 200

    except Exception as e:
        print(f"Error updating profile image - Full error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Failed to update profile image"}), 500

@app.route('/admin/register', methods=['POST'])
def admin_register():
    """Register a new admin user"""
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    mobile = data.get("mobile")
    password = data.get("password")
    admin_key = data.get("admin_key")  # Special key required for admin registration

    if not all([full_name, email, mobile, password, admin_key]):
        return jsonify({"error": "All fields are required"}), 400

    # Verify admin registration key
    if admin_key != os.getenv("ADMIN_REGISTRATION_KEY"):
        return jsonify({"error": "Invalid admin registration key"}), 403

    if get_user_by_email_or_mobile(email, mobile):
        return jsonify({"error": "Admin already exists"}), 400

    hashed_password = hash_password(password)
    # Create admin user (is_admin=True)
    create_user(full_name, email, mobile, hashed_password, is_admin=True)

    return jsonify({"message": "Admin registered successfully"}), 201

@app.route('/admin/login', methods=['POST'])
def admin_login():
    """Authenticate admin user and return JWT token"""
    data = request.get_json()
    login_id = data.get("login_id")  # Can be email or mobile
    password = data.get("password")

    if not login_id or not password:
        return jsonify({"error": "Email/Mobile and password required"}), 400

    user = get_user_by_email_or_mobile(login_id, login_id)
    if not user or not verify_password(password, user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.get("is_admin", False):
        return jsonify({"error": "Not an admin user"}), 403

    # Generate JWT token for admin
    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "is_admin": True,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=5)
        },
        app.config['SECRET_KEY'],
        algorithm="HS256"
    )

    return jsonify({
        "message": "Admin login successful",
        "token": token,
        "user": {
            "full_name": user["full_name"],
            "email": user["email"],
            "mobile": user["mobile"]
        }
    }), 200

# Public Routes (No Authentication Required)
@app.route('/schemes', methods=['GET'])
def get_schemes_route():
    """Get all schemes, optionally filtered by state (Public Access)"""
    state = request.args.get('state')
    try:
        schemes = get_schemes(state)
        return jsonify({"schemes": schemes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/prices', methods=['GET'])
def get_prices_route():
    """Get all prices, optionally filtered by state and region (Public Access)"""
    try:
        state = request.args.get('state')
        region = request.args.get('region')
        prices = get_prices(state, region)
        
        # Add trend and change calculation for each price
        for price in prices:
            # Get historical data for trend calculation (last week's price)
            last_week = datetime.datetime.now() - datetime.timedelta(days=7)
            historical_prices = get_prices(
                state=price['state'],
                region=price['region'],
                crop_name=price['crop_name'],
                before_date=last_week
            )
            
            if historical_prices:
                old_price = historical_prices[0]['price']
                current_price = price['price']
                change = ((current_price - old_price) / old_price) * 100
                price['trend'] = 'up' if change > 0 else 'down' if change < 0 else 'stable'
                price['change'] = round(abs(change), 1)
            else:
                price['trend'] = 'stable'
                price['change'] = 0
        
        return jsonify({"prices": prices}), 200
    except Exception as e:
        logger.error(f"Error fetching prices: {str(e)}")
        return jsonify({"error": "Failed to fetch prices"}), 500

@app.route('/api/market-prices', methods=['GET'])
def get_market_prices_route():
    """Get market prices based on location and calculate distance"""
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        
        # Get all prices first
        prices = get_prices()
        
        # If location is provided, calculate distances and sort by proximity
        if lat and lng:
            for price in prices:
                # Calculate distance if market has coordinates
                if 'latitude' in price and 'longitude' in price:
                    distance = calculate_distance(
                        lat1=lat,
                        lon1=lng,
                        lat2=price['latitude'],
                        lon2=price['longitude']
                    )
                    price['distance'] = round(distance, 2)
                else:
                    price['distance'] = None
            
            # Sort prices by distance if available
            prices.sort(key=lambda x: (x['distance'] is None, x['distance']))
        
        return jsonify({"prices": prices}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/prices', methods=['POST'])
def create_price_route():
    """Create a new price entry (Admin Access)"""
    try:
        data = request.get_json()
        required_fields = ['crop_name', 'price', 'state', 'region']
        
        # Validate required fields
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Set default date if not provided
        if 'date_effective' not in data:
            data['date_effective'] = datetime.datetime.now().strftime('%Y-%m-%d')
        
        price_id = create_price(
            crop_name=data['crop_name'],
            price=float(data['price']),
            state=data['state'],
            region=data['region'],
            date_effective=data['date_effective'],
            image_url=data.get('image_url'),
            market=data.get('market'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
        
        # Send notifications to users in the region
        PushNotification.notify_users_in_region(
            data['region'],
            {
                "crop_name": data['crop_name'],
                "price": float(data['price']),
                "region": data['region']
            },
            "market_price"
        )
        
        return jsonify({"message": "Price created successfully", "id": price_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# User Routes (Requires User Authentication)
@app.route('/user/upload', methods=['POST'])
@user_or_admin_required
def upload_image():
    """Upload an image and process it with Gemini AI (User Access)"""
    try:
        print("Received upload request")
        if 'file' not in request.files:
            print("No file in request")
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("Empty filename")
            return jsonify({"error": "No selected file"}), 400
            
        # Validate file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        if '.' not in file.filename or \
           file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            print(f"Invalid file type: {file.filename}")
            return jsonify({"error": "Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, WEBP"}), 400

        # Create uploads directory if it doesn't exist
        if not os.path.exists("uploads"):
            os.makedirs("uploads")
        
        file_path = os.path.join("uploads", file.filename)
        file.save(file_path)  # Save the uploaded file
        print(f"File saved to {file_path}")

        try:
            response_text = generate_gemini_response(input_prompt, file_path)
            result = {
                "file_path": file_path, 
                "analysis": response_text,
                "user_id": request.user["user_id"]
            }
            print("Analysis completed successfully")
            return jsonify(result), 200
        except Exception as e:
            print(f"Error in analysis: {str(e)}")
            return jsonify({"error": f"Analysis failed: {str(e)}"}), 500
        finally:
            # Clean up the uploaded file
            try:
                os.remove(file_path)
                print(f"Cleaned up file {file_path}")
            except Exception as e:
                print(f"Error cleaning up file: {str(e)}")

    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Admin Routes (Requires Admin Authentication)
@app.route('/admin/schemes', methods=['POST'])
@admin_required
def add_scheme():
    """Add a new government scheme (Admin Only)"""
    data = request.get_json()
    required_fields = ['name', 'description', 'eligibility', 'benefits', 'state']
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        scheme_id = create_scheme(
            data['name'],
            data['description'],
            data['eligibility'],
            data['benefits'],
            data['state']
        )
        # Send notifications to users in the region
        PushNotification.notify_users_in_region(
            data['state'],
            {
                "name": data['name'],
                "description": data['description'],
                "state": data['state']
            },
            "govt_scheme"
        )
        return jsonify({
            "message": "Scheme created successfully", 
            "scheme_id": scheme_id,
            "admin_id": request.user["user_id"]
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/schemes/<scheme_id>', methods=['PUT'])
@admin_required
def update_scheme_route(scheme_id):
    """Update an existing scheme (Admin Only)"""
    data = request.get_json()
    try:
        update_scheme(scheme_id, data)
        # Send notifications to users in the region
        PushNotification.notify_users_in_region(
            data['state'],
            {
                "name": data['name'],
                "description": data['description'],
                "state": data['state']
            },
            "govt_scheme"
        )
        return jsonify({
            "message": "Scheme updated successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/schemes/<scheme_id>', methods=['DELETE'])
@admin_required
def delete_scheme_route(scheme_id):
    """Delete a scheme (Admin Only)"""
    try:
        delete_scheme(scheme_id)
        return jsonify({
            "message": "Scheme deleted successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/prices', methods=['POST'])
@admin_required
def add_price():
    """Add a new crop price with image (Admin Only)"""
    try:
        # Get form data
        data = request.form.to_dict()
        file = request.files.get('image')
        
        # Debug print
        print("Received data:", data)
        print("Required fields:", ['crop_name', 'price', 'state', 'region', 'date_effective'])
        
        # Validate required fields
        required_fields = ['crop_name', 'price', 'state', 'region', 'date_effective']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }), 400
        
        # Validate price format
        try:
            price = float(data['price'])
            if price <= 0:
                return jsonify({"error": "Price must be greater than 0"}), 400
        except ValueError:
            return jsonify({"error": "Invalid price format"}), 400
        
        # Validate date format
        try:
            datetime.datetime.strptime(data['date_effective'], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        # Handle image upload if provided
        image_url = None
        image_key = None
        if file:
            try:
                file_content = file.read()
                image_url, image_key = upload_to_s3(file_content, file.filename)
            except Exception as e:
                return jsonify({"error": f"Image upload failed: {str(e)}"}), 400
        
        # Create price entry
        price_id = create_price(
            data['crop_name'],
            price,
            data['state'],
            data['region'],
            data['date_effective'],
            image_url,
            image_key
        )
        
        # Send notifications to users in the region
        PushNotification.notify_users_in_region(
            data['region'],
            {
                "crop_name": data['crop_name'],
                "price": price,
                "region": data['region']
            },
            "market_price"
        )
        
        return jsonify({
            "message": "Price created successfully",
            "price_id": price_id,
            "admin_id": request.user["user_id"],
            "image_url": image_url
        }), 201
        
    except Exception as e:
        print(f"Error in add_price: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/admin/prices/<price_id>', methods=['PUT'])
@admin_required
def update_price_route(price_id):
    """Update an existing price entry (Admin Only)"""
    try:
        data = request.form.to_dict()
        file = request.files.get('image')
        
        # Handle image upload if provided
        if file:
            try:
                file_content = file.read()
                image_url, image_key = upload_to_s3(file_content, file.filename)
                data['image_url'] = image_url
                data['image_key'] = image_key
            except Exception as e:
                return jsonify({"error": f"Image upload failed: {str(e)}"}), 400
        
        # Convert price to float if provided
        if 'price' in data:
            try:
                data['price'] = float(data['price'])
            except ValueError:
                return jsonify({"error": "Invalid price value"}), 400
        
        # Get the current price data before update
        current_price = get_prices(price_id=price_id)[0]
        
        # Update price
        update_price(price_id, data)
        
        # Send notifications to users in the region if price has changed
        if 'price' in data and data['price'] != current_price['price']:
            PushNotification.notify_users_in_region(
                current_price['region'],
                {
                    "crop_name": current_price['crop_name'],
                    "price": data['price'],
                    "region": current_price['region'],
                    "change": round(((data['price'] - current_price['price']) / current_price['price']) * 100, 1),
                    "old_price": current_price['price']
                },
                "market_price"
            )
        
        return jsonify({
            "message": "Price updated successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/prices/<price_id>', methods=['DELETE'])
@admin_required
def delete_price_route(price_id):
    """Delete a price (Admin Only)"""
    try:
        delete_price(price_id)
        return jsonify({
            "message": "Price deleted successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Add this after other routes
@app.route('/weather', methods=['GET'])
def get_weather():
    """Get detailed weather data for agriculture"""
    try:
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        logger.info(f"Weather request received for coordinates: lat={lat}, lon={lon}")
        
        if not lat or not lon:
            logger.warning("Missing coordinates in weather request")
            return jsonify({"error": "Location coordinates required"}), 400

        # Using OpenWeatherMap API for detailed weather data
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if not api_key:
            logger.error("OpenWeather API key not configured")
            return jsonify({"error": "Weather API key not configured"}), 500

        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"

        logger.info("Fetching weather data from OpenWeatherMap API")
        
        # Get current weather and forecast
        weather_response = requests.get(weather_url, timeout=5)
        forecast_response = requests.get(forecast_url, timeout=5)

        if weather_response.status_code != 200 or forecast_response.status_code != 200:
            logger.error(f"OpenWeatherMap API error - Weather status: {weather_response.status_code}, Forecast status: {forecast_response.status_code}")
            return jsonify({"error": "Failed to fetch weather data from external service"}), 500

        weather_data = weather_response.json()
        forecast_data = forecast_response.json()

        logger.info("Successfully fetched weather data")

        # Calculate agricultural metrics
        agricultural_metrics = {
            "growing_degree_days": max(0, (weather_data["main"]["temp_max"] + weather_data["main"]["temp_min"]) / 2 - 10),
            "evapotranspiration": calculate_evapotranspiration(weather_data),
            "frost_risk": "High" if weather_data["main"]["temp"] < 2 else "Low",
            "irrigation_need": calculate_irrigation_need(weather_data)
        }

        # Format forecast data
        formatted_forecast = [
            {
                "date": item["dt_txt"],
                "temperature": item["main"]["temp"],
                "humidity": item["main"]["humidity"],
                "description": item["weather"][0]["description"],
                "wind_speed": item["wind"]["speed"],
                "rainfall_chance": item["pop"] * 100  # Probability of precipitation
            }
            for item in forecast_data["list"][:8]  # Next 24 hours (3-hour intervals)
        ]

        # Generate farming advice
        farming_advice = generate_farming_advice(weather_data, forecast_data)

        # Combine all data
        agricultural_weather = {
            "current": {
                "temperature": weather_data["main"]["temp"],
                "humidity": weather_data["main"]["humidity"],
                "wind_speed": weather_data["wind"]["speed"],
                "description": weather_data["weather"][0]["description"],
                "rainfall": weather_data.get("rain", {}).get("1h", 0),
                "soil_temp": weather_data["main"]["temp"] - 2,  # Approximate soil temperature
            },
            "agricultural_metrics": agricultural_metrics,
            "forecast": formatted_forecast,
            "farming_advice": {
                "risk_indicator": farming_advice["risk_indicator"],
                "weather_summary": farming_advice["weather_summary"],
                "recommendations": farming_advice["advice"]
            }
        }

        logger.info("Successfully processed weather data")
        return jsonify(agricultural_weather), 200

    except requests.Timeout:
        logger.error("Timeout while fetching weather data")
        return jsonify({"error": "Weather service timeout. Please try again."}), 504
    except Exception as e:
        logger.error(f"Error processing weather data: {str(e)}")
        return jsonify({"error": "Failed to process weather data"}), 500

def calculate_evapotranspiration(weather_data):
    """Simple estimation of evapotranspiration"""
    temp = weather_data["main"]["temp"]
    humidity = weather_data["main"]["humidity"]
    wind_speed = weather_data["wind"]["speed"]
    
    # Basic estimation formula
    et = (0.0023 * (temp + 17.8) * (max(0, temp - 0.0) ** 0.5)) * (100 - humidity) / 100
    return round(max(0, et), 2)

def calculate_irrigation_need(weather_data):
    """Calculate irrigation needs based on weather"""
    temp = weather_data["main"]["temp"]
    humidity = weather_data["main"]["humidity"]
    rainfall = weather_data.get("rain", {}).get("1h", 0)
    
    if rainfall > 5:
        return "No irrigation needed - Recent rainfall sufficient"
    elif temp > 30 and humidity < 50:
        return "High - Consider immediate irrigation"
    elif temp > 25:
        return "Moderate - Monitor soil moisture"
    else:
        return "Low - Regular schedule adequate"

def generate_farming_advice(weather_data, forecast_data):
    """Generate AI-based farming advice based on current weather conditions and forecast"""
    try:
        temp = weather_data["main"]["temp"]
        humidity = weather_data["main"]["humidity"]
        wind_speed = weather_data["wind"]["speed"]
        description = weather_data["weather"][0]["description"]
        rainfall = weather_data.get("rain", {}).get("1h", 0)
        
        # Get forecast data for next 24 hours
        next_24h_forecast = forecast_data["list"][:8]  # 3-hour intervals
        
        advice = []
        risk_level = "low"
        
        # Temperature-based advice
        if temp > 35:
            risk_level = "high"
            advice.extend([
                "High Temperature Alert:",
                "• Use shade nets or temporary covers to protect sensitive crops",
                "• Increase irrigation frequency but reduce water quantity per session",
                "• Apply mulching to retain soil moisture",
                "• Best time for irrigation: Early morning or late evening",
                "• Monitor for heat stress symptoms in plants"
            ])
        elif temp < 5:
            risk_level = "high"
            advice.extend([
                "Cold Temperature Alert:",
                "• Cover sensitive crops with row covers or frost protection sheets",
                "• Maintain soil moisture to prevent frost damage",
                "• Delay fertilizer application until temperature rises",
                "• Monitor for cold damage symptoms",
                "• Consider using cold frames for vulnerable seedlings"
            ])
        
        # Humidity-based advice
        if humidity > 80:
            risk_level = "moderate" if risk_level == "low" else risk_level
            advice.extend([
                "High Humidity Management:",
                "• Monitor for fungal disease development",
                "• Increase plant spacing for better air circulation",
                "• Consider preventive fungicide application",
                "• Avoid overhead irrigation",
                "• Remove affected leaves to prevent disease spread"
            ])
        elif humidity < 30:
            risk_level = "moderate" if risk_level == "low" else risk_level
            advice.extend([
                "Low Humidity Management:",
                "• Increase irrigation frequency",
                "• Apply mulching to conserve soil moisture",
                "• Consider drip irrigation implementation",
                "• Best times for crop operations: Early morning or late evening",
                "• Monitor for signs of water stress"
            ])
        
        # Wind-based advice
        if wind_speed > 20:
            risk_level = "high"
            advice.extend([
                "Strong Wind Advisory:",
                "• Delay pesticide/fertilizer spraying",
                "• Provide wind breaks for vulnerable crops",
                "• Check and reinforce crop support structures",
                "• Monitor for physical damage to crops",
                "• Consider emergency irrigation if soil is drying"
            ])
        
        # Rain-based advice
        if rainfall > 5:
            risk_level = "moderate" if risk_level == "low" else risk_level
            advice.extend([
                "Rainfall Management:",
                "• Hold off on irrigation for next 24-48 hours",
                "• Monitor soil drainage in low-lying areas",
                "• Check for water logging and improve drainage if needed",
                "• Delay fertilizer application",
                "• Watch for signs of root diseases"
            ])
        
        # Forecast-based advice
        forecast_conditions = [item["weather"][0]["main"] for item in next_24h_forecast]
        if "Rain" in forecast_conditions:
            advice.extend([
                "Rain Expected in Next 24 Hours:",
                "• Plan harvesting activities accordingly",
                "• Prepare drainage systems",
                "• Delay any planned chemical applications",
                "• Consider protective covering for sensitive crops",
                "• Have equipment ready for water management"
            ])
        
        # General advice based on weather description
        if "clear" in description.lower():
            advice.extend([
                "Clear Weather Operations:",
                "• Ideal time for pest monitoring",
                "• Good conditions for spraying operations",
                "• Consider soil moisture management",
                "• Optimal time for harvesting operations"
            ])
        elif "cloud" in description.lower():
            advice.extend([
                "Cloudy Conditions Management:",
                "• Good time for transplanting activities",
                "• Monitor humidity levels",
                "• Check for pest presence under leaves",
                "• Ideal conditions for foliar applications"
            ])
        
        # Add risk level indicator
        risk_indicator = {
            "low": "Low Risk - Regular monitoring sufficient",
            "moderate": "Moderate Risk - Increased vigilance needed",
            "high": "High Risk - Immediate attention required"
        }
        
        return {
            "risk_level": risk_level,
            "risk_indicator": risk_indicator[risk_level],
            "weather_summary": f"Current Conditions: {description.capitalize()}, {temp}°C, {humidity}% Humidity, Wind {wind_speed}m/s",
            "advice": advice if advice else ["No specific farming advice needed for current conditions. Continue regular monitoring."]
        }
        
    except Exception as e:
        logger.error(f"Error generating farming advice: {str(e)}")
        return {
            "risk_level": "unknown",
            "risk_indicator": "Risk Level Unknown",
            "weather_summary": "Weather data unavailable",
            "advice": ["Unable to generate specific farming advice. Please check weather data."]
        }

# Expert Articles Routes
@app.route('/expert-articles', methods=['GET'])
def get_expert_articles_route():
    """Get all expert articles (Public Access)"""
    try:
        category = request.args.get('category')
        articles = get_expert_articles(category)
        return jsonify({"articles": articles}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/expert-articles', methods=['POST'])
@admin_required
def add_expert_article():
    """Add a new expert article (Admin Only)"""
    try:
        # Get form data
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        # Validate required fields
        required_fields = ['title', 'description', 'author', 'category', 'read_time']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }), 400
        
        # Validate and convert read_time to integer
        try:
            read_time = int(data['read_time'])
            if read_time <= 0:
                return jsonify({"error": "Read time must be a positive number"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Read time must be a valid number"}), 400
        
        # Handle image file if present
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            try:
                file_content = file.read()
                image_url, _ = upload_to_s3(file_content, file.filename)
            except Exception as e:
                return jsonify({"error": f"Image upload failed: {str(e)}"}), 400
        
        # Create article
        article_id = create_expert_article(
            title=data['title'],
            description=data['description'],
            author=data['author'],
            category=data['category'],
            read_time=read_time,
            image_url=image_url
        )
        
        # Send notifications to users in the region
        PushNotification.notify_users_in_region(
            data['region'],
            {
                "title": data['title'],
                "description": data['description'],
                "region": data['region']
            },
            "expert_article"
        )
        
        return jsonify({
            "message": "Expert article created successfully",
            "article_id": article_id,
            "admin_id": request.user["user_id"]
        }), 201
        
    except Exception as e:
        print(f"Error in add_expert_article: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/expert-articles/<article_id>', methods=['GET'])
def get_expert_article_route(article_id):
    """Get a specific expert article (Public Access)"""
    try:
        article = get_expert_article(article_id)
        if not article:
            return jsonify({"error": "Article not found"}), 404
        return jsonify({"article": article}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/expert-articles/<article_id>', methods=['PUT'])
@admin_required
def update_expert_article_route(article_id):
    """Update an existing expert article (Admin Only)"""
    try:
        data = request.form.to_dict()
        file = request.files.get('image')
        
        # Handle image upload if provided
        if file:
            try:
                file_content = file.read()
                image_url, _ = upload_to_s3(file_content, file.filename)
                data['image_url'] = image_url
            except Exception as e:
                return jsonify({"error": f"Image upload failed: {str(e)}"}), 400
        
        update_expert_article(article_id, data)
        return jsonify({
            "message": "Expert article updated successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/expert-articles/<article_id>', methods=['DELETE'])
@admin_required
def delete_expert_article_route(article_id):
    """Delete an expert article (Admin Only)"""
    try:
        delete_expert_article(article_id)
        return jsonify({
            "message": "Expert article deleted successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Daily News Routes
@app.route('/admin/daily-news', methods=['POST'])
@admin_required
def add_daily_news():
    """Add a new daily news entry (Admin Only)"""
    try:
        data = request.form.to_dict()
        file = request.files.get('image')
        
        # Validate required fields
        required_fields = ['title', 'description']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing_fields": missing_fields
            }), 400
        
        # Handle image upload if provided
        image_url = None
        if file:
            try:
                file_content = file.read()
                image_url, _ = upload_to_s3(file_content, file.filename)
            except Exception as e:
                return jsonify({"error": f"Image upload failed: {str(e)}"}), 400
        
        # Create news entry
        news_id = create_daily_news(
            title=data['title'],
            description=data['description'],
            image_url=image_url
        )
        
        # Send notifications to users in the region
        PushNotification.notify_users_in_region(
            data['region'],
            {
                "title": data['title'],
                "description": data['description'],
                "region": data['region']
            },
            "daily_news"
        )
        
        return jsonify({
            "message": "Daily news created successfully",
            "news_id": news_id,
            "admin_id": request.user["user_id"]
        }), 201
        
    except Exception as e:
        print(f"Error in add_daily_news: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/daily-news', methods=['GET'])
def get_daily_news_route():
    """Get all daily news entries (Public Access)"""
    try:
        news_list = get_daily_news()
        return jsonify({"news": news_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/daily-news/<news_id>', methods=['GET'])
def get_daily_news_item_route(news_id):
    """Get a specific daily news item (Public Access)"""
    try:
        news = get_daily_news_item(news_id)
        if not news:
            return jsonify({"error": "News item not found"}), 404
        return jsonify({"news": news}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/daily-news/<news_id>', methods=['PUT'])
@admin_required
def update_daily_news_route(news_id):
    """Update an existing daily news entry (Admin Only)"""
    try:
        data = request.form.to_dict()
        file = request.files.get('image')
        
        # Handle image upload if provided
        if file:
            try:
                file_content = file.read()
                image_url, _ = upload_to_s3(file_content, file.filename)
                data['image_url'] = image_url
            except Exception as e:
                return jsonify({"error": f"Image upload failed: {str(e)}"}), 400
        
        update_daily_news(news_id, data)
        return jsonify({
            "message": "Daily news updated successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/admin/daily-news/<news_id>', methods=['DELETE'])
@admin_required
def delete_daily_news_route(news_id):
    """Delete a daily news entry (Admin Only)"""
    try:
        delete_daily_news(news_id)
        return jsonify({
            "message": "Daily news deleted successfully",
            "admin_id": request.user["user_id"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/user/notifications/subscribe', methods=['POST'])
@token_required
def subscribe_push_notifications():
    """Subscribe to push notifications"""
    try:
        data = request.get_json()
        subscription_info = data.get('subscription')
        
        if not subscription_info:
            return jsonify({"error": "Subscription information required"}), 400
            
        # Update user's subscription info
        result = users_collection.update_one(
            {"_id": ObjectId(request.user["user_id"])},
            {
                "$set": {
                    "push_subscription": subscription_info,
                    "notification_preferences": [
                        {"type": "market_price", "enabled": True},
                        {"type": "expert_article", "enabled": True},
                        {"type": "daily_news", "enabled": True},
                        {"type": "govt_scheme", "enabled": True}
                    ]
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update subscription"}), 400
            
        return jsonify({"message": "Successfully subscribed to notifications"}), 200
        
    except Exception as e:
        print(f"Error in subscribe_push_notifications: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/user/notifications/unsubscribe', methods=['POST'])
@token_required
def unsubscribe_push_notifications():
    """Unsubscribe from push notifications"""
    try:
        # Remove subscription info
        result = users_collection.update_one(
            {"_id": ObjectId(request.user["user_id"])},
            {
                "$unset": {
                    "push_subscription": "",
                    "notification_preferences": ""
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to unsubscribe"}), 400
            
        return jsonify({"message": "Successfully unsubscribed from notifications"}), 200
        
    except Exception as e:
        print(f"Error in unsubscribe_push_notifications: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/user/notifications/preferences', methods=['GET'])
@token_required
def get_notification_preferences():
    """Get user's notification preferences"""
    try:
        user = users_collection.find_one({"_id": ObjectId(request.user["user_id"])})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        preferences = user.get("notification_preferences", [])
        return jsonify({"preferences": preferences}), 200
        
    except Exception as e:
        print(f"Error in get_notification_preferences: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/user/notifications/preferences', methods=['PUT'])
@token_required
def update_notification_preferences():
    """Update notification preferences"""
    try:
        data = request.get_json()
        preferences = data.get('preferences')
        
        if not preferences or not isinstance(preferences, list):
            return jsonify({"error": "Invalid preferences format"}), 400
            
        # Validate preferences format
        valid_types = {"market_price", "expert_article", "daily_news", "govt_scheme"}
        for pref in preferences:
            if not isinstance(pref, dict) or \
               'type' not in pref or \
               'enabled' not in pref or \
               pref['type'] not in valid_types:
                return jsonify({"error": "Invalid preference format"}), 400
        
        # Update preferences
        result = users_collection.update_one(
            {"_id": ObjectId(request.user["user_id"])},
            {"$set": {"notification_preferences": preferences}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update preferences"}), 400
            
        return jsonify({"message": "Preferences updated successfully"}), 200
        
    except Exception as e:
        print(f"Error in update_notification_preferences: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/test/notification', methods=['POST'])
@token_required
def test_notification():
    """Test endpoint to send a push notification"""
    try:
        user_id = request.user["user_id"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user or not user.get("push_subscription"):
            return jsonify({"error": "No push subscription found"}), 404

        # Send test notification
        PushNotification.notify_users_in_region(
            user["region"],
            {
                "title": "Test Notification",
                "description": "This is a test notification from FarmCare",
                "region": user["region"]
            },
            "test"
        )
        
        return jsonify({"message": "Test notification sent successfully"}), 200
        
    except Exception as e:
        print(f"Error sending test notification: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/user/analysis/count', methods=['GET'])
@token_required
def get_analysis_count():
    """Get the count of AI analyses done by the user"""
    try:
        user_id = request.user["user_id"]
        print(f"Getting analysis count for user: {user_id}")  # Debug log
        
        # Get uploads count from database
        count = uploads_collection.count_documents({"user_id": user_id})
        print(f"Found {count} uploads for user")  # Debug log
        
        return jsonify({
            "count": count,
            "user_id": user_id
        }), 200
    except Exception as e:
        print(f"Error getting analysis count: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

@app.route('/api/states', methods=['GET'])
def get_states():
    """Get list of all Indian states"""
    try:
        states = list(INDIAN_STATES_AND_REGIONS.keys())
        return jsonify({
            "states": states,
            "count": len(states)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching states: {str(e)}")
        return jsonify({"error": "Failed to fetch states"}), 500

@app.route('/api/regions', methods=['GET'])
def get_regions():
    """Get regions for a specific state"""
    try:
        state = request.args.get('state')
        if not state:
            return jsonify({"error": "State parameter is required"}), 400

        regions = INDIAN_STATES_AND_REGIONS.get(state)
        if not regions:
            return jsonify({"error": f"No regions found for state: {state}"}), 404

        return jsonify({
            "state": state,
            "regions": regions,
            "count": len(regions)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching regions: {str(e)}")
        return jsonify({"error": "Failed to fetch regions"}), 500

if __name__ == '__main__':
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
