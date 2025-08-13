import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@shared/schema';
import { Search, Filter } from 'lucide-react';

export default function Marketplace() {
  const [location, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    search: '',
    category: '',
    sortBy: 'newest',
    minPrice: '',
    maxPrice: '',
  });

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSearchParams({
      search: urlParams.get('search') || '',
      category: urlParams.get('category') || '',
      sortBy: urlParams.get('sortBy') || 'newest',
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || '',
    });
  }, [location]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchParams.search) params.set('search', searchParams.search);
    if (searchParams.category) params.set('category', searchParams.category);
    return params.toString();
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', buildQueryParams()],
    queryFn: async () => {
      const response = await fetch(`/api/products?${buildQueryParams()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const handleSearchChange = (field: string, value: string) => {
    const newParams = { ...searchParams, [field]: value };
    setSearchParams(newParams);
    
    // Update URL
    const urlParams = new URLSearchParams();
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) urlParams.set(key, val);
    });
    
    const newUrl = `/marketplace${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    setLocation(newUrl);
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesPrice = (!searchParams.minPrice || parseFloat(product.price) >= parseFloat(searchParams.minPrice)) &&
                          (!searchParams.maxPrice || parseFloat(product.price) <= parseFloat(searchParams.maxPrice));
      return matchesPrice;
    })
    .sort((a, b) => {
      switch (searchParams.sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-light-green">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24" data-testid="filters-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={searchParams.category} onValueChange={(value) => handleSearchChange('category', value)}>
                    <SelectTrigger data-testid="category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="crops">Crops</SelectItem>
                      <SelectItem value="tools">Farm Tools</SelectItem>
                      <SelectItem value="medications">Medications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Price Range (GHS)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={searchParams.minPrice}
                      onChange={(e) => handleSearchChange('minPrice', e.target.value)}
                      data-testid="min-price-filter"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={searchParams.maxPrice}
                      onChange={(e) => handleSearchChange('maxPrice', e.target.value)}
                      data-testid="max-price-filter"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select value={searchParams.sortBy} onValueChange={(value) => handleSearchChange('sortBy', value)}>
                    <SelectTrigger data-testid="sort-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchParams({
                      search: '',
                      category: '',
                      sortBy: 'newest',
                      minPrice: '',
                      maxPrice: '',
                    });
                    setLocation('/marketplace');
                  }}
                  className="w-full"
                  data-testid="clear-filters"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-dark-green" data-testid="marketplace-title">
                  Agricultural Marketplace
                </h1>
                <p className="text-gray-600 mt-2" data-testid="results-count">
                  {isLoading ? 'Loading...' : `${filteredAndSortedProducts.length} products found`}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse" data-testid={`skeleton-${i}`}>
                    <div className="h-48 bg-gray-200" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="no-products-title">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4" data-testid="no-products-description">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchParams({
                        search: '',
                        category: '',
                        sortBy: 'newest',
                        minPrice: '',
                        maxPrice: '',
                      });
                      setLocation('/marketplace');
                    }}
                    data-testid="clear-search"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
