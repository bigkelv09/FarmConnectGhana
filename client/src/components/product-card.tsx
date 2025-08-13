import { Link } from 'wouter';
import { Product, User } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product & { seller?: User };
  onFavoriteToggle?: (productId: string) => void;
  isFavorited?: boolean;
}

export function ProductCard({ product, onFavoriteToggle, isFavorited }: ProductCardProps) {
  const categoryColors = {
    crops: 'bg-lime-green text-dark-green',
    tools: 'bg-harvest-orange text-white',
    medications: 'bg-forest-green text-white',
  };

  const categoryLabels = {
    crops: 'Fresh',
    tools: 'Equipment',
    medications: 'Fertilizer',
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group" data-testid={`product-card-${product.id}`}>
      <div className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className={categoryColors[product.category]} data-testid={`badge-${product.category}`}>
            {categoryLabels[product.category]}
          </Badge>
          {onFavoriteToggle && (
            <button
              onClick={() => onFavoriteToggle(product.id)}
              className={`transition-colors ${isFavorited ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
              data-testid={`favorite-${product.id}`}
            >
              <Heart className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        
        <h3 className="font-semibold text-dark-green mb-2" data-testid={`product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid={`product-description-${product.id}`}>
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-forest-green font-bold text-lg" data-testid={`product-price-${product.id}`}>
            GHS {product.price}/{product.unit}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            <span data-testid={`product-location-${product.id}`}>{product.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1" data-testid={`product-rating-${product.id}`}>
              4.8 (24)
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Link href={`/product/${product.id}`}>
              <Button size="sm" variant="outline" data-testid={`view-product-${product.id}`}>
                View Details
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="bg-harvest-orange text-white hover:bg-harvest-orange/90"
              data-testid={`contact-seller-${product.id}`}
            >
              Contact
            </Button>
          </div>
        </div>
        
        {product.seller && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Sold by {product.seller.firstName} {product.seller.lastName}
              </span>
              <span className="text-xs text-gray-400">
                {product.quantity} {product.unit}s available
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
