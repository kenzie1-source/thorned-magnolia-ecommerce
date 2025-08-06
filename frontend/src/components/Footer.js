import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-cream-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_52cf19ad-c32d-4836-89a7-e393bc972a46/artifacts/nd1lbx1y_Business%20%233%20Logo.png" 
                alt="Thorned Magnolia Collective" 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-lg font-medium">Thorned Magnolia Collective</h3>
                <p className="text-sm text-soft-gray">Mississippi • Made with Love</p>
              </div>
            </div>
            <p className="text-warm-gray mb-4 max-w-md">
              Beautiful, comfortable apparel for every occasion. From custom designs to 
              curated collections, we bring southern charm to your wardrobe.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-warm-gray hover:text-warm-sage transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-warm-gray hover:text-warm-sage transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/category/teachers" className="block text-warm-gray hover:text-warm-sage transition-colors">
                Teachers
              </Link>
              <Link to="/category/mamas" className="block text-warm-gray hover:text-warm-sage transition-colors">
                Mamas
              </Link>
              <Link to="/category/dads" className="block text-warm-gray hover:text-warm-sage transition-colors">
                Dads
              </Link>
              <Link to="/category/holidays" className="block text-warm-gray hover:text-warm-sage transition-colors">
                Holidays
              </Link>
              <Link to="/custom-orders" className="block text-warm-sage hover:text-soft-taupe transition-colors">
                Custom Orders
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-medium mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-warm-gray">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Mississippi, USA</span>
              </div>
              <div className="flex items-center space-x-2 text-warm-gray">
                <Mail className="h-4 w-4" />
                <span className="text-sm">info@thornedmagnolia.com</span>
              </div>
              <div className="flex items-center space-x-2 text-warm-gray">
                <Phone className="h-4 w-4" />
                <span className="text-sm">(555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-warm-gray border-opacity-20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-4 w-4 text-warm-sage" />
              <p className="text-sm text-warm-gray">
                © 2024 Thorned Magnolia Collective. Made with love in Mississippi.
              </p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-warm-gray hover:text-warm-sage transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-warm-gray hover:text-warm-sage transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-warm-gray hover:text-warm-sage transition-colors">
                Shipping Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;