import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Upload, ArrowLeft, Image as ImageIcon, Type, Palette, Shirt } from 'lucide-react';
import { fonts, tshirtStyles, colors, sizes, submitCustomOrder } from '../mock';
import { useToast } from '../hooks/use-toast';

const CustomOrders = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    designImage: null,
    designText: '',
    selectedFont: '',
    shirtStyle: '',
    shirtColor: '',
    size: '',
    frontBack: 'front',
    quantity: 1,
    specialInstructions: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, designImage: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePrice = () => {
    const selectedStyle = tshirtStyles.find(style => style.id === formData.shirtStyle);
    const selectedSize = sizes.find(size => size.id === formData.size);
    
    if (!selectedStyle || !selectedSize) return 0;
    
    let basePrice = selectedStyle.basePrice;
    if (formData.frontBack === 'both') basePrice += 5;
    
    const sizePrice = basePrice + selectedSize.extraCost;
    return sizePrice * formData.quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        ...formData,
        totalPrice: calculatePrice(),
        orderDate: new Date().toISOString()
      };

      const result = await submitCustomOrder(orderData);
      
      if (result.success) {
        toast({
          title: "Order submitted successfully!",
          description: `Your custom order #${result.orderId} has been received. We'll contact you within 24 hours.`,
        });
        
        // Reset form
        setFormData({
          customerName: '',
          email: '',
          phone: '',
          designImage: null,
          designText: '',
          selectedFont: '',
          shirtStyle: '',
          shirtColor: '',
          size: '',
          frontBack: 'front',
          quantity: 1,
          specialInstructions: ''
        });
        setImagePreview('');
      }
    } catch (error) {
      toast({
        title: "Error submitting order",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="custom-orders-page bg-cream-white min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-warm-sage hover:text-rich-chocolate mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-light text-charcoal mb-2">Custom Orders</h1>
          <p className="text-lg text-warm-gray">
            Create something uniquely yours! Upload your design and customize every detail.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Type className="h-5 w-5 mr-2 text-warm-sage" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Design Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-warm-sage" />
                    Design Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="designImage">Upload Your Design</Label>
                    <div className="mt-2">
                      <input
                        id="designImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="designImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-warm-sage rounded-lg cursor-pointer bg-soft-gray hover:bg-warm-sage/10 transition-colors"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Design preview" className="h-24 w-auto object-contain" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-warm-sage mb-2" />
                            <span className="text-sm text-charcoal">Click to upload your design</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="designText">Or Enter Text for Design</Label>
                    <Input
                      id="designText"
                      value={formData.designText}
                      onChange={(e) => handleInputChange('designText', e.target.value)}
                      placeholder="Enter text to be printed"
                    />
                  </div>

                  <div>
                    <Label>Choose Font Style</Label>
                    <Select value={formData.selectedFont} onValueChange={(value) => handleInputChange('selectedFont', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map(font => (
                          <SelectItem key={font.id} value={font.id}>
                            <span style={{ fontFamily: font.id === 'serif' ? 'serif' : 
                                                    font.id === 'script' ? 'cursive' : 
                                                    font.id === 'handwritten' ? 'cursive' : 'sans-serif' }}>
                              {font.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Product Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shirt className="h-5 w-5 mr-2 text-warm-sage" />
                    Product Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Shirt Style *</Label>
                      <Select value={formData.shirtStyle} onValueChange={(value) => handleInputChange('shirtStyle', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose style" />
                        </SelectTrigger>
                        <SelectContent>
                          {tshirtStyles.map(style => (
                            <SelectItem key={style.id} value={style.id}>
                              {style.name} (${style.basePrice})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Color *</Label>
                      <Select value={formData.shirtColor} onValueChange={(value) => handleInputChange('shirtColor', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map(color => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center">
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                                  style={{ 
                                    backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : 
                                                    color.toLowerCase() === 'black' ? '#000000' :
                                                    color.toLowerCase() === 'navy' ? '#001f3f' :
                                                    '#C4B5A0'
                                  }}
                                />
                                {color}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Size *</Label>
                      <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map(size => (
                            <SelectItem key={size.id} value={size.id}>
                              {size.name} {size.extraCost > 0 && `(+$${size.extraCost})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Print Location *</Label>
                      <Select value={formData.frontBack} onValueChange={(value) => handleInputChange('frontBack', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="front">Front Only</SelectItem>
                          <SelectItem value="back">Back Only</SelectItem>
                          <SelectItem value="both">Front & Back (+$5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      placeholder="Any special requests or instructions?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-warm-sage" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {formData.shirtStyle && (
                      <div className="flex justify-between text-sm">
                        <span>{tshirtStyles.find(s => s.id === formData.shirtStyle)?.name}</span>
                        <span>${tshirtStyles.find(s => s.id === formData.shirtStyle)?.basePrice}</span>
                      </div>
                    )}
                    
                    {formData.size && sizes.find(s => s.id === formData.size)?.extraCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Size upgrade ({formData.size})</span>
                        <span>+${sizes.find(s => s.id === formData.size)?.extraCost}</span>
                      </div>
                    )}
                    
                    {formData.frontBack === 'both' && (
                      <div className="flex justify-between text-sm">
                        <span>Front & Back print</span>
                        <span>+$5</span>
                      </div>
                    )}
                    
                    {formData.quantity > 1 && (
                      <div className="flex justify-between text-sm">
                        <span>Quantity</span>
                        <span>×{formData.quantity}</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-warm-gray/20" />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-rich-chocolate">${calculatePrice()}</span>
                  </div>

                  {formData.shirtColor && (
                    <div className="mt-4">
                      <Badge variant="outline" className="w-full justify-center">
                        {formData.shirtColor} {formData.shirtStyle && tshirtStyles.find(s => s.id === formData.shirtStyle)?.name}
                      </Badge>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full btn-primary mt-6" 
                    disabled={isSubmitting || !formData.customerName || !formData.email}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Custom Order'}
                  </Button>

                  <p className="text-xs text-warm-gray text-center mt-4">
                    We'll contact you within 24 hours to confirm details and arrange payment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomOrders;