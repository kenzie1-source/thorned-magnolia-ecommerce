from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime
import aiofiles
import shutil
import stripe

# Import models and database functions
from models import *
from database import *
from email_service import send_order_emails

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Stripe configuration
stripe.api_key = "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"

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'thornedmagnolia')]

# Create the main app without a prefix
app = FastAPI(title="Thorned Magnolia Collective API", description="E-commerce API for t-shirt business")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Ensure upload directories exist
UPLOAD_DIR = Path("uploads")
CUSTOM_ORDERS_DIR = UPLOAD_DIR / "custom-orders"
CUSTOM_ORDERS_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Startup event
@app.on_event("startup")
async def startup_event():
    await init_database()
    logging.info("Database initialized")

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Thorned Magnolia Collective API", "version": "1.0.0"}

# Products endpoints
@api_router.get("/products", response_model=List[Product])
async def get_products():
    """Get all products"""
    products = await get_all_products()
    return products

@api_router.get("/products/category/{category_id}", response_model=List[Product])
async def get_products_by_category_endpoint(category_id: str):
    """Get products by category"""
    products = await get_products_by_category(category_id)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product_endpoint(product_id: str):
    """Get single product"""
    product = await get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product_endpoint(product: ProductCreate):
    """Create new product (Admin)"""
    product_dict = product.dict()
    product_dict["id"] = str(uuid.uuid4())
    product_dict["createdAt"] = datetime.utcnow()
    product_dict["updatedAt"] = datetime.utcnow()
    product_dict["inStock"] = True
    
    await create_product(product_dict)
    return Product(**product_dict)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product_endpoint(product_id: str, product_update: ProductUpdate):
    """Update product (Admin)"""
    existing_product = await get_product_by_id(product_id)
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    if update_data:
        success = await update_product(product_id, update_data)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update product")
    
    updated_product = await get_product_by_id(product_id)
    return updated_product

@api_router.delete("/products/{product_id}", response_model=MessageResponse)
async def delete_product_endpoint(product_id: str):
    """Delete product (Admin)"""
    success = await delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return MessageResponse(message="Product deleted successfully")

# Categories endpoints
@api_router.get("/categories", response_model=List[Category])
async def get_categories_endpoint():
    """Get all categories"""
    categories = await get_all_categories()
    return categories

# Cart endpoints
@api_router.get("/cart/{session_id}", response_model=Optional[Cart])
async def get_cart_endpoint(session_id: str):
    """Get cart by session ID"""
    cart = await get_cart(session_id)
    return cart

@api_router.post("/cart", response_model=Cart)
async def add_to_cart_endpoint(cart_item: CartItemAdd):
    """Add item to cart"""
    # Verify product exists
    product = await get_product_by_id(cart_item.productId)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart_item_dict = cart_item.dict()
    cart = await add_to_cart(cart_item_dict)
    return cart

