import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'thornedmagnolia')]

# Collections
products_collection = db.products
categories_collection = db.categories  
carts_collection = db.carts
custom_orders_collection = db.custom_orders
orders_collection = db.orders

async def init_database():
    """Initialize database with default data"""
    try:
        # Check if categories exist, if not create them
        categories_count = await categories_collection.count_documents({})
        if categories_count == 0:
            default_categories = [
                {"id": "teachers", "name": "Teachers", "description": "Inspiring designs for educators", "displayOrder": 1},
                {"id": "mamas", "name": "Mamas", "description": "Celebrating motherhood", "displayOrder": 2},
                {"id": "seasons", "name": "Seasons", "description": "Seasonal favorites", "displayOrder": 3},
                {"id": "quotes", "name": "Quotes", "description": "Motivational sayings", "displayOrder": 4},
                {"id": "graphic", "name": "Graphic", "description": "Bold graphic designs", "displayOrder": 5},
                {"id": "dads", "name": "Dads", "description": "Dedicated to fathers", "displayOrder": 6},
                {"id": "embroidery", "name": "Embroidery", "description": "Elegant embroidered pieces", "displayOrder": 7},
                {"id": "seniors", "name": "Seniors", "description": "Class of 2025 and beyond", "displayOrder": 8},
                {"id": "holidays", "name": "Holidays", "description": "Festive holiday themes", "displayOrder": 9},
                {"id": "gamer", "name": "Gamer", "description": "Gaming enthusiasts", "displayOrder": 10},
                {"id": "worship", "name": "Worship", "description": "Faith-based designs", "displayOrder": 11},
                {"id": "gameday", "name": "Gameday", "description": "Sports and team spirit", "displayOrder": 12}
            ]
            await categories_collection.insert_many(default_categories)
            logger.info("Default categories created")

        # Check if products exist, if not create sample products
        products_count = await products_collection.count_documents({})
        if products_count == 0:
            sample_products = [
                {
                    "id": "1",
                    "name": "World's Best Teacher",
                    "category": "teachers",
                    "price": 20,
                    "image": "https://via.placeholder.com/400x400/C4B5A0/2C2C2C?text=Teacher+Shirt",
                    "colors": ["Black", "Grey", "White", "Beige", "Blue", "Red"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
                    "type": "tshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                },
                {
                    "id": "2", 
                    "name": "Mama Bear",
                    "category": "mamas",
                    "price": 20,
                    "image": "https://via.placeholder.com/400x400/D4C4B0/2C2C2C?text=Mama+Bear",
                    "colors": ["Rose Gold", "White", "Mauve", "Black"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
                    "type": "tshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                },
                {
                    "id": "3",
                    "name": "Fall Vibes",
                    "category": "seasons", 
                    "price": 20,
                    "image": "https://via.placeholder.com/400x400/8B7D6B/FAF9F7?text=Fall+Vibes",
                    "colors": ["Burnt Orange", "Burgundy", "Mustard", "Brown"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
                    "type": "tshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                },
                {
                    "id": "4",
                    "name": "Be Kind",
                    "category": "quotes",
                    "price": 20,
                    "image": "https://via.placeholder.com/400x400/C4B5A0/FAF9F7?text=Be+Kind",
                    "colors": ["Sage", "Pink", "White", "Light Blue"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
                    "type": "tshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                },
                {
                    "id": "5",
                    "name": "Retro Sunset",
                    "category": "graphic",
                    "price": 20,
                    "image": "https://via.placeholder.com/400x400/6B4E37/FAF9F7?text=Retro+Sunset",
                    "colors": ["Black", "Navy", "White", "Coral"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
                    "type": "tshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                },
                {
                    "id": "6",
                    "name": "Dad Joke Loading",
                    "category": "dads",
                    "price": 20,
                    "image": "https://via.placeholder.com/400x400/2C2C2C/FAF9F7?text=Dad+Jokes",
                    "colors": ["Black", "Gray", "Navy", "White"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
                    "type": "tshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                },
                {
                    "id": "7",
                    "name": "Cozy Fall Sweatshirt",
                    "category": "seasons",
                    "price": 25,
                    "image": "https://via.placeholder.com/400x400/C4B5A0/2C2C2C?text=Cozy+Sweatshirt",
                    "colors": ["Heather Gray", "Burgundy", "Navy", "Black"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
                    "type": "sweatshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                },
                {
                    "id": "8",
                    "name": "Mama Life Sweatshirt",
                    "category": "mamas",
                    "price": 25,
                    "image": "https://via.placeholder.com/400x400/D4C4B0/2C2C2C?text=Mama+Life",
                    "colors": ["Sage", "Pink", "Gray", "White"],
                    "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
                    "type": "sweatshirt",
                    "inStock": True,
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            ]
            await products_collection.insert_many(sample_products)
            logger.info("Sample products created")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")

# Product CRUD operations
async def get_all_products():
    """Get all products"""
    products = await products_collection.find({}).to_list(1000)
    return products

async def get_product_by_id(product_id: str):
    """Get product by ID"""
    product = await products_collection.find_one({"id": product_id})
    return product

async def get_products_by_category(category_id: str):
    """Get products by category"""
    products = await products_collection.find({"category": category_id}).to_list(1000)
    return products

async def create_product(product_data: dict):
    """Create new product"""
    result = await products_collection.insert_one(product_data)
    return result.inserted_id

async def update_product(product_id: str, update_data: dict):
    """Update product"""
    update_data["updatedAt"] = datetime.utcnow()
    result = await products_collection.update_one(
        {"id": product_id}, 
        {"$set": update_data}
    )
    return result.modified_count > 0

async def delete_product(product_id: str):
    """Delete product"""
    result = await products_collection.delete_one({"id": product_id})
    return result.deleted_count > 0

# Category CRUD operations
async def get_all_categories():
    """Get all categories"""
    categories = await categories_collection.find({}).sort("displayOrder", 1).to_list(1000)
    return categories

# Cart operations
async def get_cart(session_id: str):
    """Get cart by session ID"""
    cart = await carts_collection.find_one({"sessionId": session_id})
    return cart

async def add_to_cart(cart_item: dict):
    """Add item to cart or update existing cart"""
    existing_cart = await carts_collection.find_one({"sessionId": cart_item["sessionId"]})
    
    if existing_cart:
        # Check if same item exists (same product, color, size, print location)
        item_exists = False
        for i, item in enumerate(existing_cart["items"]):
            if (item["productId"] == cart_item["productId"] and 
                item["selectedColor"] == cart_item["selectedColor"] and
                item["selectedSize"] == cart_item["selectedSize"] and
                item["printLocation"] == cart_item["printLocation"]):
                # Update quantity
                existing_cart["items"][i]["quantity"] += cart_item["quantity"]
                item_exists = True
                break
        
        if not item_exists:
            # Add new item to existing cart
            existing_cart["items"].append({
                "productId": cart_item["productId"],
                "quantity": cart_item["quantity"],
                "selectedColor": cart_item["selectedColor"],
                "selectedSize": cart_item["selectedSize"],
                "printLocation": cart_item["printLocation"],
                "customizations": cart_item.get("customizations", {})
            })
        
        existing_cart["updatedAt"] = datetime.utcnow()
        await carts_collection.replace_one({"sessionId": cart_item["sessionId"]}, existing_cart)
        return existing_cart
    else:
        # Create new cart
        new_cart = {
            "sessionId": cart_item["sessionId"],
            "items": [{
                "productId": cart_item["productId"],
                "quantity": cart_item["quantity"],
                "selectedColor": cart_item["selectedColor"],
                "selectedSize": cart_item["selectedSize"],
                "printLocation": cart_item["printLocation"],
                "customizations": cart_item.get("customizations", {})
            }],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        await carts_collection.insert_one(new_cart)
        return new_cart

async def update_cart_item(session_id: str, item_index: int, update_data: dict):
    """Update cart item"""
    cart = await carts_collection.find_one({"sessionId": session_id})
    if cart and item_index < len(cart["items"]):
        for key, value in update_data.items():
            if value is not None:
                cart["items"][item_index][key] = value
        cart["updatedAt"] = datetime.utcnow()
        await carts_collection.replace_one({"sessionId": session_id}, cart)
        return True
    return False

async def remove_from_cart(session_id: str, item_index: int):
    """Remove item from cart"""
    cart = await carts_collection.find_one({"sessionId": session_id})
    if cart and item_index < len(cart["items"]):
        cart["items"].pop(item_index)
        cart["updatedAt"] = datetime.utcnow()
        await carts_collection.replace_one({"sessionId": session_id}, cart)
        return True
    return False

async def clear_cart(session_id: str):
    """Clear all items from cart"""
    result = await carts_collection.delete_one({"sessionId": session_id})
    return result.deleted_count > 0

# Custom Order operations
async def create_custom_order(order_data: dict):
    """Create custom order"""
    result = await custom_orders_collection.insert_one(order_data)
    return result.inserted_id

async def get_custom_orders():
    """Get all custom orders"""
    orders = await custom_orders_collection.find({}).sort("createdAt", -1).to_list(1000)
    return orders

async def get_custom_order_by_id(order_id: str):
    """Get custom order by ID"""
    order = await custom_orders_collection.find_one({"orderId": order_id})
    return order

async def update_custom_order_status(order_id: str, status: str):
    """Update custom order status"""
    result = await custom_orders_collection.update_one(
        {"orderId": order_id},
        {"$set": {"status": status, "updatedAt": datetime.utcnow()}}
    )
    return result.modified_count > 0

# Regular Order operations
async def create_order(order_data: dict):
    """Create regular order"""
    result = await orders_collection.insert_one(order_data)
    return result.inserted_id

async def get_orders_by_email(email: str):
    """Get orders by customer email"""
    orders = await orders_collection.find({"customerEmail": email}).sort("createdAt", -1).to_list(1000)
    return orders

async def get_all_orders():
    """Get all orders"""
    orders = await orders_collection.find({}).sort("createdAt", -1).to_list(1000)
    return orders