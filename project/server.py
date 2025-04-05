import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pathlib import Path
import jwt
import datetime
from functools import wraps
from db import (
    create_user, get_user_by_email_or_mobile,
    create_scheme, update_scheme, delete_scheme, get_schemes,
    create_price, update_price, delete_price, get_prices
)
from s3_utils import upload_to_s3

from auth import hash_password, verify_password

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

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
input_prompt = """
As a highly skilled plant pathologist, your expertise is indispensable in our pursuit of maintaining optimal plant health...
"""

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

@app.route('/user/register', methods=['POST'])
def user_register():
    """Register a new regular user"""
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    mobile = data.get("mobile")
    password = data.get("password")

    if not all([full_name, email, mobile, password]):
        return jsonify({"error": "All fields are required"}), 400

    if get_user_by_email_or_mobile(email, mobile):
        return jsonify({"error": "User already exists"}), 400

    hashed_password = hash_password(password)
    # Create regular user (is_admin=False by default)
    create_user(full_name, email, mobile, hashed_password, is_admin=False)

    return jsonify({"message": "User registered successfully"}), 201

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

    # Generate JWT token for regular user
    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "is_admin": False,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=5)
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
            "mobile": user["mobile"]
        }
    }), 200

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

@app.route('/prices', methods=['GET'])
def get_prices_route():
    """Get all prices, optionally filtered by state and region (Public Access)"""
    state = request.args.get('state')
    region = request.args.get('region')
    try:
        prices = get_prices(state, region)
        return jsonify({"prices": prices}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# User Routes (Requires User Authentication)
@app.route('/user/upload', methods=['POST'])
@user_or_admin_required
def upload_image():
    """Upload an image and process it with Gemini AI (User Access)"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)  # Save the uploaded file

    try:
        response_text = generate_gemini_response(input_prompt, file_path)
        return jsonify({
            "file_path": file_path, 
            "analysis": response_text,
            "user_id": request.user["user_id"]
        }), 200
    except Exception as e:
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
        
        update_price(price_id, data)
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

if __name__ == '__main__':
    if not os.path.exists("uploads"):
        os.makedirs("uploads")  # Ensure uploads directory exists
    app.run(debug=True, port=5000)
