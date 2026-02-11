import { useMemo, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Sparkles, Droplets, Zap, Paintbrush, Wind, Wrench, Briefcase, Star, ArrowRight } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Input, Button, Badge, Spinner, PageHeader, EmptyState, Skeleton } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAllServices } from '../../api/services';

// Fetch services with optional filters
const fetchServices = async (filters) => {
  const data = await getAllServices(filters);
  return data.services || data;
};

// Helper: Get icon based on category
const getCategoryIcon = (category) => {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('clean')) return Sparkles;
  if (normalized.includes('plumb') || normalized.includes('water')) return Droplets;
  if (normalized.includes('electric') || normalized.includes('wir')) return Zap;
  if (normalized.includes('paint')) return Paintbrush;
  if (normalized.includes('ac') || normalized.includes('cool')) return Wind;
  if (normalized.includes('repair') || normalized.includes('fix')) return Wrench;
  return Briefcase;
};

// Memoized Service Card Component (ISSUE-035)
const ServiceCard = memo(({ service, isDark }) => {
  const Icon = getCategoryIcon(service.category);

  // Simulated rating (normally from DB)
  const rating = (4.0 + (service.id % 10) / 10).toFixed(1);

  return (
    <Card hoverable className="h-full flex flex-col relative overflow-hidden group">
      {/* Decorative Background Icon */}
      <Icon
        className={`absolute -right-6 -bottom-6 opacity-5 transform rotate-12 transition-transform duration-500 group-hover:scale-110 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
        size={140}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-700 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          {rating}
        </div>
      </div>

      <div className="mb-4 flex-grow relative z-10">
        <div className="mb-2">
          {service.category && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-dark-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              {service.category}
            </span>
          )}
        </div>
        <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {service.name}
        </h3>
        <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {service.description || 'Professional service at your doorstep.'}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Starting from</span>
            <span className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              ₹{service.basePrice ? service.basePrice : 'On Request'}
            </span>
          </div>
        </div>

        <Link to={`/services/${service.id}`} className="block">
          <Button fullWidth variant="primary" className="group-hover:shadow-lg group-hover:shadow-brand-500/20 transition-all">
            View Details <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
});

export function ServicesPage() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: services = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['services', { search, category }],
    queryFn: () => fetchServices({ search, category }),
    staleTime: 5 * 60 * 1000,
  });

  // Derive categories from services list
  const categories = useMemo(() => {
    const set = new Set();
    services.forEach((service) => {
      if (service.category) set.add(service.category);
    });
    return Array.from(set);
  }, [services]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Services"
          subtitle="Browse professional services and find the right worker for your needs."
        />

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find a Service</CardTitle>
            <CardDescription>Search by name or filter by category</CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-4 p-6 pt-0">
            <Input
              label="Search"
              placeholder="e.g., Plumbing, Cleaning"
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div>
              <label className={isDark ? 'block text-sm font-medium text-gray-200 mb-1.5' : 'block text-sm font-medium text-gray-700 mb-1.5'}>
                Category
              </label>
              <div className={`relative ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${isDark
                    ? 'bg-dark-800 border-dark-600 focus:border-brand-500 focus:ring-brand-500/50'
                    : 'bg-white border-gray-300 focus:border-brand-600 focus:ring-brand-600/50'
                    }`}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={clearFilters} title="Clear Filters">
                <Filter size={18} />
              </Button>
              <Button onClick={() => refetch()}>
                Search
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading State (ISSUE-013) */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-80">
                <div className="flex justify-between mb-6">
                  <Skeleton variant="circular" className="w-12 h-12" />
                  <Skeleton className="w-12 h-6 rounded-full" />
                </div>
                <Skeleton className="w-20 h-4 mb-2" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-full h-16 mb-6" />
                <div className="mt-auto pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between mb-4">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-6" />
                  </div>
                  <Skeleton className="w-full h-10" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
            <p className="text-red-600 dark:text-red-400">{error?.message || 'Failed to load services'}</p>
          </Card>
        )}

        {!isLoading && !isError && services.length === 0 && (
          <EmptyState
            icon={Search}
            title="No services found"
            message="Try different search terms or clear your filters."
            action={
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            }
          />
        )}

        {!isLoading && !isError && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
