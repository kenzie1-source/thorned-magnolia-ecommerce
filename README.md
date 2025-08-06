# Thorned Magnolia Collective

Beautiful e-commerce website for custom t-shirts and apparel, built with React, FastAPI, MongoDB, and Stripe payments.

## Features

- 🛍️ **E-commerce Platform**: Full shopping cart and checkout system
- 💳 **Stripe Payments**: Secure credit card processing
- 🎨 **Custom Orders**: File uploads with pricing calculator
- 📧 **Email Notifications**: Automatic order confirmations
- 📱 **Mobile Responsive**: Works on all devices
- 🎵 **Background Music**: Optional R&B playlist

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Payments**: Stripe
- **Emails**: Gmail SMTP
- **Hosting**: Vercel

## Deployment

This project is configured for automatic deployment on Vercel.

### Environment Variables

Set these in your Vercel dashboard:

- `MONGO_URL`: Your MongoDB connection string
- `GMAIL_APP_PASSWORD`: Gmail app password for email notifications

## Local Development

1. Install dependencies:
   ```bash
   cd frontend && yarn install
   cd ../backend && pip install -r requirements.txt
   ```

2. Start development servers:
   ```bash
   # Frontend (port 3000)
   cd frontend && yarn start
   
   # Backend (port 8001)
   cd backend && python server.py
   ```

## Order Management

- **Regular Orders**: Products added to cart with Stripe checkout
- **Custom Orders**: File upload + specifications with automatic pricing
- **Email Notifications**: Sent to both customer and business
- **Payment Processing**: Live Stripe integration with receipt handling

## Design System

- **Colors**: Warm Sage (#C4B5A0), Soft Taupe (#D4C4B0), Rich Chocolate (#6B4E37)
- **Typography**: Playfair Display (headers), Montserrat (body)
- **Components**: Custom-designed with shadcn/ui base

## Business Logic

- **T-Shirts**: $20 (front), $25 (front & back)
- **Sweatshirts**: $25 (front), $30 (front & back)  
- **Size Premiums**: +$2 for 2XL, +$4 for 3XL, etc.
- **File Uploads**: Organized by date in /uploads/custom-orders/

---

Made with ❤️ in Mississippi