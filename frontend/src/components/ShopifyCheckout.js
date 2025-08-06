import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ShoppingBag } from 'lucide-react';

const ShopifyCheckout = ({ className = "" }) => {
  const [cartCount, setCartCount] = useState(0);
  const componentId = `shopify-cart-${Date.now()}`;

  useEffect(() => {
    const initializeCart = () => {
      if (window.ShopifyBuy && window.ShopifyBuy.UI) {
        const client = window.ShopifyBuy.buildClient({
          domain: '0wchee-yg.myshopify.com',
          storefrontAccessToken: 'dfc4c525dc22e946e8f9b8adc040875d',
        });

        window.ShopifyBuy.UI.onReady(client).then(function (ui) {
          ui.createComponent('cart', {
            node: document.getElementById(componentId),
            moneyFormat: '%24%7B%7Bamount%7D%7D',
            options: {
              cart: {
                styles: {
                  button: {
                    "font-family": "'Montserrat', sans-serif",
                    "background-color": "#C4B5A0",
                    "color": "#FAF9F7",
                    "border-radius": "8px",
                    ":hover": {
                      "background-color": "#B5A390"
                    }
                  },
                  footer: {
                    "background-color": "#FAF9F7"
                  }
                },
                text: {
                  total: "Subtotal",
                  button: "Checkout"
                }
              },
              toggle: {
                styles: {
                  toggle: {
                    "font-family": "'Montserrat', sans-serif",
                    "background-color": "#C4B5A0",
                    "color": "#FAF9F7",
                    "border": "none",
                    "border-radius": "50%",
                    "width": "40px",
                    "height": "40px",
                    ":hover": {
                      "background-color": "#B5A390"
                    }
                  },
                  count: {
                    "font-size": "12px",
                    "font-weight": "bold"
                  }
                }
              }
            }
          });
        });
      }
    };

    // Load Shopify Buy Button script if not already loaded
    if (window.ShopifyBuy) {
      if (window.ShopifyBuy.UI) {
        initializeCart();
      } else {
        const checkUI = setInterval(() => {
          if (window.ShopifyBuy.UI) {
            clearInterval(checkUI);
            initializeCart();
          }
        }, 100);
      }
    } else {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
      script.onload = initializeCart;
      document.head.appendChild(script);
    }

    return () => {
      const element = document.getElementById(componentId);
      if (element) {
        element.innerHTML = '';
      }
    };
  }, [componentId]);

  return (
    <div className={`shopify-cart ${className}`}>
      <div id={componentId}></div>
    </div>
  );
};

export default ShopifyCheckout;