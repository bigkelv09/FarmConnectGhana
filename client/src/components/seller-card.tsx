import { User } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Shield } from 'lucide-react';

interface SellerCardProps {
  seller: User;
}

export function SellerCard({ seller }: SellerCardProps) {
  const getSpecialization = (accountType: string) => {
    switch (accountType) {
      case 'farmer':
        return 'Farmer';
      case 'buyer':
        return 'Buyer';
      default:
        return 'User';
    }
  };

  const getJoinDate = (createdAt: string | Date) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card className="text-center hover:shadow-lg transition-all duration-300" data-testid={`seller-card-${seller.id}`}>
      <CardContent className="p-6">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
          <span className="text-2xl font-bold text-green-700">
            {seller.firstName[0]}{seller.lastName[0]}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid={`seller-name-${seller.id}`}>
          {seller.firstName} {seller.lastName}
        </h3>

        <div className="flex items-center justify-center mb-3">
          <Badge variant="secondary" className="text-xs">
            {getSpecialization(seller.accountType)}
          </Badge>
          {seller.verified && (
            <Badge variant="default" className="text-xs ml-2 bg-green-600">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {seller.location && (
          <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {seller.location}
          </div>
        )}

        <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          Member since {getJoinDate(seller.createdAt)}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // Navigate to seller profile or contact
            console.log(`View seller: ${seller.id}`);
          }}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
