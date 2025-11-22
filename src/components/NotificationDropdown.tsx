import { useEffect, useRef } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from './ui/button';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshBadge: () => void;
  isUserMode?: boolean; // NEW: true = user notifications, false/undefined = admin notifications
}

interface NotificationData {
  _id: unknown;
  type: string;
  title: string;
  message: string;
  clickAction: string;
  icon: string;
  color: string;
  isRead: boolean;
  createdAt: string | Date;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  onRefreshBadge,
  isUserMode = false, // Default to admin mode
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications - switch between user and admin queries
  const { data: adminData, isLoading: adminLoading, refetch: adminRefetch } = trpc.notifications.getAdminNotifications.useQuery(
    {
      limit: 20,
      offset: 0,
      showRead: false, // ⭐ Fixed: Only show unread by default
    },
    {
      enabled: isOpen && !isUserMode, // Only enabled for admin mode
    }
  );

  const { data: userData, isLoading: userLoading, refetch: userRefetch } = trpc.notifications.getUserNotifications.useQuery(
    {
      limit: 20,
      offset: 0,
      showRead: false, // ⭐ Fixed: Only show unread by default
    },
    {
      enabled: isOpen && isUserMode, // Only enabled for user mode
    }
  );

  // Select the appropriate data based on mode
  const data = isUserMode ? userData : adminData;
  const isLoading = isUserMode ? userLoading : adminLoading;
  const refetch = isUserMode ? userRefetch : adminRefetch;

  // Mark all as read mutation
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      onRefreshBadge();
    },
  });

  const notifications = (data?.notifications || []) as unknown as NotificationData[];
  const hasNotifications = notifications.length > 0;

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Refresh notifications when opened
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-[380px] bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all duration-200 ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
        {hasNotifications && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="text-xs text-primary hover:text-primary/80"
          >
            {markAllAsReadMutation.isPending ? 'Memproses...' : 'Tandai semua dibaca'}
          </Button>
        )}
      </div>

      {/* Notifications List - Max height for ~5 items (85px each = ~425px) */}
      <div className="max-h-[425px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-primary"></div>
          </div>
        ) : !hasNotifications ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-900 font-medium mb-1">Belum ada notifikasi</p>
            <p className="text-xs text-gray-500 text-center">
              Notifikasi baru akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={String(notification._id)}
                notification={{
                  _id: String(notification._id),
                  type: notification.type as 'new_paid_order' | 'new_return_request' | 'low_stock_alert',
                  title: notification.title,
                  message: notification.message,
                  clickAction: notification.clickAction,
                  icon: notification.icon as 'shopping-cart' | 'rotate-ccw' | 'alert-triangle',
                  color: notification.color as 'blue' | 'orange' | 'yellow',
                  isRead: notification.isRead,
                  createdAt: notification.createdAt,
                }}
                onClose={onClose}
                onRefresh={() => {
                  refetch();
                  onRefreshBadge();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
