import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_live_51RtD5HF4rcLrOAiC86PPkzj83UmojJpzofsoVPaaoG3Ff4nTVZKIIJRoIMxuS3ELSOGP5odien2baIPRQglIDPJR00GG5P6E4P');

const StripeContext = createContext();

export const StripeProvider = ({ children }) => {
  const options = {
    // Passing the client secret obtained from the server
    mode: 'payment',
    currency: 'usd',
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

  return (
    <StripeContext.Provider value={{ stripePromise }}>
      <Elements stripe={stripePromise} options={options}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};