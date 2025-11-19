import { useRouter } from 'next/router';
import { ShoppingCart, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { Button } from './ui/button';

interface NotificationItemProps {
  notification: {
    _id: string;
    type: 'new_paid_order' | 'new_return_request' | 'low_stock_alert';
    title: string;
    message: string;
    clickAction: string;
    icon: 'shopping-cart' | 'rotate-ccw' | 'alert-triangle';
    color: 'blue' | 'orange' | 'yellow';
    isRead: boolean;
    createdAt: Date | string;
  };
  onClose: () => void;
  onRefresh: () => void;
}

export default function NotificationItem({
  notification,
  onClose,
  onRefresh,
}: NotificationItemProps) {
  const router = useRouter();

  // Mark as read mutation
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      onRefresh();
    },
  });

  // Delete mutation
  const deleteNotificationMutation = trpc.notifications.deleteNotification.useMutation({
    onSuccess: () => {
      onRefresh();
    },
  });

  // Get icon component
  const getIcon = () => {
    switch (notification.icon) {
      case 'shopping-cart':
        return <ShoppingCart className="h-5 w-5" />;
      case 'rotate-ccw':
        return <RotateCcw className="h-5 w-5" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Get color classes
  const getColorClasses = () => {
    if (notification.isRead) {
      return {
        bg: 'bg-gray-50',
        icon: 'bg-gray-100 text-gray-600',
        border: 'border-gray-200',
      };
    }

    switch (notification.color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          border: 'border-blue-200',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          icon: 'bg-orange-100 text-orange-600',
          border: 'border-orange-200',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          icon: 'bg-yellow-100 text-yellow-600',
          border: 'border-yellow-200',
        };
      default:
        return {
          bg: 'bg-gray-50',
          icon: 'bg-gray-100 text-gray-600',
          border: 'border-gray-200',
        };
    }
  };

  // Handle notification click
  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync({
        notificationId: notification._id,
      });
    }

    // Close dropdown
    onClose();

    // Navigate to click action
    router.push(notification.clickAction);
  };

  // Handle delete
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotificationMutation.mutateAsync({
      notificationId: notification._id,
    });
  };

  // Format timestamp
  const formatTimestamp = (date: Date | string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return notifDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const colorClasses = getColorClasses();

  return (
    <div
      onClick={handleClick}
      className={`relative px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.isRead ? colorClasses.bg : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses.icon}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {notification.title}
            </p>
            
            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteNotificationMutation.isPending}
              className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full shrink-0"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>

          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {formatTimestamp(notification.createdAt)}
          </p>
        </div>
      </div>

      {/* Unread indicator dot */}
      {!notification.isRead && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
      )}
    </div>
  );
}
