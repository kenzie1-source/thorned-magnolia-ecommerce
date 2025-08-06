import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const stripePromise = loadStripe('pk_live_51RtD5HF4rcLrOAiC86PPkzj83UmojJpzofsoVPaaoG3Ff4nTVZKIIJRoIMxuS3ELSOGP5odien2baIPRQglIDPJR00GG5P6E4P');

const CheckoutForm = ({ amount, orderData, onSuccess, onCancel, title }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: orderData?.customerName || '',
    email: orderData?.email || '',
    phone: orderData?.phone || ''
  });
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          },
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your order has been processed successfully.",
        });
        onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-warm-sage" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="customer-name">Full Name</Label>
              <Input
                id="customer-name"
                value={customerInfo.name}
                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer-phone">Phone (Optional)</Label>
              <Input
                id="customer-phone"
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Payment Element */}
          <div className="mb-6">
            <Label className="block mb-2">Payment Information</Label>
            <PaymentElement />
          </div>

          {/* Order Summary */}
          <div className="bg-soft-gray rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium text-charcoal">Total</span>
              <span className="font-semibold text-xl text-rich-chocolate">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isLoading}
              className="flex-1 btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const StripeCheckout = ({ amount, orderData, onSuccess, onCancel, title = "Complete Payment" }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            orderData: orderData,
            customerInfo: {
              name: orderData?.customerName || '',
              email: orderData?.email || '',
              phone: orderData?.phone || ''
            }
          }),
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: "Payment Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Payment Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, orderData, toast]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#C4B5A0',
        colorBackground: '#FAF9F7',
        colorText: '#2C2C2C',
        colorDanger: '#df1b41',
        fontFamily: '"Montserrat", sans-serif',
        spacingUnit: '2px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          borderRadius: '8px',
          border: '1px solid #D4C4B0',
        },
        '.Input:focus': {
          borderColor: '#C4B5A0',
        },
        '.Label': {
          color: '#2C2C2C',
          fontWeight: '500',
        },
      },
    },
  };

  if (loading || !clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-warm-sage" />
          <span className="ml-2 text-warm-gray">Initializing payment...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        amount={amount} 
        orderData={orderData} 
        onSuccess={onSuccess} 
        onCancel={onCancel} 
        title={title} 
      />
    </Elements>
  );
};

export default StripeCheckout;