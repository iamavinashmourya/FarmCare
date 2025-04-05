import pymongo
import os
from dotenv import load_dotenv
from bson import ObjectId
import datetime
from typing import Optional, Dict, List, Union
from pymongo import MongoClient
from math import radians, sin, cos, sqrt, atan2
import logging

# Load environment variables
load_dotenv()

# Connect to MongoDB
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["plant_detector"]
users_collection = db["users"]
schemes_collection = db["schemes"]
prices_collection = db["prices"]
uploads_collection = db["uploads"]  # New collection for tracking image uploads
expert_articles_collection = db["expert_articles"]  # New collection for expert articles
daily_news_collection = db["daily_news"]  # New collection for daily news

# Profile image collections and names for DiceBear
PROFILE_IMG_COLLECTIONS = [
    'adventurer', 'adventurer-neutral', 'avataaars', 'avataaars-neutral',
    'big-ears', 'big-ears-neutral', 'big-smile', 'bottts', 'croodles',
    'croodles-neutral', 'fun-emoji', 'icons', 'identicon', 'initials',
    'lorelei', 'lorelei-neutral', 'micah', 'miniavs', 'notionists',
    'notionists-neutral', 'open-peeps', 'personas', 'pixel-art',
    'pixel-art-neutral', 'shapes', 'thumbs'
]

PROFILE_IMG_NAMES = [
    'alice', 'bob', 'charlie', 'david', 'emma', 'frank', 'grace', 'henry',
    'ivy', 'jack', 'karen', 'leo', 'mia', 'nathan', 'olivia', 'peter',
    'quinn', 'rachel', 'sam', 'tara', 'uma', 'victor', 'wendy', 'xander',
    'yara', 'zack'
]

def generate_profile_image():
    """Generate a random profile image URL using DiceBear"""
    import random
    collection = random.choice(PROFILE_IMG_COLLECTIONS)
    name = random.choice(PROFILE_IMG_NAMES)
    return {
        "collection": collection,
        "seed": name,
        "url": f"https://api.dicebear.com/6.x/{collection}/svg?seed={name}"
    }

def get_user_by_email_or_mobile(email: str, mobile: str) -> Optional[Dict]:
    """Find user by email or mobile"""
    try:
        user = users_collection.find_one({"$or": [{"email": email}, {"mobile": mobile}]})
        if user:
            user["_id"] = str(user["_id"])
            # Remove sensitive fields
            user.pop('password', None)
        return user
    except Exception as e:
        logger.error("Database error in get_user_by_email_or_mobile", exc_info=True)
        return None

def create_user(full_name: str, email: str, mobile: str, password: str, is_admin: bool = False, state: str = None, region: str = None) -> Dict:
    """Insert new user into MongoDB"""
    profile_image = generate_profile_image()
    new_user = {
        "full_name": full_name,
        "email": email,
        "mobile": mobile,
        "password": password,
        "is_admin": is_admin,
        "profile_image": profile_image,
        "created_at": datetime.datetime.utcnow(),
        "last_login": None,
        "status": "active",
        "state": state,
        "region": region
    }
    try:
        result = users_collection.insert_one(new_user)
        new_user["_id"] = str(result.inserted_id)
        # Remove sensitive fields before returning
        new_user.pop('password', None)
        return new_user
    except Exception as e:
        logger.error("Database error in create_user", exc_info=True)
        raise

def update_user_profile_image(user_id: str) -> Dict:
    """Update user's profile image"""
    try:
        profile_image = generate_profile_image()
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"profile_image": profile_image}}
        )
        return profile_image
    except Exception as e:
        print(f"Error updating profile image: {e}")
        raise

def update_user_last_login(user_id: str) -> None:
    """Update user's last login timestamp"""
    try:
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"last_login": datetime.datetime.utcnow()}}
        )
    except Exception as e:
        logger.error("Database error in update_user_last_login", exc_info=True)
        raise

# Scheme Management Functions
def create_scheme(name: str, description: str, eligibility: str, benefits: str, state: str) -> str:
    """Create a new government scheme"""
    scheme = {
        "name": name,
        "description": description,
        "eligibility": eligibility,
        "benefits": benefits,
        "state": state,
        "status": "active",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }
    try:
        result = schemes_collection.insert_one(scheme)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating scheme: {e}")
        raise

