import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, ShoppingBag, Search, Heart } from 'lucide-react';
import { categoriesAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoriesAPI.getAll();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
    setIsOpen(false);
  };

  return (
    <nav className="navbar bg-cream-white shadow-sm border-b border-soft-gray sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_52cf19ad-c32d-4836-89a7-e393bc972a46/artifacts/nd1lbx1y_Business%20%233%20Logo.png" 
              alt="Thorned Magnolia Collective" 
              className="w-10 h-10 rounded-full"
            />
            <span className="brand-name text-xl font-medium text-charcoal hidden sm:block">
              Thorned Magnolia Collective
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {categories.slice(0, 6).map((category) => (
                <Link 
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="nav-link text-sm font-medium text-charcoal hover:text-warm-sage transition-colors uppercase tracking-wide"
                >
                  {category.name}
                </Link>
              ))}
              <Link 
                to="/custom-orders"
                className="nav-link text-sm font-medium text-warm-sage hover:text-rich-chocolate transition-colors uppercase tracking-wide"
              >
                Custom Orders
              </Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="h-5 w-5 text-charcoal" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Heart className="h-5 w-5 text-charcoal" />
            </Button>
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingBag className="h-5 w-5 text-charcoal" />
              <span className="absolute -top-1 -right-1 bg-warm-sage text-cream-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemsCount()}
              </span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6 text-charcoal" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-cream-white">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="text-center">
                    <img 
                      src="https://customer-assets.emergentagent.com/job_52cf19ad-c32d-4836-89a7-e393bc972a46/artifacts/nd1lbx1y_Business%20%233%20Logo.png" 
                      alt="Thorned Magnolia Collective" 
                      className="w-16 h-16 rounded-full mx-auto mb-4"
                    />
                    <h2 className="text-lg font-medium text-charcoal">
                      Shop Categories
                    </h2>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="justify-start text-left"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      className="justify-start text-left text-warm-sage"
                      onClick={() => {
                        navigate('/custom-orders');
                        setIsOpen(false);
                      }}
                    >
                      Custom Orders
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;