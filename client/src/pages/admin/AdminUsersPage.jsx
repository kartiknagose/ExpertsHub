import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { UserX, UserCheck, Trash2, Search } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, Badge, Button, AsyncState, ConfirmDialog, PageHeader, RoleBadge } from '../../components/common';
import { getAdminUsers, updateUserStatus, deleteUser } from '../../api/admin';
import { getPageLayout } from '../../constants/layout';
import { queryKeys } from '../../utils/queryKeys';
import { useSocketEvent } from '../../hooks/useSocket';

const roleFilters = [
  { label: 'All', value: '' },
  { label: 'Customers', value: 'CUSTOMER' },
  { label: 'Workers', value: 'WORKER' },
  { label: 'Admins', value: 'ADMIN' },
];


export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, user: null });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateUserStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  });

  const handleStatusChange = (user) => {
    setConfirmDialog({ isOpen: true, type: 'status', user });
  };

  const handleDelete = (user) => {
    setConfirmDialog({ isOpen: true, type: 'delete', user });
  };

  const handleConfirm = () => {
    if (confirmDialog.type === 'status') {
      const targetState = confirmDialog.user.isActive === false;
      statusMutation.mutate({ id: confirmDialog.user.id, isActive: targetState });
    } else if (confirmDialog.type === 'delete') {
      deleteMutation.mutate(confirmDialog.user.id);
    }
    setConfirmDialog({ isOpen: false, type: null, user: null });
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.users(roleFilter),
    queryFn: () => getAdminUsers(roleFilter || undefined),
  });

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.usersPreview() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.workers() });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.workersPreview() });
  };

  useSocketEvent('admin:users_updated', refreshUsers);
  useSocketEvent('admin:workers_updated', refreshUsers);

  const users = data?.users || [];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm)
  );

  return (
    <MainLayout>
      <div className={getPageLayout('default')}>
        <PageHeader
          title="Users"
          subtitle="Manage platform users by role."
          badge={{ text: `${filteredUsers.length} users`, variant: 'info' }}
        />

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
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none transition-colors bg-white border-gray-200 text-gray-900 focus:border-brand-500 dark:bg-dark-900 dark:border-dark-700 dark:text-white"
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
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {user.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {user.email}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {user.mobile}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={user.role} />
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
                        onClick={() => handleDelete(user)}
                        disabled={deleteMutation.isPending}
                        title="Delete User"
                        aria-label="Delete user"
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

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmDialog({ isOpen: false, type: null, user: null })}
          title={confirmDialog.type === 'delete' ? 'Delete User' : confirmDialog.user?.isActive === false ? 'Activate User' : 'Suspend User'}
          message={
            confirmDialog.type === 'delete'
              ? `Are you sure you want to permanently delete ${confirmDialog.user?.name}? This action cannot be undone.`
              : confirmDialog.user?.isActive === false
                ? `Are you sure you want to activate ${confirmDialog.user?.name}? They will regain access to the platform.`
                : `Are you sure you want to suspend ${confirmDialog.user?.name}? They will lose access to the platform.`
          }
          confirmText={confirmDialog.type === 'delete' ? 'Delete' : confirmDialog.user?.isActive === false ? 'Activate' : 'Suspend'}
          variant={confirmDialog.type === 'delete' ? 'danger' : confirmDialog.user?.isActive === false ? 'success' : 'warning'}
          loading={statusMutation.isPending || deleteMutation.isPending}
        />
      </div>
    </MainLayout>
  );
}
