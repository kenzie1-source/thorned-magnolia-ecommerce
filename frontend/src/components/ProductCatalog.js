import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Heart, Star, Filter, ArrowLeft } from 'lucide-react';
import { categories, products, addToCart } from '../mock';
import { useToast } from '../hooks/use-toast';

const ProductCatalog = () => {
  const { categoryId } = useParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { toast } = useToast();

  const category = categories.find(cat => cat.id === categoryId);
  const categoryProducts = products.filter(product => product.category === categoryId);

  useEffect(() => {
    let filtered = [...categoryProducts];

    // Filter by size
    if (selectedSize && selectedSize !== 'all') {
      filtered = filtered.filter(product => product.sizes.includes(selectedSize));
    }

    // Filter by color
    if (selectedColor && selectedColor !== 'all') {
      filtered = filtered.filter(product => product.colors.includes(selectedColor));
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [categoryProducts, sortBy, selectedSize, selectedColor]);

  const handleAddToCart = (product) => {
    addToCart(product, { size: 'M', color: product.colors[0] });
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const allColors = [...new Set(categoryProducts.flatMap(product => product.colors))];
  const allSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-charcoal mb-4">Category not found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page bg-cream-white min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-warm-sage hover:text-rich-chocolate mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-light text-charcoal mb-2">{category.name}</h1>
          <p className="text-lg text-warm-gray">{category.description}</p>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-soft-gray rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-charcoal" />
              <span className="font-medium text-charcoal">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="min-w-40">
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {allSizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-40">
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    {allColors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-40">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="product-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <Button 
                  size="sm" 
                  className="absolute top-4 right-4 btn-icon bg-cream-white/80 hover:bg-cream-white"
                  variant="outline"
                >
                  <Heart className="h-4 w-4 text-charcoal" />
                </Button>
                <Badge className="absolute bottom-4 left-4 bg-warm-sage text-cream-white">
                  {category.name}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-charcoal mb-2">
                  {product.name}
                </h3>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.colors.slice(0, 4).map(color => (
                    <div 
                      key={color}
                      className="w-4 h-4 rounded-full border border-warm-gray"
                      style={{ 
                        backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : 
                                        color.toLowerCase() === 'black' ? '#000000' :
                                        color.toLowerCase() === 'navy' ? '#001f3f' :
                                        color.toLowerCase() === 'gray' ? '#808080' :
                                        color.toLowerCase() === 'red' ? '#dc3545' :
                                        color.toLowerCase() === 'pink' ? '#e83e8c' :
                                        color.toLowerCase() === 'sage' ? '#C4B5A0' :
                                        '#C4B5A0'
                      }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-xs text-warm-gray">+{product.colors.length - 4}</span>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-semibold text-rich-chocolate">
                      ${product.price}
                    </span>
                    <span className="text-sm text-warm-gray">
                      Front only • +$5 for back
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

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-light text-charcoal mb-4">
              No products found
            </h3>
            <p className="text-warm-gray mb-6">
              Try adjusting your filters or check back later for new items.
            </p>
            <Button onClick={() => {
              setSelectedSize('all');
              setSelectedColor('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;