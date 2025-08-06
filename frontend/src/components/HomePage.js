import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react';
import { categoriesAPI, productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, productsData] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll()
        ]);
        setCategories(categoriesData);
        setFeaturedProducts(productsData.slice(0, 4));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = async (product) => {
    const defaultOptions = {
      selectedColor: product.colors[0],
      selectedSize: 'M',
      printLocation: 'front',
      quantity: 1
    };
    
    await addToCart(product, defaultOptions);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-sage mx-auto mb-4"></div>
          <p className="text-warm-gray">Loading your shopping experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section relative bg-gradient-to-br from-cream-white to-soft-gray py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_52cf19ad-c32d-4836-89a7-e393bc972a46/artifacts/nd1lbx1y_Business%20%233%20Logo.png" 
              alt="Thorned Magnolia Collective" 
              className="w-32 h-32 mx-auto mb-6 rounded-full shadow-lg"
            />
            <h1 className="hero-title text-5xl md:text-6xl font-light text-charcoal mb-4">
              Thorned Magnolia Collective
            </h1>
            <p className="hero-subtitle text-xl text-warm-gray mb-8 max-w-2xl mx-auto">
              Beautiful, comfortable apparel for every occasion. Located in Mississippi, 
              designed with love for the whole family.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-primary px-8 py-3 text-lg" onClick={() => {
              document.querySelector('.shopify-products-section').scrollIntoView({ behavior: 'smooth' });
            }}>
              Shop Now
              <ShoppingBag className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/custom-orders">
              <Button variant="outline" className="btn-secondary px-8 py-3 text-lg">
                Custom Orders
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-section py-16 px-4 bg-cream-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-4xl font-light text-center text-charcoal mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.id}`}>
                <Card className="category-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-medium text-charcoal mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-warm-gray">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shopify Products - Replaces Featured Products */}
      <section className="featured-section py-16 px-4 bg-soft-gray">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-4xl font-light text-center text-charcoal mb-12">
            Shop Our Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="product-card hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <Button 
                    size="sm" 
                    className="absolute top-4 right-4 btn-icon"
                    variant="outline"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium text-charcoal mb-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-rich-chocolate">
                        ${product.price}
                      </span>
                      <span className="text-sm text-warm-gray">
                        {product.type === 'sweatshirt' ? 'Sweatshirt' : 'T-Shirt'} • Front only
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-warm-gray ml-1">4.8</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full btn-primary"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Orders CTA */}
      <section className="custom-cta-section py-16 px-4 bg-warm-sage text-cream-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-6">
            Have a Custom Design in Mind?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Upload your own image, choose your favorite font, and create something uniquely yours.
          </p>
          <Link to="/custom-orders">
            <Button size="lg" className="bg-cream-white text-warm-sage hover:bg-soft-gray px-8 py-3">
              Start Custom Order
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section py-16 px-4 bg-cream-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-4xl font-light text-center text-charcoal mb-12">
            Why Choose Thorned Magnolia Collective
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-warm-sage rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-cream-white" />
              </div>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                Made with Love
              </h3>
              <p className="text-warm-gray">
                Every piece is crafted with care in Mississippi, bringing southern charm to your wardrobe.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warm-sage rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-cream-white" />
              </div>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                Premium Quality
              </h3>
              <p className="text-warm-gray">
                High-quality materials and printing ensure your favorite tees last for years to come.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warm-sage rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-cream-white" />
              </div>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                Fast Shipping
              </h3>
              <p className="text-warm-gray">
                Quick processing and reliable shipping to get your new favorites to you fast.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;