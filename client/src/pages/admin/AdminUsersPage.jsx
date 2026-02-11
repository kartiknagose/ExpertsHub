import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common';
import { Badge, Button, Spinner } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAdminUsers } from '../../api/admin';

const roleFilters = [
  { label: 'All', value: '' },
  { label: 'Customers', value: 'CUSTOMER' },
  { label: 'Workers', value: 'WORKER' },
  { label: 'Admins', value: 'ADMIN' },
];

const roleVariant = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'info';
    case 'WORKER':
      return 'warning';
    default:
      return 'default';
  }
};

export function AdminUsersPage() {
  const { isDark } = useTheme();
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => getAdminUsers(roleFilter || undefined),
  });

  const users = data?.users || [];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Users
          </h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>
            Manage platform users by role.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {roleFilters.map((filter) => (
            <Button
              key={filter.label}
              size="sm"
              variant={roleFilter === filter.value ? 'primary' : 'outline'}
              onClick={() => setRoleFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <Card className="p-6">
            <p className="text-error-500 mb-3">
              {error?.response?.data?.error || error?.message || 'Failed to load users.'}
            </p>
            <button type="button" className="text-sm text-brand-500" onClick={() => refetch()}>
              Retry
            </button>
          </Card>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {users.length === 0 && (
              <Card className="p-6">
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  No users found.
                </p>
              </Card>
            )}
            {users.map((user) => (
              <Card key={user.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className={isDark ? 'text-gray-100 font-semibold' : 'text-gray-900 font-semibold'}>
                      {user.name}
                    </p>
                    <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                      {user.email}
                    </p>
                    <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                      {user.mobile}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                    <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
