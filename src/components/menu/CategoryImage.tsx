import React, { useState, useEffect } from 'react';
import { getCategoryImageUrlIfExists } from '../../utils/imageUtils';

interface CategoryImageProps {
  categoryId: number;
  alt: string;
  className?: string;
}

const CategoryImage: React.FC<CategoryImageProps> = ({ categoryId, alt, className = '' }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      const url = await getCategoryImageUrlIfExists(categoryId);
      setImageUrl(url);
      setLoading(false);
    };

    loadImage();
  }, [categoryId]);

  // No mostrar nada mientras carga o si no hay imagen
  if (loading || !imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`category-image ${className}`}
      loading="lazy"
    />
  );
};

export default CategoryImage;