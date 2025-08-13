import { User } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface SellerCardProps {
  seller: User;
  productCount?: number;
  rating?: number;
  reviewCount?: number;
  yearsExperience?: number;
}

export function SellerCard({ 
  seller, 
  productCount = 0, 
  rating = 4.8, 
  reviewCount = 25,
  yearsExperience = 5 
}: SellerCardProps) {
  const getSpecialization = (accountType: string) => {
    switch (accountType) {
      case 'farmer':
        return 'Organic Vegetable Farmer';
      default:
        return 'Agricultural Supplier';
    }
  };

  return (
    <Card className="text-center hover:shadow-xl transition-all duration-300" data-testid={`seller-card-${seller.id}`}>
      <CardContent className="p-6">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-500">
            {seller.firstName[0]}{seller.lastName[0]}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-dark-green mb-2" data-testid={`seller-name-${seller.id}`}>
          {seller.firstName} {seller.lastName}
        </h3>
        
        <p className="text-gray-600 mb-3" data-testid={`seller-specialization-${seller.id}`}>
          {getSpecialization(seller.accountType)}
        </p>
        
        <p className="text-sm text-gray-500 mb-4" data-testid={`seller-location-${seller.id}`}>
          {seller.location || 'Ghana'}
        </p>
        
        <div className="flex justify-center items-center mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="w-4 h-4 fill-current" 
                data-testid={`seller-star-${seller.id}-${star}`}
              />
            ))}
          </div>
          <span className="text-gray-600 ml-2 text-sm" data-testid={`seller-rating-${seller.id}`}>
            {rating} ({reviewCount} reviews)
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-forest-green font-bold text-lg" data-testid={`seller-products-${seller.id}`}>
              {productCount}
            </p>
            <p className="text-gray-600 text-sm">Products</p>
          </div>
          <div>
            <p className="text-forest-green font-bold text-lg" data-testid={`seller-years-${seller.id}`}>
              {yearsExperience}
            </p>
            <p className="text-gray-600 text-sm">Years</p>
          </div>
        </div>
        
        <Button 
          className="bg-forest-green text-white hover:bg-forest-green/90 w-full"
          data-testid={`view-store-${seller.id}`}
        >
          View Store
        </Button>
      </CardContent>
    </Card>
  );
}
