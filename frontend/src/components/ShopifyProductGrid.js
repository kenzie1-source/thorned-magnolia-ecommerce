import React from 'react';
import ShopifyIntegration from './ShopifyIntegration';

const ShopifyProductGrid = ({ title = "Featured Products", collectionId = "511471550742" }) => {
  return (
    <section className="shopify-products-section py-16 px-4 bg-soft-gray">
      <div className="max-w-6xl mx-auto">
        <h2 className="section-title text-4xl font-light text-center text-charcoal mb-12">
          {title}
        </h2>
        <div className="shopify-products-container">
          <ShopifyIntegration 
            collectionId={collectionId}
            style="collection"
            className="shopify-collection-grid"
          />
        </div>
      </div>
    </section>
  );
};

export default ShopifyProductGrid;