import React, { useState, useEffect } from 'react';
import { getProductImageUrlIfExists } from '../../utils/imageUtils';

interface ProductImageProps {
  productId: number;
  alt: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ productId, alt, className = '' }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const url = await getProductImageUrlIfExists(productId);
      setImageUrl(url);
      setLoading(false);
    };

    loadImage();
  }, [productId]);

  // No mostrar nada mientras carga o si no hay imagen
  if (loading || !imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`product-image ${className}`}
      loading="lazy"
    />
  );
};

export default ProductImage;
