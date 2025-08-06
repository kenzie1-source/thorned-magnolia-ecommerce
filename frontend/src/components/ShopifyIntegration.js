import React, { useEffect } from 'react';

const ShopifyIntegration = ({ productId, collectionId, style = "product", className = "" }) => {
  const componentId = `shopify-component-${productId || collectionId || 'default'}-${Date.now()}`;

  useEffect(() => {
    // Function to initialize Shopify Buy Button
    const initializeShopify = () => {
      if (window.ShopifyBuy && window.ShopifyBuy.UI) {
        const client = window.ShopifyBuy.buildClient({
          domain: '0wchee-yg.myshopify.com',
          storefrontAccessToken: 'dfc4c525dc22e946e8f9b8adc040875d',
        });

        window.ShopifyBuy.UI.onReady(client).then(function (ui) {
          const config = {
            id: productId || collectionId || '511471550742',
            node: document.getElementById(componentId),
            moneyFormat: '%24%7B%7Bamount%7D%7D',
            options: {
              product: {
                styles: {
                  product: {
                    "@media (min-width: 601px)": {
                      "max-width": "100%",
                      "margin-left": "0px",
                      "margin-bottom": "20px",
                      "width": "100%"
                    },
                    "img": {
                      "height": "calc(100% - 15px)",
                      "position": "absolute",
                      "left": "0",
                      "right": "0",
                      "top": "0"
                    },
                    "imgWrapper": {
                      "padding-top": "calc(75% + 15px)",
                      "position": "relative",
                      "height": "0"
                    }
                  },
                  button: {
                    "font-family": "'Montserrat', sans-serif",
                    "font-size": "14px",
                    "padding-top": "12px",
                    "padding-bottom": "12px",
                    "color": "#FAF9F7",
                    "background-color": "#C4B5A0",
                    "border": "none",
                    "border-radius": "8px",
                    "font-weight": "500",
                    "letter-spacing": "0.5px",
                    "text-transform": "uppercase",
                    ":hover": {
                      "background-color": "#B5A390",
                      "color": "#FAF9F7"
                    },
                    ":focus": {
                      "background-color": "#B5A390"
                    }
                  },
                  title: {
                    "font-family": "'Playfair Display', serif",
                    "font-size": "18px",
                    "color": "#2C2C2C",
                    "font-weight": "400"
                  },
                  price: {
                    "font-family": "'Montserrat', sans-serif",
                    "font-size": "20px",
                    "color": "#6B4E37",
                    "font-weight": "600"
                  }
                },
                text: {
                  button: "Add to Cart"
                }
              },
              productSet: {
                styles: {
                  products: {
                    "@media (min-width: 601px)": {
                      "margin-left": "0px"
                    }
                  }
                }
              },
              modalProduct: {
                contents: {
                  img: false,
                  imgWithCarousel: true,
                  button: false,
                  buttonWithQuantity: true
                },
                styles: {
                  product: {
                    "@media (min-width: 601px)": {
                      "max-width": "100%",
                      "margin-left": "0px",
                      "margin-bottom": "0px"
                    }
                  },
                  button: {
                    "font-family": "'Montserrat', sans-serif",
                    "font-size": "14px",
                    "padding-top": "12px",
                    "padding-bottom": "12px",
                    "color": "#FAF9F7",
                    "background-color": "#C4B5A0",
                    "border": "none",
                    "border-radius": "8px",
                    "font-weight": "500",
                    "letter-spacing": "0.5px",
                    "text-transform": "uppercase",
                    ":hover": {
                      "background-color": "#B5A390",
                      "color": "#FAF9F7"
                    }
                  }
                },
                text: {
                  button: "Add to Cart"
                }
              },
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
                    ":hover": {
                      "background-color": "#B5A390"
                    }
                  },
                  count: {
                    "font-size": "12px"
                  }
                }
              }
            }
          };

          ui.createComponent(style, config);
        });
      }
    };

    // Load Shopify Buy Button script if not already loaded
    if (window.ShopifyBuy) {
      if (window.ShopifyBuy.UI) {
        initializeShopify();
      } else {
        // Wait for UI to be ready
        const checkUI = setInterval(() => {
          if (window.ShopifyBuy.UI) {
            clearInterval(checkUI);
            initializeShopify();
          }
        }, 100);
      }
    } else {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
      script.onload = initializeShopify;
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const element = document.getElementById(componentId);
      if (element) {
        element.innerHTML = '';
      }
    };
  }, [componentId, productId, collectionId, style]);

  return (
    <div 
      id={componentId} 
      className={`shopify-component ${className}`}
      style={{ 
        minHeight: style === 'product' ? '300px' : 'auto',
        width: '100%'
      }}
    />
  );
};

export default ShopifyIntegration;