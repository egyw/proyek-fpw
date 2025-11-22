import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Get unread count with auto-refresh for real-time notifications
  const { data: unreadData, refetch } = trpc.notifications.getUnreadCount.useQuery(
    undefined,
    {
      refetchInterval: 5000, // ⭐ Auto-refresh every 5 seconds for real-time notifications
    }
  );

  const unreadCount = unreadData?.count || 0;

  // Toggle dropdown visibility
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Handle dropdown animation
  useEffect(() => {
    if (isOpen) {
      setDropdownVisible(true);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setDropdownVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-bell-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="notification-bell-container relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {dropdownVisible && (
        <NotificationDropdown
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onRefreshBadge={refetch}
        />
      )}
    </div>
  );
}
