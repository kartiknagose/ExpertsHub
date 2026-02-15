import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { UserX, UserCheck, Trash2, Search } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, Badge, Button, AsyncState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { getAdminUsers, updateUserStatus, deleteUser } from '../../api/admin';

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
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const handleStatusChange = (user) => {
    // Determine target state: if undefined/true -> false, if false -> true
    const targetState = user.isActive === false; // activate if suspended
    const action = targetState ? 'activate' : 'suspend';

    if (confirm(`Are you sure you want to ${action} this user?`)) {
      statusMutation.mutate({ id: user.id, isActive: targetState });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => getAdminUsers(roleFilter || undefined),
  });

  const users = data?.users || [];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm)
  );

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
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

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none transition-colors ${isDark
                  ? 'bg-dark-900 border-dark-700 text-white focus:border-brand-500'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-brand-500'
                }`}
            />
          </div>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
          isEmpty={!isLoading && !isError && filteredUsers.length === 0}
          emptyTitle={searchTerm ? "No users match search" : "No users found"}
          emptyMessage={searchTerm ? "Try different keywords." : "Try adjusting filters or check back later."}
          errorFallback={
            <Card className="p-6">
              <p className="text-error-500 mb-3">
                {error?.response?.data?.error || error?.message || 'Failed to load users.'}
              </p>
              <button type="button" className="text-sm text-brand-500" onClick={() => refetch()}>
                Retry
              </button>
            </Card>
          }
        >
          <div className="space-y-4">
            {filteredUsers.map((user) => (
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
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                      <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      {user.isActive === false && (
                        <Badge variant="error" className="bg-error-100 text-error-700 border-error-200">
                          Suspended
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={user.isActive !== false ? 'outline' : 'default'} // Default (primary) for activate, outline for suspend
                        onClick={() => handleStatusChange(user)}
                        disabled={statusMutation.isPending}
                        className={user.isActive !== false ? 'text-warning-600 border-warning-200 hover:bg-warning-50' : 'bg-success-600 hover:bg-success-700 text-white'}
                      >
                        {user.isActive !== false ? (
                          <><UserX size={14} className="mr-1" /> Suspend</>
                        ) : (
                          <><UserCheck size={14} className="mr-1" /> Activate</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteMutation.isPending}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </AsyncState>
      </div>
    </MainLayout>
  );
}