@api_router.put("/cart/{session_id}/{item_index}", response_model=MessageResponse)
async def update_cart_item_endpoint(session_id: str, item_index: int, update_data: CartItemUpdate):
    """Update cart item"""
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    success = await update_cart_item(session_id, item_index, update_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return MessageResponse(message="Cart item updated successfully")

@api_router.delete("/cart/{session_id}/{item_index}", response_model=MessageResponse)
async def remove_cart_item_endpoint(session_id: str, item_index: int):
    """Remove item from cart"""
    success = await remove_from_cart(session_id, item_index)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return MessageResponse(message="Item removed from cart")

@api_router.delete("/cart/{session_id}", response_model=MessageResponse)
async def clear_cart_endpoint(session_id: str):
    """Clear cart"""
    success = await clear_cart(session_id)
    return MessageResponse(message="Cart cleared successfully")

# File upload endpoint
@api_router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload file for custom orders"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Validate file size (10MB max)
    if file.size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File size too large. Max 10MB allowed")
    
    # Create unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Create date-based directory structure
    today = datetime.utcnow()
    upload_path = CUSTOM_ORDERS_DIR / str(today.year) / f"{today.month:02d}" / f"{today.day:02d}"
    upload_path.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_path / unique_filename
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as buffer:
            content = await file.read()
            await buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return relative path for database storage
    relative_path = str(file_path.relative_to(UPLOAD_DIR))
    
    return FileUploadResponse(
        filename=unique_filename,
        filepath=relative_path,
        success=True
    )

# Custom Orders endpoints
@api_router.post("/custom-orders", response_model=CustomOrder)
async def create_custom_order_endpoint(order: CustomOrderCreate):
    """Submit custom order"""
    # Calculate price based on style and options
    base_prices = {
        "regular": 20,
        "vneck": 20,
        "sweatshirt": 25
    }
    
    base_price = base_prices.get(order.shirtStyle, 20)
    
    # Add front/back premium
    if order.printLocation == "both":
        if order.shirtStyle == "sweatshirt":
            base_price = 30  # $30 for front & back sweatshirt
        else:
            base_price = 25  # $25 for front & back t-shirt
    
    # Add size premium
    size_premiums = {"2XL": 2, "3XL": 4, "4XL": 6, "5XL": 8}
    size_premium = size_premiums.get(order.size, 0)
    
    total_price = (base_price + size_premium) * order.quantity
    
    order_dict = order.dict()
    order_dict["orderId"] = f"TMC{int(datetime.utcnow().timestamp())}"
    order_dict["totalPrice"] = total_price
    order_dict["status"] = "pending"
    order_dict["createdAt"] = datetime.utcnow()
    order_dict["updatedAt"] = datetime.utcnow()
    order_dict["type"] = "custom_order"
    
    order_id = await create_custom_order(order_dict)
    order_dict["id"] = str(order_id)
    
    # Send email notifications
    try:
        await send_order_emails(order_dict)
    except Exception as e:
        logger.error(f"Failed to send emails: {e}")
    
    return CustomOrder(**order_dict)

@api_router.get("/custom-orders", response_model=List[CustomOrder])
async def get_custom_orders_endpoint():
    """Get all custom orders (Admin)"""
    orders = await get_custom_orders()
    return orders

@api_router.get("/custom-orders/{order_id}", response_model=CustomOrder)
async def get_custom_order_endpoint(order_id: str):
    """Get custom order by ID"""
    order = await get_custom_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.put("/custom-orders/{order_id}/status", response_model=MessageResponse)
async def update_custom_order_status_endpoint(order_id: str, status_update: CustomOrderUpdate):
    """Update custom order status (Admin)"""
    if not status_update.status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    valid_statuses = ["pending", "confirmed", "in-progress", "completed", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    success = await update_custom_order_status(order_id, status_update.status)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return MessageResponse(message=f"Order status updated to {status_update.status}")

# Regular Orders endpoints
@api_router.post("/orders", response_model=Order)
async def create_order_endpoint(order: OrderCreate):
    """Place regular order"""
    order_dict = order.dict()
    order_dict["orderId"] = f"TMC{int(datetime.utcnow().timestamp())}"
    order_dict["status"] = "pending"
    order_dict["createdAt"] = datetime.utcnow()
    order_dict["updatedAt"] = datetime.utcnow()
    order_dict["type"] = "regular_order"
    
    order_id = await create_order(order_dict)
    order_dict["id"] = str(order_id)
    
    # Send email notifications
    try:
        await send_order_emails(order_dict)
    except Exception as e:
        logger.error(f"Failed to send emails: {e}")
    
    return Order(**order_dict)

@api_router.get("/orders/{email}", response_model=List[Order])
async def get_orders_by_email_endpoint(email: str):
    """Get orders by customer email"""
    orders = await get_orders_by_email(email)
    return orders

@api_router.get("/orders", response_model=List[Order])
async def get_all_orders_endpoint():
    """Get all orders (Admin)"""
    orders = await get_all_orders()
    return orders

# Utility endpoints
@api_router.get("/fonts", response_model=List[Font])
async def get_fonts():
    """Get available fonts"""
    fonts = [
        {"id": "serif", "name": "Classic Serif", "preview": "Your Text Here"},
        {"id": "script", "name": "Elegant Script", "preview": "Your Text Here"},
        {"id": "modern", "name": "Modern Sans", "preview": "YOUR TEXT HERE"},
        {"id": "handwritten", "name": "Handwritten", "preview": "Your Text Here"},
        {"id": "bold", "name": "Bold Impact", "preview": "YOUR TEXT HERE"}
    ]
    return fonts

@api_router.get("/sizes", response_model=List[Size])
async def get_sizes():
    """Get available sizes with pricing"""
    sizes = [
        {"id": "S", "name": "Small", "extraCost": 0},
        {"id": "M", "name": "Medium", "extraCost": 0},
        {"id": "L", "name": "Large", "extraCost": 0},
        {"id": "XL", "name": "Extra Large", "extraCost": 0},
        {"id": "2XL", "name": "2X Large", "extraCost": 2},
        {"id": "3XL", "name": "3X Large", "extraCost": 4},
        {"id": "4XL", "name": "4X Large", "extraCost": 2},
        {"id": "5XL", "name": "5X Large", "extraCost": 8}
    ]
    return sizes

@api_router.get("/colors")
async def get_colors():
    """Get available colors"""
    colors = [
        "White", "Black", "Navy", "Gray", "Heather Gray", "Red", "Royal Blue",
        "Forest Green", "Purple", "Maroon", "Pink", "Light Blue", "Yellow",
        "Orange", "Brown", "Sage", "Mauve", "Rose Gold", "Burnt Orange"
    ]
    return colors

@api_router.get("/shirt-styles")
async def get_shirt_styles():
    """Get available shirt styles with pricing"""
    styles = [
        {"id": "regular", "name": "Regular T-Shirt", "basePrice": 20},
        {"id": "vneck", "name": "V-Neck T-Shirt", "basePrice": 20},
        {"id": "sweatshirt", "name": "Sweatshirt", "basePrice": 25}
    ]
    return styles

# Stripe Payment Intent endpoint
@api_router.post("/create-payment-intent")
async def create_payment_intent(request_data: dict):
    """Create Stripe payment intent"""
    try:
        amount = request_data.get('amount')  # Amount in cents
        currency = request_data.get('currency', 'usd')
        order_data = request_data.get('orderData', {})
        customer_info = request_data.get('customerInfo', {})
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={
                'order_type': order_data.get('type', 'regular_order'),
                'customer_name': customer_info.get('name', ''),
                'customer_email': customer_info.get('email', ''),
                'customer_phone': customer_info.get('phone', ''),
            },
            receipt_email=customer_info.get('email'),
            automatic_payment_methods={
                'enabled': True,
            },
        )
        
        return {
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating payment intent: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment intent")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
