#!/usr/bin/env python3
"""Reset and reinitialize database with updated product data"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from database import init_database

async def reset_database():
    """Clear and reinitialize the database"""
    try:
        # Get database connection
        mongo_url = os.environ.get('MONGO_URL')
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ.get('DB_NAME', 'thornedmagnolia')]
        
        # Clear existing collections
        await db.products.drop()
        await db.categories.drop()
        print("✅ Cleared existing data")
        
        # Reinitialize with new data
        await init_database()
        print("✅ Database reinitialized with updated product data")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")

if __name__ == "__main__":
    asyncio.run(reset_database())