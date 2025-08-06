from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# Product Models
class Product(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    price: float
    image: str
    colors: List[str]
    sizes: List[str]
    type: str = "tshirt"  # 'tshirt' or 'sweatshirt'
    inStock: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    image: str
    colors: List[str]
    sizes: List[str]
    type: str = "tshirt"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    colors: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    type: Optional[str] = None
    inStock: Optional[bool] = None

# Category Models
class Category(BaseModel):
    id: str
    name: str
    description: str
    displayOrder: int = 0

class CategoryCreate(BaseModel):
    id: str
    name: str
    description: str
    displayOrder: int = 0

# Cart Models
class CartItem(BaseModel):
    productId: str
    quantity: int
    selectedColor: str
    selectedSize: str
    printLocation: str  # 'front', 'back', 'both'
    customizations: Optional[Dict[str, Any]] = {}

class Cart(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    items: List[CartItem]
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CartItemAdd(BaseModel):
    sessionId: str
    productId: str
    quantity: int = 1
    selectedColor: str
    selectedSize: str
    printLocation: str = "front"
    customizations: Optional[Dict[str, Any]] = {}

class CartItemUpdate(BaseModel):
    quantity: Optional[int] = None
    selectedColor: Optional[str] = None
    selectedSize: Optional[str] = None
    printLocation: Optional[str] = None

# Custom Order Models
class CustomOrder(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    orderId: str = Field(default_factory=lambda: f"TMC{int(datetime.utcnow().timestamp())}")
    customerName: str
    email: str
    phone: Optional[str] = None
    designImage: Optional[str] = None  # File path
    designText: Optional[str] = None
    selectedFont: Optional[str] = None
    shirtStyle: str
    shirtColor: str
    size: str
    printLocation: str = "front"
    quantity: int = 1
    totalPrice: float
    specialInstructions: Optional[str] = None
    status: str = "pending"  # 'pending', 'confirmed', 'in-progress', 'completed'
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CustomOrderCreate(BaseModel):
    customerName: str
    email: str
    phone: Optional[str] = None
    designImage: Optional[str] = None
    designText: Optional[str] = None
    selectedFont: Optional[str] = None
    shirtStyle: str
    shirtColor: str
    size: str
    printLocation: str = "front"
    quantity: int = 1
    specialInstructions: Optional[str] = None

class CustomOrderUpdate(BaseModel):
    status: Optional[str] = None
    specialInstructions: Optional[str] = None

# Regular Order Models  
class OrderItem(BaseModel):
    productId: str
    productName: str
    quantity: int
    selectedColor: str
    selectedSize: str
    printLocation: str
    unitPrice: float
    totalPrice: float

class ShippingAddress(BaseModel):
    fullName: str
    addressLine1: str
    addressLine2: Optional[str] = None
    city: str
    state: str
    zipCode: str
    country: str = "US"

class Order(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    orderId: str = Field(default_factory=lambda: f"TMC{int(datetime.utcnow().timestamp())}")
    customerEmail: str
    items: List[OrderItem]
    subtotal: float
    tax: Optional[float] = 0
    shipping: Optional[float] = 0
    totalAmount: float
    status: str = "pending"  # 'pending', 'confirmed', 'shipped', 'delivered'
    shippingAddress: Optional[ShippingAddress] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    customerEmail: str
    items: List[OrderItem]
    subtotal: float
    tax: Optional[float] = 0
    shipping: Optional[float] = 0
    totalAmount: float
    shippingAddress: Optional[ShippingAddress] = None

# Font Models
class Font(BaseModel):
    id: str
    name: str
    preview: str

# Size Models  
class Size(BaseModel):
    id: str
    name: str
    extraCost: float = 0

# Response Models
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    error: str
    success: bool = False

# File Upload Model
class FileUploadResponse(BaseModel):
    filename: str
    filepath: str
    success: bool = True