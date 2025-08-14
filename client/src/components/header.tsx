import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { AuthModal } from './auth-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Leaf, Phone, CloudSun, Menu, Search, User, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AgroConnectLogo } from './agroconnect-logo';

interface WeatherData {
  temperature: number;
  description: string;
}

export function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ['/api/weather'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      params.set('search', searchTerm);
      if (searchCategory !== 'all') {
        params.set('category', searchCategory);
      }
      window.location.href = `/marketplace?${params.toString()}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center py-2 text-sm border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-dark-green" data-testid="welcome-message">
                Welcome to Ghana's Premier Agricultural Marketplace
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {weather && (
                <div className="flex items-center space-x-2" data-testid="weather-info">
                  <CloudSun className="text-forest-green w-4 h-4" />
                  <span className="text-dark-green">{weather.temperature}°C</span>
                  <span className="text-gray-500">{weather.description}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Phone className="text-forest-green w-4 h-4" />
                <span className="text-dark-green">+233 24 123 4567</span>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
                <AgroConnectLogo className="w-10 h-10" />
                <h1 className="text-2xl font-bold text-forest-green">FarmConnect Ghana</h1>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className={`text-dark-green hover:text-forest-green font-medium transition-colors ${location === '/' ? 'text-forest-green' : ''}`}
                  data-testid="nav-home"
                >
                  Home
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-dark-green hover:text-forest-green font-medium transition-colors flex items-center" data-testid="nav-categories">
                    Categories
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link href="/marketplace?category=crops">Crops</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/marketplace?category=tools">Farm Tools</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/marketplace?category=medications">Medications</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link 
                  href="/marketplace" 
                  className={`text-dark-green hover:text-forest-green font-medium transition-colors ${location === '/marketplace' ? 'text-forest-green' : ''}`}
                  data-testid="nav-marketplace"
                >
                  Marketplace
                </Link>
                {user && (
                  <Link 
                    href="/dashboard" 
                    className={`text-dark-green hover:text-forest-green font-medium transition-colors ${location === '/dashboard' ? 'text-forest-green' : ''}`}
                    data-testid="nav-dashboard"
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-dark-green" data-testid="user-greeting">
                    Hello, {user.firstName}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="user-menu">
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Link href="/dashboard" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} data-testid="logout-button">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button 
                  className="bg-forest-green text-white hover:bg-forest-green/90"
                  onClick={() => setShowAuthModal(true)}
                  data-testid="login-button"
                >
                  Login / Register
                </Button>
              )}
              
              {user?.accountType === 'farmer' && (
                <Link href="/dashboard">
                  <Button className="bg-harvest-orange text-white hover:bg-harvest-orange/90" data-testid="sell-products-button">
                    Sell Products
                  </Button>
                </Link>
              )}
              
              <Button
                variant="ghost"
                className="md:hidden text-forest-green"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-button"
              >
                <Menu />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-4">
            <div className="flex items-center bg-gray-50 rounded-lg p-3">
              <Search className="text-gray-400 mr-3" />
              <Input
                type="text"
                placeholder="Search for crops, tools, medications..."
                className="flex-1 bg-transparent border-none outline-none text-dark-green"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                data-testid="search-input"
              />
              <div className="flex items-center space-x-2 ml-4">
                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger className="w-40 bg-transparent border-none" data-testid="search-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="crops">Crops</SelectItem>
                    <SelectItem value="tools">Farm Tools</SelectItem>
                    <SelectItem value="medications">Medications</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="bg-forest-green text-white hover:bg-forest-green/90"
                  onClick={handleSearch}
                  data-testid="search-button"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4" data-testid="mobile-menu">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-dark-green hover:text-forest-green font-medium">Home</Link>
                <Link href="/marketplace" className="text-dark-green hover:text-forest-green font-medium">Marketplace</Link>
                {user && (
                  <Link href="/dashboard" className="text-dark-green hover:text-forest-green font-medium">Dashboard</Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
