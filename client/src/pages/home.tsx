import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { SellerCard } from '@/components/seller-card';
import { WeatherWidget } from '@/components/weather-widget';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product, User } from '@shared/schema';
import { Users, Package, Handshake, MapPin, Leaf, Wrench, PillBottle } from 'lucide-react';

interface StatsData {
  users: number;
  products: number;
  transactions: number;
  regions: number;
}

export default function Home() {
  const { data: featuredProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });

  const { data: stats } = useQuery<StatsData>({
    queryKey: ['/api/stats'],
  });

  // Mock trusted sellers data
  const trustedSellers = [
    {
      id: 'farmer1',
      firstName: 'Kwame',
      lastName: 'Asante',
      email: 'kwame@example.com',
      accountType: 'farmer' as const,
      location: 'Kumasi, Ashanti Region',
      phone: '+233 24 123 4567',
      verified: true,
      password: '',
      createdAt: new Date(),
    },
    {
      id: 'farmer2',
      firstName: 'Akosua',
      lastName: 'Mensah',
      email: 'akosua@example.com',
      accountType: 'farmer' as const,
      location: 'Accra, Greater Accra',
      phone: '+233 24 234 5678',
      verified: true,
      password: '',
      createdAt: new Date(),
    },
    {
      id: 'farmer3',
      firstName: 'Kofi',
      lastName: 'Appiah',
      email: 'kofi@example.com',
      accountType: 'farmer' as const,
      location: 'Sunyani, Brong-Ahafo',
      phone: '+233 24 345 6789',
      verified: true,
      password: '',
      createdAt: new Date(),
    },
  ];

  return (
    <div className="min-h-screen bg-light-green">
      <Header />
      
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="relative h-96 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(46, 125, 50, 0.7), rgba(46, 125, 50, 0.7)), url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&w=1200&h=400&fit=crop')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h2 className="text-5xl font-bold mb-6" data-testid="hero-title">
                Ghana's Premier Agricultural Marketplace
              </h2>
              <p className="text-xl mb-8 opacity-90" data-testid="hero-description">
                Connect with farmers, suppliers, and buyers across Ghana. Trade crops, farm tools, and agricultural medications with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace">
                  <Button 
                    className="bg-harvest-orange text-white hover:bg-harvest-orange/90 px-8 py-4 text-lg font-semibold"
                    data-testid="start-buying-button"
                  >
                    Start Buying
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-forest-green px-8 py-4 text-lg font-semibold"
                    data-testid="start-selling-button"
                  >
                    Start Selling
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow-lg">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div data-testid="stat-users">
                <Users className="text-forest-green text-3xl mb-2 mx-auto" />
                <h3 className="text-2xl font-bold text-dark-green">
                  {stats ? `${stats.users.toLocaleString()}+` : '2,500+'}
                </h3>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div data-testid="stat-products">
                <Package className="text-forest-green text-3xl mb-2 mx-auto" />
                <h3 className="text-2xl font-bold text-dark-green">
                  {stats ? `${stats.products.toLocaleString()}+` : '15,000+'}
                </h3>
                <p className="text-gray-600">Products Listed</p>
              </div>
              <div data-testid="stat-transactions">
                <Handshake className="text-forest-green text-3xl mb-2 mx-auto" />
                <h3 className="text-2xl font-bold text-dark-green">
                  {stats ? `${stats.transactions.toLocaleString()}+` : '8,750+'}
                </h3>
                <p className="text-gray-600">Successful Deals</p>
              </div>
              <div data-testid="stat-regions">
                <MapPin className="text-forest-green text-3xl mb-2 mx-auto" />
                <h3 className="text-2xl font-bold text-dark-green">
                  {stats ? stats.regions : '16'}
                </h3>
                <p className="text-gray-600">Regions Covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-dark-green mb-4" data-testid="categories-title">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg" data-testid="categories-description">
              Find everything you need for your agricultural business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Crops Category */}
            <Link href="/marketplace?category=crops">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" data-testid="category-crops">
                <div 
                  className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&w=800&h=400&fit=crop")'
                  }}
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-dark-green">Crops & Produce</h3>
                    <Leaf className="text-forest-green text-2xl" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Fresh vegetables, grains, fruits, and cash crops from local farmers across Ghana.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-forest-green font-semibold">3,245 Products</span>
                    <Button className="bg-forest-green text-white hover:bg-forest-green/90">
                      Browse
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Tools Category */}
            <Link href="/marketplace?category=tools">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" data-testid="category-tools">
                <div 
                  className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&w=800&h=400&fit=crop")'
                  }}
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-dark-green">Farm Tools</h3>
                    <Wrench className="text-forest-green text-2xl" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Quality farming equipment, machinery, and tools to boost your agricultural productivity.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-forest-green font-semibold">1,876 Products</span>
                    <Button className="bg-forest-green text-white hover:bg-forest-green/90">
                      Browse
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Medications Category */}
            <Link href="/marketplace?category=medications">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" data-testid="category-medications">
                <div 
                  className="h-48 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&w=800&h=400&fit=crop")'
                  }}
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-dark-green">Medications</h3>
                    <PillBottle className="text-forest-green text-2xl" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Fertilizers, pesticides, and agricultural chemicals to protect and nourish your crops.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-forest-green font-semibold">987 Products</span>
                    <Button className="bg-forest-green text-white hover:bg-forest-green/90">
                      Browse
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-dark-green mb-4" data-testid="featured-title">
                Featured Products
              </h2>
              <p className="text-gray-600 text-lg">Hand-picked quality products from trusted sellers</p>
            </div>
            <Link href="/marketplace">
              <Button 
                className="bg-forest-green text-white hover:bg-forest-green/90"
                data-testid="view-all-products"
              >
                View All Products
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Sellers */}
      <section className="py-16 bg-light-green">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-dark-green mb-4" data-testid="sellers-title">
              Trusted Sellers
            </h2>
            <p className="text-gray-600 text-lg">Meet our verified farmers and suppliers across Ghana</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustedSellers.map((seller, index) => (
              <SellerCard 
                key={seller.id} 
                seller={seller}
                productCount={[127, 89, 156][index]}
                rating={[5.0, 4.8, 4.9][index]}
                reviewCount={[45, 32, 67][index]}
                yearsExperience={[8, 12, 15][index]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Footer */}
      <footer className="bg-dark-green text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Leaf className="text-lime-green text-3xl" />
                <h3 className="text-2xl font-bold">AgroConnect</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Ghana's premier agricultural marketplace connecting farmers, suppliers, and buyers nationwide.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-300 hover:text-lime-green transition-colors">Home</Link></li>
                <li><Link href="/marketplace" className="text-gray-300 hover:text-lime-green transition-colors">Marketplace</Link></li>
                <li><Link href="/dashboard" className="text-gray-300 hover:text-lime-green transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Categories</h4>
              <ul className="space-y-3">
                <li><Link href="/marketplace?category=crops" className="text-gray-300 hover:text-lime-green transition-colors">Fresh Produce</Link></li>
                <li><Link href="/marketplace?category=tools" className="text-gray-300 hover:text-lime-green transition-colors">Farm Equipment</Link></li>
                <li><Link href="/marketplace?category=medications" className="text-gray-300 hover:text-lime-green transition-colors">Agricultural Chemicals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-300">+233 24 123 4567</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-300">info@agroconnect.gh</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-300">Accra, Ghana</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300">&copy; 2024 AgroConnect Ghana. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
