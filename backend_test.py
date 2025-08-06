#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Thorned Magnolia Collective
Tests all backend endpoints systematically based on test_result.md requirements
"""

import requests
import json
import uuid
import os
from datetime import datetime
from pathlib import Path
import tempfile

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url() + "/api"
print(f"Testing backend at: {BASE_URL}")

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_session_id = str(uuid.uuid4())
        self.test_results = []
        self.uploaded_file_path = None
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_test("Root API Endpoint", success, 
                         f"Status: {response.status_code}, Message: {data.get('message', 'N/A')}")
            return success
        except Exception as e:
            self.log_test("Root API Endpoint", False, f"Exception: {str(e)}")
            return False
            
    def test_products_endpoints(self):
        """Test all product-related endpoints"""
        print("\n=== TESTING PRODUCTS ENDPOINTS ===")
        
        # Test GET /products
        try:
            response = self.session.get(f"{BASE_URL}/products")
            success = response.status_code == 200
            products = response.json() if success else []
            self.log_test("GET /products", success, 
                         f"Status: {response.status_code}, Products count: {len(products)}")
            
            if success and products:
                # Test GET /products/{id} with first product
                product_id = products[0].get('id')
                if product_id:
                    response = self.session.get(f"{BASE_URL}/products/{product_id}")
                    success = response.status_code == 200
                    self.log_test("GET /products/{id}", success, 
                                 f"Status: {response.status_code}, Product: {product_id}")
                    
                # Test GET /products/category/{id} with first product's category
                category = products[0].get('category')
                if category:
                    response = self.session.get(f"{BASE_URL}/products/category/{category}")
                    success = response.status_code == 200
                    category_products = response.json() if success else []
                    self.log_test("GET /products/category/{id}", success, 
                                 f"Status: {response.status_code}, Category products: {len(category_products)}")
                    
        except Exception as e:
            self.log_test("Products Endpoints", False, f"Exception: {str(e)}")
            
    def test_categories_endpoint(self):
        """Test categories endpoint"""
        print("\n=== TESTING CATEGORIES ENDPOINT ===")
        
        try:
            response = self.session.get(f"{BASE_URL}/categories")
            success = response.status_code == 200
            categories = response.json() if success else []
            self.log_test("GET /categories", success, 
                         f"Status: {response.status_code}, Categories count: {len(categories)}")
            return categories
        except Exception as e:
            self.log_test("GET /categories", False, f"Exception: {str(e)}")
            return []
            
    def test_cart_management(self):
        """Test cart management endpoints"""
        print("\n=== TESTING CART MANAGEMENT ===")
        
        # First get a product to add to cart
        try:
            products_response = self.session.get(f"{BASE_URL}/products")
            if products_response.status_code != 200:
                self.log_test("Cart Management - Get Products", False, "Cannot get products for cart test")
                return
                
            products = products_response.json()
            if not products:
                self.log_test("Cart Management - No Products", False, "No products available for cart test")
                return
                
            test_product = products[0]
            
            # Test adding item to cart
            cart_item = {
                "sessionId": self.test_session_id,
                "productId": test_product["id"],
                "quantity": 2,
                "selectedColor": test_product["colors"][0] if test_product["colors"] else "White",
                "selectedSize": test_product["sizes"][0] if test_product["sizes"] else "M",
                "printLocation": "front",
                "customizations": {}
            }
            
            response = self.session.post(f"{BASE_URL}/cart", json=cart_item)
            success = response.status_code == 200
            self.log_test("POST /cart (Add Item)", success, 
                         f"Status: {response.status_code}")
            
            if success:
                # Test getting cart
                response = self.session.get(f"{BASE_URL}/cart/{self.test_session_id}")
                success = response.status_code == 200
                cart_data = response.json() if success else {}
                items_count = len(cart_data.get("items", [])) if cart_data else 0
                self.log_test("GET /cart/{session_id}", success, 
                             f"Status: {response.status_code}, Items: {items_count}")
                
                if success and cart_data and cart_data.get("items"):
                    # Test updating cart item (first item, index 0)
                    update_data = {"quantity": 3}
                    response = self.session.put(f"{BASE_URL}/cart/{self.test_session_id}/0", json=update_data)
                    success = response.status_code == 200
                    self.log_test("PUT /cart/{session_id}/{item_index}", success, 
                                 f"Status: {response.status_code}")
                    
                    # Test removing cart item
                    response = self.session.delete(f"{BASE_URL}/cart/{self.test_session_id}/0")
                    success = response.status_code == 200
                    self.log_test("DELETE /cart/{session_id}/{item_index}", success, 
                                 f"Status: {response.status_code}")
                    
                # Test clearing cart
                response = self.session.delete(f"{BASE_URL}/cart/{self.test_session_id}")
                success = response.status_code == 200
                self.log_test("DELETE /cart/{session_id} (Clear Cart)", success, 
                             f"Status: {response.status_code}")
                             
        except Exception as e:
            self.log_test("Cart Management", False, f"Exception: {str(e)}")
            
    def test_file_upload(self):
        """Test file upload endpoint"""
        print("\n=== TESTING FILE UPLOAD ===")
        
        try:
            # Create a temporary test image file
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                # Create a simple PNG file (1x1 pixel)
                png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
                temp_file.write(png_data)
                temp_file_path = temp_file.name
                
            # Test file upload
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('test_design.png', f, 'image/png')}
                response = self.session.post(f"{BASE_URL}/upload", files=files)
                
            success = response.status_code == 200
            upload_data = response.json() if success else {}
            self.uploaded_file_path = upload_data.get('filepath') if success else None
            
            self.log_test("POST /upload", success, 
                         f"Status: {response.status_code}, File: {upload_data.get('filename', 'N/A')}")
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
        except Exception as e:
            self.log_test("File Upload", False, f"Exception: {str(e)}")
            
    def test_custom_orders(self):
        """Test custom orders endpoints with pricing logic"""
        print("\n=== TESTING CUSTOM ORDERS & PRICING LOGIC ===")
        
        try:
            # Test Case 1: Regular T-shirt, front only, size M
            custom_order_1 = {
                "customerName": "Sarah Johnson",
                "email": "sarah.johnson@email.com",
                "phone": "555-0123",
                "designImage": self.uploaded_file_path,
                "designText": "Custom Design Text",
                "selectedFont": "serif",
                "shirtStyle": "regular",
                "shirtColor": "White",
                "size": "M",
                "printLocation": "front",
                "quantity": 1,
                "specialInstructions": "Please center the design"
            }
            
            response = self.session.post(f"{BASE_URL}/custom-orders", json=custom_order_1)
            success = response.status_code == 200
            order_data_1 = response.json() if success else {}
            expected_price_1 = 20  # Regular t-shirt, front only, no size premium
            actual_price_1 = order_data_1.get('totalPrice', 0)
            
            self.log_test("POST /custom-orders (T-shirt, front, M)", success, 
                         f"Status: {response.status_code}, Price: ${actual_price_1} (expected: ${expected_price_1})")
            
            # Test Case 2: Sweatshirt, both sides, size 2XL
            custom_order_2 = {
                "customerName": "Mike Davis",
                "email": "mike.davis@email.com",
                "phone": "555-0456",
                "designText": "Front and Back Design",
                "selectedFont": "bold",
                "shirtStyle": "sweatshirt",
                "shirtColor": "Navy",
                "size": "2XL",
                "printLocation": "both",
                "quantity": 2,
                "specialInstructions": "Different designs on front and back"
            }
            
            response = self.session.post(f"{BASE_URL}/custom-orders", json=custom_order_2)
            success = response.status_code == 200
            order_data_2 = response.json() if success else {}
            expected_price_2 = (30 + 2) * 2  # Sweatshirt both sides ($30) + 2XL premium ($2) * quantity (2) = $64
            actual_price_2 = order_data_2.get('totalPrice', 0)
            
            self.log_test("POST /custom-orders (Sweatshirt, both, 2XL)", success, 
                         f"Status: {response.status_code}, Price: ${actual_price_2} (expected: ${expected_price_2})")
            
            # Test Case 3: V-neck, both sides, size 3XL
            custom_order_3 = {
                "customerName": "Lisa Chen",
                "email": "lisa.chen@email.com",
                "shirtStyle": "vneck",
                "shirtColor": "Black",
                "size": "3XL",
                "printLocation": "both",
                "quantity": 1
            }
            
            response = self.session.post(f"{BASE_URL}/custom-orders", json=custom_order_3)
            success = response.status_code == 200
            order_data_3 = response.json() if success else {}
            expected_price_3 = 25 + 4  # V-neck both sides ($25) + 3XL premium ($4) = $29
            actual_price_3 = order_data_3.get('totalPrice', 0)
            
            self.log_test("POST /custom-orders (V-neck, both, 3XL)", success, 
                         f"Status: {response.status_code}, Price: ${actual_price_3} (expected: ${expected_price_3})")
            
            # Test getting all custom orders
            response = self.session.get(f"{BASE_URL}/custom-orders")
            success = response.status_code == 200
            orders = response.json() if success else []
            self.log_test("GET /custom-orders", success, 
                         f"Status: {response.status_code}, Orders count: {len(orders)}")
            
            # Test getting specific order and updating status
            if order_data_1.get('orderId'):
                order_id = order_data_1['orderId']
                
                # Get specific order
                response = self.session.get(f"{BASE_URL}/custom-orders/{order_id}")
                success = response.status_code == 200
                self.log_test("GET /custom-orders/{order_id}", success, 
                             f"Status: {response.status_code}, Order ID: {order_id}")
                
                # Update order status
                status_update = {"status": "confirmed"}
                response = self.session.put(f"{BASE_URL}/custom-orders/{order_id}/status", json=status_update)
                success = response.status_code == 200
                self.log_test("PUT /custom-orders/{order_id}/status", success, 
                             f"Status: {response.status_code}")
                             
        except Exception as e:
            self.log_test("Custom Orders", False, f"Exception: {str(e)}")
            
    def test_utility_endpoints(self):
        """Test utility endpoints (fonts, sizes, colors, shirt-styles)"""
        print("\n=== TESTING UTILITY ENDPOINTS ===")
        
        endpoints = [
            ("GET /fonts", "/fonts"),
            ("GET /sizes", "/sizes"),
            ("GET /colors", "/colors"),
            ("GET /shirt-styles", "/shirt-styles")
        ]
        
        for test_name, endpoint in endpoints:
            try:
                response = self.session.get(f"{BASE_URL}{endpoint}")
                success = response.status_code == 200
                data = response.json() if success else []
                count = len(data) if isinstance(data, list) else "N/A"
                self.log_test(test_name, success, 
                             f"Status: {response.status_code}, Items: {count}")
            except Exception as e:
                self.log_test(test_name, False, f"Exception: {str(e)}")
                
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Thorned Magnolia Collective Backend API Tests")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test core functionality
        self.test_products_endpoints()
        self.test_categories_endpoint()
        self.test_cart_management()
        self.test_file_upload()
        self.test_custom_orders()
        self.test_utility_endpoints()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # List failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        else:
            print("\n🎉 ALL TESTS PASSED!")
            
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)