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
import { Search, Filter, Loader2 } from 'lucide-react';

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

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', buildQueryParams()],
    queryFn: async () => {
      try {
        console.log('Attempting to fetch:', `/api/products?${buildQueryParams()}`);

        const response = await fetch(`/api/products?${buildQueryParams()}`);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Products loaded successfully:', data);
        return data;
      } catch (error) {
        console.error('Fetch error details:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
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
      return (!searchParams.minPrice || parseFloat(product.price) >= parseFloat(searchParams.minPrice)) &&
             (!searchParams.maxPrice || parseFloat(product.price) <= parseFloat(searchParams.maxPrice));
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
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      }
    });

  console.log('Marketplace rendering:', { products, isLoading, error }); // Debug log

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Marketplace</h1>

        {/* Debug info */}
        <div className="mb-4 p-4 bg-blue-100 rounded">
          <p>Debug: Products count: {products.length}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Error: {error ? String(error) : 'None'}</p>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/products');
                console.log('Manual test - Status:', response.status);
                const data = await response.json();
                console.log('Manual test - Data:', data);
                alert(`API test: ${response.status} - ${data.length || 0} products`);
              } catch (error) {
                console.log('Manual test - Error:', error);
                alert(`API test failed: ${error}`);
              }
            }}
            className="ml-4 px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Test API
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search">Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search products..."
                      value={searchParams.search}
                      onChange={(e) => handleSearchChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Label>Category</Label>
                  <Select value={searchParams.category} onValueChange={(value) => handleSearchChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="crops">Crops</SelectItem>
                      <SelectItem value="tools">Tools & Equipment</SelectItem>
                      <SelectItem value="medications">Medications</SelectItem>
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
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredAndSortedProducts.length} product(s) found
              </p>

              <Select value={searchParams.sortBy} onValueChange={(value) => handleSearchChange('sortBy', value)}>
                <SelectTrigger className="w-[180px]">
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

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">Error: {String(error)}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && (
              <>
                {filteredAndSortedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {products.length === 0 ? 'No products available' : 'Try adjusting your search criteria or filters'}
                    </p>
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
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