def update_scheme(scheme_id: str, updates: Dict) -> None:
    """Update an existing scheme"""
    try:
        updates["updated_at"] = datetime.datetime.utcnow()
        result = schemes_collection.update_one(
            {"_id": ObjectId(scheme_id), "status": "active"},
            {"$set": updates}
        )
        if result.matched_count == 0:
            raise ValueError("Active scheme not found")
    except Exception as e:
        print(f"Error updating scheme: {e}")
        raise

def delete_scheme(scheme_id: str) -> None:
    """Hard delete a scheme from the database"""
    try:
        result = schemes_collection.delete_one({"_id": ObjectId(scheme_id)})
        if result.deleted_count == 0:
            raise ValueError("Scheme not found")
    except Exception as e:
        print(f"Error deleting scheme: {e}")
        raise

def get_schemes(state: Optional[str] = None) -> List[Dict]:
    """Get all schemes, optionally filtered by state"""
    try:
        query = {}
        if state:
            query["state"] = state
        
        schemes = list(schemes_collection.find(query))
        for scheme in schemes:
            scheme["_id"] = str(scheme["_id"])
            scheme["created_at"] = scheme["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            scheme["updated_at"] = scheme["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
        return schemes
    except Exception as e:
        print(f"Error getting schemes: {e}")
        raise

# Crop Price Management Functions
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance

def get_prices(state: Optional[str] = None, region: Optional[str] = None, 
               crop_name: Optional[str] = None, before_date: Optional[datetime.datetime] = None) -> List[Dict]:
    """Get all prices, optionally filtered by state, region, crop_name and date"""
    try:
        query = {}
        if state:
            query["state"] = state
        if region:
            query["region"] = region
        if crop_name:
            query["crop_name"] = crop_name
        if before_date:
            query["date_effective"] = {"$lte": before_date}
        
        prices = list(prices_collection.find(query).sort("date_effective", -1))
        
        # Convert ObjectId and dates to string format
        for price in prices:
            price["_id"] = str(price["_id"])
            if "date_effective" in price:
                price["date_effective"] = price["date_effective"].strftime("%Y-%m-%d")
            if "created_at" in price:
                price["created_at"] = price["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            if "updated_at" in price:
                price["updated_at"] = price["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
            
            # Add market name if not present
            if "market" not in price:
                price["market"] = price["region"]
                
        return prices
    except Exception as e:
        print(f"Error getting prices: {e}")
        raise

def create_price(crop_name: str, price: float, state: str, region: str, 
                 date_effective: str, image_url: Optional[str] = None,
                 market: Optional[str] = None, latitude: Optional[float] = None,
                 longitude: Optional[float] = None) -> str:
    """Create a new price entry"""
    try:
        price_data = {
            "crop_name": crop_name,
            "price": price,
            "state": state,
            "region": region,
            "market": market or region,
            "date_effective": datetime.datetime.strptime(date_effective, "%Y-%m-%d"),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        if image_url:
            price_data["image_url"] = image_url
        if latitude is not None and longitude is not None:
            price_data["latitude"] = latitude
            price_data["longitude"] = longitude

        result = prices_collection.insert_one(price_data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating price: {e}")
        raise

def update_price(price_id: str, updates: Dict) -> None:
    """Update an existing price entry"""
    try:
        if "price" in updates:
            updates["price"] = float(updates["price"])
        if "date_effective" in updates:
            updates["date_effective"] = datetime.datetime.strptime(updates["date_effective"], "%Y-%m-%d")
        
        updates["updated_at"] = datetime.datetime.utcnow()
        result = prices_collection.update_one(
            {"_id": ObjectId(price_id)},
            {"$set": updates}
        )
        if result.matched_count == 0:
            raise ValueError("Price entry not found")
    except Exception as e:
        print(f"Error updating price: {e}")
        raise

def delete_price(price_id: str) -> None:
    """Delete a price entry and its associated image"""
    try:
        # Get the price entry to get the image key
        price_entry = prices_collection.find_one({"_id": ObjectId(price_id)})
        if not price_entry:
            raise ValueError("Price entry not found")
        
        # Delete image from S3 if exists
        if price_entry.get("image_key"):
            from s3_utils import delete_from_s3
            delete_from_s3(price_entry["image_key"])
        
        # Delete from database
        result = prices_collection.delete_one({"_id": ObjectId(price_id)})
        if result.deleted_count == 0:
            raise ValueError("Price entry not found")
    except Exception as e:
        print(f"Error deleting price: {e}")
        raise

def get_historical_prices(crop_name: str, market: str, days: int = 7) -> List[Dict]:
    """Get historical prices for a specific crop and market"""
    try:
        end_date = datetime.datetime.utcnow()
        start_date = end_date - datetime.timedelta(days=days)
        
        query = {
            "crop_name": crop_name,
            "market": market,
            "date_effective": {
                "$gte": start_date,
                "$lte": end_date
            }
        }
        
        prices = list(prices_collection.find(query).sort("date_effective", -1))
        for price in prices:
            price["_id"] = str(price["_id"])
            price["date_effective"] = price["date_effective"].strftime("%Y-%m-%d")
        
        return prices
    except Exception as e:
        print(f"Error getting historical prices: {e}")
        raise

# Image Upload Management
def save_upload_history(user_id: str, file_path: str, analysis_result: str) -> str:
    """Save image upload history"""
    try:
        upload_entry = {
            "user_id": user_id,
            "file_path": file_path,
            "analysis_result": analysis_result,
            "uploaded_at": datetime.datetime.utcnow()
        }
        result = uploads_collection.insert_one(upload_entry)
        return str(result.inserted_id)
    except Exception as e:
        logger.error("Database error in save_upload_history", exc_info=True)
        raise

def get_user_uploads(user_id: str) -> List[Dict]:
    """Get upload history for a user"""
    try:
        uploads = list(uploads_collection.find({"user_id": user_id}).sort("uploaded_at", -1))
        for upload in uploads:
            upload["_id"] = str(upload["_id"])
            upload["uploaded_at"] = upload["uploaded_at"].strftime("%Y-%m-%d %H:%M:%S")
        return uploads
    except Exception as e:
        print(f"Error getting user uploads: {e}")
        raise

# Expert Articles Management Functions
def create_expert_article(title: str, description: str, author: str, category: str, read_time: int, image_url: Optional[str] = None) -> str:
    """Create a new expert article"""
    try:
        article = {
            "title": title,
            "description": description,
            "author": author,
            "category": category,
            "read_time": read_time,  # Store as integer
            "image_url": image_url,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "status": "active"
        }
        result = expert_articles_collection.insert_one(article)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating expert article: {e}")
        raise

def get_expert_articles(category: Optional[str] = None) -> List[Dict]:
    """Get all expert articles, optionally filtered by category"""
    try:
        query = {"status": "active"}
        if category and category.lower() != "all categories":
            query["category"] = category
            
        articles = list(expert_articles_collection.find(query).sort("created_at", -1))
        for article in articles:
            article["_id"] = str(article["_id"])
            article["created_at"] = article["created_at"].strftime("%B %d, %Y")  # Format: March 15, 2024
            article["updated_at"] = article["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
            
            # Handle read_time field
            if "read_time" not in article:
                article["read_time"] = 5  # Default read time
            article["read_time_text"] = f"{article['read_time']} min read"
            
        return articles
    except Exception as e:
        print(f"Error getting expert articles: {e}")
        raise

def get_expert_article(article_id: str) -> Optional[Dict]:
    """Get a specific expert article by ID"""
    try:
        article = expert_articles_collection.find_one({"_id": ObjectId(article_id), "status": "active"})
        if article:
            article["_id"] = str(article["_id"])
            article["created_at"] = article["created_at"].strftime("%B %d, %Y")
            article["updated_at"] = article["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
            
            # Handle read_time field
            if "read_time" not in article:
                article["read_time"] = 5  # Default read time
            article["read_time_text"] = f"{article['read_time']} min read"
            
        return article
    except Exception as e:
        print(f"Error getting expert article: {e}")
        raise

def update_expert_article(article_id: str, updates: Dict) -> None:
    """Update an existing expert article"""
    try:
        updates["updated_at"] = datetime.datetime.utcnow()
        result = expert_articles_collection.update_one(
            {"_id": ObjectId(article_id), "status": "active"},
            {"$set": updates}
        )
        if result.matched_count == 0:
            raise ValueError("Article not found")
    except Exception as e:
        print(f"Error updating expert article: {e}")
        raise

def delete_expert_article(article_id: str) -> None:
    """Soft delete an expert article"""
    try:
        result = expert_articles_collection.update_one(
            {"_id": ObjectId(article_id), "status": "active"},
            {"$set": {"status": "deleted", "updated_at": datetime.datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise ValueError("Article not found")
    except Exception as e:
        print(f"Error deleting expert article: {e}")
        raise

# Daily News Management Functions
def create_daily_news(title: str, description: str, image_url: Optional[str] = None) -> str:
    """Create a new daily news entry"""
    try:
        news = {
            "title": title,
            "description": description,
            "image_url": image_url,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "status": "active"
        }
        result = daily_news_collection.insert_one(news)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating daily news: {e}")
        raise

def get_daily_news() -> List[Dict]:
    """Get all daily news entries"""
    try:
        news_list = list(daily_news_collection.find({"status": "active"}).sort("created_at", -1))
        for news in news_list:
            news["_id"] = str(news["_id"])
            news["created_at"] = news["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            news["updated_at"] = news["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
        return news_list
    except Exception as e:
        print(f"Error getting daily news: {e}")
        raise

def get_daily_news_item(news_id: str) -> Optional[Dict]:
    """Get a specific daily news item by ID"""
    try:
        news = daily_news_collection.find_one({"_id": ObjectId(news_id), "status": "active"})
        if news:
            news["_id"] = str(news["_id"])
            news["created_at"] = news["created_at"].strftime("%Y-%m-%d %H:%M:%S")
            news["updated_at"] = news["updated_at"].strftime("%Y-%m-%d %H:%M:%S")
        return news
    except Exception as e:
        print(f"Error getting daily news item: {e}")
        raise

def update_daily_news(news_id: str, updates: Dict) -> None:
    """Update an existing daily news entry"""
    try:
        updates["updated_at"] = datetime.datetime.utcnow()
        result = daily_news_collection.update_one(
            {"_id": ObjectId(news_id), "status": "active"},
            {"$set": updates}
        )
        if result.matched_count == 0:
            raise ValueError("News item not found")
    except Exception as e:
        print(f"Error updating daily news: {e}")
        raise

def delete_daily_news(news_id: str) -> None:
    """Soft delete a daily news entry"""
    try:
        result = daily_news_collection.update_one(
            {"_id": ObjectId(news_id), "status": "active"},
            {"$set": {"status": "deleted", "updated_at": datetime.datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise ValueError("News item not found")
    except Exception as e:
        print(f"Error deleting daily news: {e}")
        raise

def update_notification_preferences(user_id: str, preferences: Dict) -> None:
    """Update user's notification preferences"""
    try:
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"notification_preferences": preferences}}
        )
    except Exception as e:
        logger.error("Database error in update_notification_preferences", exc_info=True)
        raise

def get_notification_preferences(user_id: str) -> Dict:
    """Get user's notification preferences"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")
        return user.get("notification_preferences", {
            "market_price": True,
            "expert_article": True,
            "daily_news": True,
            "govt_scheme": True
        })
    except Exception as e:
        logger.error("Database error in get_notification_preferences", exc_info=True)
        raise

def save_push_subscription(user_id: str, subscription: Dict) -> None:
    """Save user's push notification subscription"""
    try:
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"push_subscription": subscription}}
        )
    except Exception as e:
        logger.error("Database error in save_push_subscription", exc_info=True)
        raise

def remove_push_subscription(user_id: str) -> None:
    """Remove user's push notification subscription"""
    try:
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$unset": {"push_subscription": ""}}
        )
    except Exception as e:
        logger.error("Database error in remove_push_subscription", exc_info=True)
        raise
