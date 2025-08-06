import os
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from email.mime.base import MimeBase
from email import encoders
import logging
from jinja2 import Template

logger = logging.getLogger(__name__)

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
FROM_EMAIL = "thornedmagnoliaco@gmail.com"
FROM_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')  # You'll set this
BUSINESS_EMAIL = "thornedmagnoliaco@gmail.com"

# Email templates
CUSTOMER_ORDER_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #2C2C2C; }
        .header { background: #C4B5A0; color: #FAF9F7; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background: #F5F3F0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .total { font-size: 18px; font-weight: bold; color: #6B4E37; }
        .footer { background: #2C2C2C; color: #FAF9F7; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Thank You for Your Order!</h1>
        <p>Thorned Magnolia Collective</p>
    </div>
    
    <div class="content">
        <p>Dear {{ customer_name }},</p>
        
        <p>Thank you for your order! We're excited to create something beautiful for you.</p>
        
        <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order #:</strong> {{ order_id }}</p>
            <p><strong>Date:</strong> {{ order_date }}</p>
            {% if order_type == 'custom_order' %}
            <p><strong>Type:</strong> Custom Order</p>
            <p><strong>Style:</strong> {{ shirt_style }} in {{ shirt_color }}</p>
            <p><strong>Size:</strong> {{ size }}</p>
            <p><strong>Print Location:</strong> {{ print_location }}</p>
            <p><strong>Quantity:</strong> {{ quantity }}</p>
            {% if special_instructions %}
            <p><strong>Special Instructions:</strong> {{ special_instructions }}</p>
            {% endif %}
            {% else %}
            <p><strong>Type:</strong> Regular Order</p>
            <p><strong>Items:</strong> {{ items_count }} item(s)</p>
            {% endif %}
            
            <p class="total"><strong>Total: ${{ total_amount }}</strong></p>
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul>
            <li>We'll start working on your order within 1-2 business days</li>
            <li>Production time: 3-5 business days</li>
            <li>Shipping: 2-3 business days</li>
            <li>You'll receive tracking information once shipped</li>
        </ul>
        
        <p>If you have any questions, reply to this email or call us!</p>
        
        <p>With love from Mississippi,<br>
        <strong>The Thorned Magnolia Collective Team</strong></p>
    </div>
    
    <div class="footer">
        <p>Thorned Magnolia Collective | Located in Mississippi | Made with Love</p>
        <p>thornedmagnoliaco@gmail.com</p>
    </div>
</body>
</html>
"""

BUSINESS_NOTIFICATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #C4B5A0; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .urgent { color: #6B4E37; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 New Order Received!</h1>
    </div>
    
    <div class="content">
        <p class="urgent">You have a new order that needs attention!</p>
        
        <div class="order-details">
            <h3>Order Information</h3>
            <p><strong>Order #:</strong> {{ order_id }}</p>
            <p><strong>Customer:</strong> {{ customer_name }} ({{ customer_email }})</p>
            {% if customer_phone %}
            <p><strong>Phone:</strong> {{ customer_phone }}</p>
            {% endif %}
            <p><strong>Order Date:</strong> {{ order_date }}</p>
            <p><strong>Payment Status:</strong> ✅ PAID (${{ total_amount }})</p>
            
            {% if order_type == 'custom_order' %}
            <h4>Custom Order Details:</h4>
            <p><strong>Style:</strong> {{ shirt_style }} in {{ shirt_color }}</p>
            <p><strong>Size:</strong> {{ size }} (Extra cost: ${{ size_extra_cost }})</p>
            <p><strong>Print:</strong> {{ print_location }}</p>
            <p><strong>Quantity:</strong> {{ quantity }}</p>
            {% if design_text %}
            <p><strong>Text Design:</strong> "{{ design_text }}"</p>
            {% endif %}
            {% if selected_font %}
            <p><strong>Font:</strong> {{ selected_font }}</p>
            {% endif %}
            {% if design_image %}
            <p><strong>Design Image:</strong> Uploaded (check server files)</p>
            {% endif %}
            {% if special_instructions %}
            <p><strong>Special Instructions:</strong> {{ special_instructions }}</p>
            {% endif %}
            {% else %}
            <h4>Regular Order Items:</h4>
            <ul>
            {% for item in items %}
                <li>{{ item.product_name }} - {{ item.selected_color }}/{{ item.selected_size }} ({{ item.print_location }}) x{{ item.quantity }} = ${{ item.total_price }}</li>
            {% endfor %}
            </ul>
            {% endif %}
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Confirm order details</li>
            <li>Start production</li>
            <li>Update customer on progress</li>
        </ol>
    </div>
</body>
</html>
"""

async def send_email(to_email, subject, html_content, from_name="Thorned Magnolia Collective"):
    """Send email using Gmail SMTP"""
    try:
        if not FROM_PASSWORD:
            logger.warning("Gmail app password not set. Emails won't be sent.")
            return False
            
        msg = MimeMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{from_name} <{FROM_EMAIL}>"
        msg['To'] = to_email

        # Add HTML content
        html_part = MimeText(html_content, 'html')
        msg.attach(html_part)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(FROM_EMAIL, FROM_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

async def send_order_confirmation(order_data):
    """Send order confirmation to customer"""
    try:
        template = Template(CUSTOMER_ORDER_TEMPLATE)
        
        # Prepare template variables
        template_vars = {
            'customer_name': order_data.get('customerName', order_data.get('customer_name', 'Valued Customer')),
            'order_id': order_data.get('orderId', order_data.get('order_id', 'TMC-ORDER')),
            'order_date': order_data.get('createdAt', order_data.get('order_date', 'Today')),
            'order_type': order_data.get('type', 'regular_order'),
            'total_amount': order_data.get('totalPrice', order_data.get('total_amount', 0)),
        }
        
        # Add specific fields based on order type
        if order_data.get('type') == 'custom_order':
            template_vars.update({
                'shirt_style': order_data.get('shirtStyle', 'T-Shirt'),
                'shirt_color': order_data.get('shirtColor', 'Not specified'),
                'size': order_data.get('size', 'Not specified'),
                'print_location': order_data.get('printLocation', 'front').replace('both', 'Front & Back'),
                'quantity': order_data.get('quantity', 1),
                'special_instructions': order_data.get('specialInstructions', '')
            })
        else:
            template_vars['items_count'] = len(order_data.get('items', []))
        
        html_content = template.render(**template_vars)
        
        customer_email = order_data.get('email', order_data.get('customerEmail', ''))
        subject = f"Order Confirmation - {template_vars['order_id']}"
        
        return await send_email(customer_email, subject, html_content)
        
    except Exception as e:
        logger.error(f"Error sending order confirmation: {e}")
        return False

async def send_business_notification(order_data):
    """Send order notification to business email"""
    try:
        template = Template(BUSINESS_NOTIFICATION_TEMPLATE)
        
        # Prepare template variables
        template_vars = {
            'order_id': order_data.get('orderId', order_data.get('order_id', 'TMC-ORDER')),
            'customer_name': order_data.get('customerName', order_data.get('customer_name', 'Unknown Customer')),
            'customer_email': order_data.get('email', order_data.get('customerEmail', 'Not provided')),
            'customer_phone': order_data.get('phone', ''),
            'order_date': order_data.get('createdAt', order_data.get('order_date', 'Today')),
            'order_type': order_data.get('type', 'regular_order'),
            'total_amount': order_data.get('totalPrice', order_data.get('total_amount', 0)),
        }
        
        # Add specific fields based on order type
        if order_data.get('type') == 'custom_order':
            template_vars.update({
                'shirt_style': order_data.get('shirtStyle', 'T-Shirt'),
                'shirt_color': order_data.get('shirtColor', 'Not specified'),
                'size': order_data.get('size', 'Not specified'),
                'size_extra_cost': 0,  # Could calculate this
                'print_location': order_data.get('printLocation', 'front').replace('both', 'Front & Back'),
                'quantity': order_data.get('quantity', 1),
                'design_text': order_data.get('designText', ''),
                'selected_font': order_data.get('selectedFont', ''),
                'design_image': order_data.get('designImage', ''),
                'special_instructions': order_data.get('specialInstructions', '')
            })
        else:
            template_vars['items'] = order_data.get('items', [])
        
        html_content = template.render(**template_vars)
        
        subject = f"🎉 New Order: {template_vars['order_id']} - ${template_vars['total_amount']}"
        
        return await send_email(BUSINESS_EMAIL, subject, html_content, "Order System")
        
    except Exception as e:
        logger.error(f"Error sending business notification: {e}")
        return False

async def send_order_emails(order_data):
    """Send both customer confirmation and business notification"""
    try:
        # Send both emails concurrently
        customer_result = await send_order_confirmation(order_data)
        business_result = await send_business_notification(order_data)
        
        return {
            'customer_email_sent': customer_result,
            'business_email_sent': business_result
        }
    except Exception as e:
        logger.error(f"Error sending order emails: {e}")
        return {
            'customer_email_sent': False,
            'business_email_sent': False
        }