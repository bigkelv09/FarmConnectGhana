import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertMessageSchema, Product, User } from '@shared/schema';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  MapPin, 
  Star, 
  Heart, 
  Share2, 
  MessageCircle, 
  Phone, 
  User as UserIcon,
  Package,
  Shield,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { z } from 'zod';

const messageFormSchema = insertMessageSchema.pick({
  content: true,
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: productData, isLoading } = useQuery<Product & { seller: User }>({
    queryKey: ['/api/products', params?.id],
    enabled: !!params?.id,
  });

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      if (!productData?.seller.id) throw new Error('Seller not found');
      
      const response = await apiRequest('POST', '/api/messages', {
        receiverId: productData.seller.id,
        productId: productData.id,
        content: data.content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: productData?.name,
        text: productData?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link has been copied to your clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-green">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-light-green">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-dark-green mb-4" data-testid="product-not-found">
                Product not found
              </h2>
              <p className="text-gray-600 mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/marketplace">
                <Button className="bg-forest-green text-white hover:bg-forest-green/90" data-testid="back-to-marketplace">
                  Back to Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const categoryColors = {
    crops: 'bg-lime-green text-dark-green',
    tools: 'bg-harvest-orange text-white',
    medications: 'bg-forest-green text-white',
  };

  const categoryLabels = {
    crops: 'Fresh Produce',
    tools: 'Farm Equipment',
    medications: 'Agricultural Chemical',
  };

  return (
    <div className="min-h-screen bg-light-green">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6" data-testid="breadcrumb">
          <Link href="/marketplace" className="text-forest-green hover:underline flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Marketplace
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-700">{productData.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white border">
              {productData.imageUrl ? (
                <img
                  src={productData.imageUrl}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                  data-testid="product-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {/* Placeholder thumbnails */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gray-100 border flex items-center justify-center"
                  data-testid={`thumbnail-${i}`}
                >
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Badge className={categoryColors[productData.category]} data-testid="product-category-badge">
                    {categoryLabels[productData.category]}
                  </Badge>
                  <h1 className="text-3xl font-bold text-dark-green mt-2" data-testid="product-title">
                    {productData.name}
                  </h1>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" data-testid="favorite-button">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} data-testid="share-button">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1" data-testid="product-rating">4.8 (24 reviews)</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span data-testid="product-location">{productData.location}</span>
                </div>
              </div>

              <div className="text-4xl font-bold text-forest-green mb-4" data-testid="product-price">
                GHS {productData.price}
                <span className="text-lg text-gray-600 font-normal">/{productData.unit}</span>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed" data-testid="product-description">
                {productData.description}
              </p>
            </div>

            <Separator />

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-forest-green" />
                <div>
                  <p className="text-sm text-gray-600">Available Quantity</p>
                  <p className="font-semibold" data-testid="product-available-quantity">
                    {productData.quantity} {productData.unit}s
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-forest-green" />
                <div>
                  <p className="text-sm text-gray-600">Listed</p>
                  <p className="font-semibold" data-testid="product-listed-date">
                    {productData.createdAt ? new Date(productData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex-1 bg-harvest-orange text-white hover:bg-harvest-orange/90"
                      disabled={!user || user.id === productData.seller.id}
                      data-testid="contact-seller-button"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="contact-modal">
                    <DialogHeader>
                      <DialogTitle>Contact Seller</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4" data-testid="message-form">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Hi, I'm interested in your product..."
                                  rows={4}
                                  {...field}
                                  data-testid="message-content"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="submit" 
                            className="bg-forest-green text-white hover:bg-forest-green/90"
                            disabled={sendMessageMutation.isPending}
                            data-testid="send-message-button"
                          >
                            {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                {productData.seller.phone && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(`tel:${productData.seller.phone}`)}
                    data-testid="call-seller-button"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>
              
              {!user && (
                <p className="text-sm text-gray-600 text-center" data-testid="login-prompt">
                  Please log in to contact the seller
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seller Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center" data-testid="seller-info-title">
              <UserIcon className="w-5 h-5 mr-2" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-forest-green flex items-center justify-center text-white text-xl font-bold">
                {productData.seller.firstName[0]}{productData.seller.lastName[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark-green" data-testid="seller-name">
                  {productData.seller.firstName} {productData.seller.lastName}
                </h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1" data-testid="seller-rating">4.9 (45 reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 ml-1" data-testid="seller-verification">Verified Seller</span>
                  </div>
                </div>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span data-testid="seller-location">{productData.seller.location || 'Ghana'}</span>
                </div>
              </div>
              <div className="text-right">
                <Link href={`/marketplace?sellerId=${productData.seller.id}`}>
                  <Button variant="outline" data-testid="view-seller-products">
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Similar Products */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="similar-products-title">Similar Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8" data-testid="similar-products-placeholder">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Similar products will be shown here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
