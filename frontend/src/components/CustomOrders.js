import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Upload, ArrowLeft, Image as ImageIcon, Type, Palette, Shirt } from 'lucide-react';
import { customOrdersAPI, uploadAPI, utilityAPI, calculatePrice } from '../services/api';
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
    printLocation: 'front',
    quantity: 1,
    specialInstructions: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [shirtStyles, setShirtStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUtilityData = async () => {
      try {
        const [fontsData, sizesData, colorsData, stylesData] = await Promise.all([
          utilityAPI.getFonts(),
          utilityAPI.getSizes(),
          utilityAPI.getColors(),
          utilityAPI.getShirtStyles()
        ]);
        
        setFonts(fontsData);
        setSizes(sizesData);
        setColors(colorsData);
        setShirtStyles(stylesData);
      } catch (error) {
        console.error('Error loading utility data:', error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUtilityData();
  }, [toast]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or GIF image.",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      try {
        // Upload file
        const uploadResponse = await uploadAPI.uploadFile(file);
        setFormData(prev => ({ ...prev, designImage: uploadResponse.filepath }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        toast({
          title: "Image uploaded",
          description: "Your design image has been uploaded successfully.",
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const calculateTotalPrice = () => {
    if (!formData.shirtStyle || !formData.size) return 0;
    return calculatePrice(formData.shirtStyle, formData.size, formData.printLocation, formData.quantity);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        designImage: formData.designImage,
        designText: formData.designText,
        selectedFont: formData.selectedFont,
        shirtStyle: formData.shirtStyle,
        shirtColor: formData.shirtColor,
        size: formData.size,
        printLocation: formData.printLocation,
        quantity: formData.quantity,
        specialInstructions: formData.specialInstructions
      };

      const result = await customOrdersAPI.create(orderData);
      
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
        printLocation: 'front',
        quantity: 1,
        specialInstructions: ''
      });
      setImagePreview('');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error submitting order",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-sage mx-auto mb-4"></div>
          <p className="text-warm-gray">Loading custom order form...</p>
        </div>
      </div>
    );
  }

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
                          {shirtStyles.map(style => (
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
                      <Select value={formData.printLocation} onValueChange={(value) => handleInputChange('printLocation', value)}>
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
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
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
                        <span>{shirtStyles.find(s => s.id === formData.shirtStyle)?.name}</span>
                        <span>${shirtStyles.find(s => s.id === formData.shirtStyle)?.basePrice}</span>
                      </div>
                    )}
                    
                    {formData.size && sizes.find(s => s.id === formData.size)?.extraCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Size upgrade ({formData.size})</span>
                        <span>+${sizes.find(s => s.id === formData.size)?.extraCost}</span>
                      </div>
                    )}
                    
                    {formData.printLocation === 'both' && (
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
                    <span className="text-rich-chocolate">${calculateTotalPrice()}</span>
                  </div>

                  {formData.shirtColor && (
                    <div className="mt-4">
                      <Badge variant="outline" className="w-full justify-center">
                        {formData.shirtColor} {formData.shirtStyle && shirtStyles.find(s => s.id === formData.shirtStyle)?.name}
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