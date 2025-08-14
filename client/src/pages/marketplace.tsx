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
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        console.log('Data length:', data?.length);
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

  // Simple test version to check if component renders at all
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-red-600 mb-4">MARKETPLACE TEST</h1>
      <p className="text-xl">If you can see this, the component is rendering!</p>

      <div className="mt-8 p-4 bg-blue-100 border border-blue-300 rounded">
        <h2 className="text-lg font-bold">Component Status:</h2>
        <p>✅ Component loaded successfully</p>
        <p>✅ Basic HTML rendering works</p>
        <p>✅ CSS classes applied</p>
      </div>

      <button
        onClick={() => {
          fetch('/api/products')
            .then(res => res.json())
            .then(data => alert(`API Response: ${JSON.stringify(data, null, 2)}`))
            .catch(err => alert(`API Error: ${err.message}`));
        }}
        className="mt-4 px-6 py-3 bg-green-600 text-white rounded text-lg font-bold hover:bg-green-700"
      >
        🧪 TEST API CALL
      </button>
    </div>
  );
}
