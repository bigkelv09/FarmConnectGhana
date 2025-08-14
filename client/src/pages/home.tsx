import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { SellerCard } from "@/components/seller-card";
import { WeatherWidget } from "@/components/weather-widget";
import { AgroConnectLogo } from "@/components/agroconnect-logo";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/lib/auth";
import {
  Users,
  Package,
  Handshake,
  MapPin,
  Star,
  Clock,
  TrendingUp,
  Leaf,
  Shield,
  Truck,
  LogIn,
  UserPlus
} from "lucide-react";

interface StatsData {
  users: number;
  products: number;
  transactions: number;
  regions: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  category: string;
  location: string;
  imageUrl: string;
  sellerId: string;
  featured?: boolean;
  active: boolean;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: string;
  location: string;
  phone: string;
  verified: boolean;
  createdAt: string;
}

export default function Home() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Fetch platform stats
  const { data: stats } = useQuery<StatsData>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Fetch featured products
  const { data: featuredProducts = [], isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await fetch('/api/products/featured');
      if (!response.ok) throw new Error('Failed to fetch featured products');
      return response.json();
    },
  });

  // Fetch latest products
  const { data: latestProducts = [], isLoading: latestLoading } = useQuery<Product[]>({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const response = await fetch('/api/products/latest?limit=6');
      if (!response.ok) throw new Error('Failed to fetch latest products');
      return response.json();
    },
  });

  // Fetch trusted sellers (oldest users)
  const { data: trustedSellers = [], isLoading: sellersLoading } = useQuery<User[]>({
    queryKey: ['trusted-sellers'],
    queryFn: async () => {
      const response = await fetch('/api/users/trusted-sellers?limit=6');
      if (!response.ok) throw new Error('Failed to fetch trusted sellers');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          {/* Logo and Login/Register buttons */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <AgroConnectLogo className="w-16 h-16" />
              <h1 className="text-2xl font-bold text-white">FarmConnect Ghana</h1>
            </div>

            {!user && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-green-700"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-green-700"
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </Button>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Connect Ghana's Farmers
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Bridging the gap between farmers and buyers with fresh produce, tools, and expertise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" variant="secondary" className="text-green-700">
                Browse Products
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-700">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats?.users || 0}</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats?.products || 0}</h3>
              <p className="text-gray-600">Products Listed</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats?.transactions || 0}</h3>
              <p className="text-gray-600">Successful Deals</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats?.regions || 0}</h3>
              <p className="text-gray-600">Regions Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Widget Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <WeatherWidget />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Premium products from verified sellers</p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="relative">
                  <Badge className="absolute top-4 left-4 z-10 bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No featured products yet</h3>
              <p className="text-gray-500">Check back soon for featured products from our sellers</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Products</h2>
              <p className="text-gray-600">Fresh listings from the marketplace</p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Explore Marketplace
              </Button>
            </Link>
          </div>

          {latestLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded mb-4" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProducts.map((product) => (
                <div key={product.id} className="relative">
                  <Badge className="absolute top-4 left-4 z-10 bg-green-500 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products available</h3>
              <p className="text-gray-500">Be the first to list a product on our marketplace!</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Preview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Can Find</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From fresh produce to farming equipment, discover everything you need for a successful farming operation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Crops Category */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="h-48 bg-cover bg-center relative"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&w=800&h=400&fit=crop")'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute bottom-4 left-4 text-white">
                  <Leaf className="w-8 h-8 mb-2" />
                  <h3 className="text-xl font-bold">Fresh Crops</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Fresh vegetables, grains, fruits, and cash crops from local farmers across Ghana.
                </p>
                <Link href="/marketplace?category=crops">
                  <Button className="w-full">
                    Browse Crops
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tools Category */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="h-48 bg-cover bg-center relative"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&w=800&h=400&fit=crop")'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute bottom-4 left-4 text-white">
                  <Truck className="w-8 h-8 mb-2" />
                  <h3 className="text-xl font-bold">Farm Tools</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Tractors, plows, harvesters, and other essential farming equipment for modern agriculture.
                </p>
                <Link href="/marketplace?category=tools">
                  <Button className="w-full">
                    Browse Tools
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Medications Category */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="h-48 bg-cover bg-center relative"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&w=800&h=400&fit=crop")'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <div className="absolute bottom-4 left-4 text-white">
                  <Shield className="w-8 h-8 mb-2" />
                  <h3 className="text-xl font-bold">Crop Protection</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Fertilizers, pesticides, and agricultural chemicals to protect and nourish your crops.
                </p>
                <Link href="/marketplace?category=medications">
                  <Button className="w-full">
                    Browse Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted Sellers Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Sellers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet our most established farmers and sellers who have been serving the community with quality products
            </p>
          </div>

          {sellersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : trustedSellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trustedSellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No trusted sellers yet</h3>
              <p className="text-gray-500">Our seller community is growing. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers and buyers connecting across Ghana
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-green-700">
                Start Selling Today
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-700"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
