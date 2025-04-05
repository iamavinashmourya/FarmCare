from typing import Dict, List
import json
import requests
from datetime import datetime
from db import users_collection
from bson import ObjectId

class PushNotification:
    @staticmethod
    def send_notification(subscription_info: Dict, title: str, body: str, icon: str = None, tag: str = None) -> bool:
        try:
            notification_data = {
                "notification": {
                    "title": title,
                    "body": body,
                    "icon": icon or "/favicon.ico",
                    "tag": tag or "farmcare-notification",
                    "requireInteraction": True,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }

            response = requests.post(
                subscription_info["endpoint"],
                data=json.dumps(notification_data),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"key={subscription_info['keys']['auth']}"
                }
            )
            return response.status_code == 201
        except Exception as e:
            print(f"Error sending push notification: {str(e)}")
            return False

    @staticmethod
    def send_market_price_update(user_id: str, price_data: Dict) -> bool:
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user or not user.get("push_subscription"):
                return False

            title = "Market Price Update"
            
            # If we have change information, include it in the notification
            if 'change' in price_data and 'old_price' in price_data:
                change_direction = "📈" if price_data['change'] > 0 else "📉"
                body = (
                    f"{change_direction} {price_data['crop_name']} price in {price_data['region']}\n"
                    f"Old: ₹{price_data['old_price']}/kg → New: ₹{price_data['price']}/kg\n"
                    f"Change: {abs(price_data['change'])}%"
                )
            else:
                body = f"New price update for {price_data['crop_name']} in {price_data['region']}: ₹{price_data['price']}/kg"
            
            return PushNotification.send_notification(
                user["push_subscription"],
                title,
                body,
                tag="market-price"
            )
        except Exception as e:
            print(f"Error sending market price notification: {str(e)}")
            return False

    @staticmethod
    def send_expert_article_notification(user_id: str, article_data: Dict) -> bool:
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user or not user.get("push_subscription"):
                return False

            title = "New Expert Article"
            body = (
                f"📚 {article_data['title']}\n"
                f"By: {article_data['author']}\n"
                f"Category: {article_data.get('category', 'General')}"
            )
            
            return PushNotification.send_notification(
                user["push_subscription"],
                title,
                body,
                tag="expert-article"
            )
        except Exception as e:
            print(f"Error sending expert article notification: {str(e)}")
            return False

    @staticmethod
    def send_news_notification(user_id: str, news_data: Dict) -> bool:
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user or not user.get("push_subscription"):
                return False

            title = "Daily Agriculture News"
            body = f"📰 {news_data['title']}\n{news_data.get('description', '')[:100]}..."
            
            return PushNotification.send_notification(
                user["push_subscription"],
                title,
                body,
                tag="daily-news"
            )
        except Exception as e:
            print(f"Error sending news notification: {str(e)}")
            return False

    @staticmethod
    def send_scheme_notification(user_id: str, scheme_data: Dict) -> bool:
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user or not user.get("push_subscription"):
                return False

            title = "New Government Scheme"
            body = (
                f"🏛️ {scheme_data['name']}\n"
                f"State: {scheme_data['state']}\n"
                f"Click to view details and benefits"
            )
            
            return PushNotification.send_notification(
                user["push_subscription"],
                title,
                body,
                tag="govt-scheme"
            )
        except Exception as e:
            print(f"Error sending scheme notification: {str(e)}")
            return False

    @staticmethod
    def notify_users_in_region(region: str, notification_data: Dict, notification_type: str) -> None:
        try:
            users = users_collection.find({
                "region": region,
                "push_subscription": {"$exists": True},
                "notification_preferences": {
                    "$elemMatch": {
                        "type": notification_type,
                        "enabled": True
                    }
                }
            })

            for user in users:
                if notification_type == "market_price":
                    PushNotification.send_market_price_update(str(user["_id"]), notification_data)
                elif notification_type == "expert_article":
                    PushNotification.send_expert_article_notification(str(user["_id"]), notification_data)
                elif notification_type == "daily_news":
                    PushNotification.send_news_notification(str(user["_id"]), notification_data)
                elif notification_type == "govt_scheme":
                    PushNotification.send_scheme_notification(str(user["_id"]), notification_data)

        except Exception as e:
            print(f"Error notifying users in region: {str(e)}") 