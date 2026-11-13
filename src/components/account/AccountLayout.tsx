'use client';

import React, { useState } from 'react';
import { SmartImage } from '../common/SmartImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../common/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { useSettings } from '../../context/SettingsContext';
import { 
  User, 
  LayoutDashboard,
  ShoppingBag, 
  Heart, 
  MapPin, 
  Bell, 
  Activity, 
  LogOut, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RotateCcw,
  Receipt,
  Sparkles,
  CreditCard,
  Truck,
  Star,
  MoreHorizontal,
  X
} from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children, activeTab }) => {
  const router = useRouter();
  const { customer, user, logout } = useAuth();
  const { settings } = useSettings();
  const siteName = settings?.general?.siteName || 'Store';
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const activeUser = customer || user;

  const menuItems = [
    { id: 'account', href: '/account', label: 'Dashboard', icon: LayoutDashboard, isPrimary: true },
    { id: 'profile', href: '/account/profile', label: 'My Profile', icon: User, isPrimary: true },
    { id: 'orders', href: '/account/orders', label: 'Order History', icon: ShoppingBag, isPrimary: false },
    { id: 'shipments', href: '/account/shipments', label: 'Shipments & Tracking', icon: Truck, isPrimary: false },
    { id: 'payments', href: '/account/payments', label: 'Payment History', icon: CreditCard, isPrimary: false },
    { id: 'returns', href: '/account/returns', label: 'Returns', icon: RotateCcw, isPrimary: false },
    { id: 'refunds', href: '/account/refunds', label: 'Refunds', icon: Receipt, isPrimary: false },
    { id: 'wishlist', href: '/account/wishlist', label: 'Wishlist', icon: Heart, isPrimary: false },
    { id: 'addresses', href: '/account/addresses', label: 'Addresses', icon: MapPin, isPrimary: false },
    { id: 'notifications', href: '/account/notifications', label: 'Notifications', icon: Bell, isPrimary: false },
  ];

  const primaryMobileTabs = [
    { id: 'account', href: '/account', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', href: '/account/orders', label: 'Orders', icon: ShoppingBag },
    { id: 'shipments', href: '/account/shipments', label: 'Shipments', icon: Truck },
    { id: 'wishlist', href: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', href: '/account/profile', label: 'Profile', icon: User },
  ];

  const isMoreActive = !primaryMobileTabs.some(t => t.id === activeTab);
  const activeMenuItem = menuItems.find(item => item.id === activeTab) || menuItems[0];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const displayName = activeUser?.fullName || 
    (activeUser?.firstName ? `${activeUser.firstName} ${activeUser.lastName || ''}`.trim() : 'Valued Customer');
  const avatarUrl = activeUser?.avatarUrl || activeUser?.avatar;

  // TanStack Query for authoritative customer unread notifications count
  const { data: customerDashboardData } = useQuery({
    queryKey: ['customer', 'dashboard'],
    queryFn: async () => {
      const res = await customerService.getDashboard();
      if (res.status === 'error' || !res.data) return null;
      return res.data;
    },
    enabled: Boolean(activeUser),
    staleTime: 60 * 1000,
  });

  const unreadNotificationsCount = customerDashboardData?.metrics?.unreadNotifications || 0;

  return (
    <ProtectedRoute>
      <div className="bg-bg min-h-screen pt-4 sm:pt-6 lg:pt-20 pb-12 sm:pb-16">
        <div className="container-vyzobd px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Customer Account Card */}
          <div className="lg:hidden mb-3 sm:mb-4">
            <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-champagne/50 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 relative">
                  {avatarUrl ? (
                    <SmartImage 
                      src={avatarUrl} 
                      alt={displayName} 
                      fill
                      fallbackType="avatar"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-ink truncate">{displayName}</div>
                  <div className="text-xs text-gray-500 truncate">{activeUser?.email || activeUser?.phone || 'Account Member'}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Horizontally Scrollable Sticky Navigation Bar */}
          <div className="lg:hidden sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-y border-champagne/50 py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {primaryMobileTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors shrink-0 ${
                      isActive
                        ? 'bg-ink text-white shadow-xs'
                        : 'bg-bg-alt text-ink/80 hover:bg-bg-alt/80 border border-champagne/40'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-taupe'} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}

              {/* More Navigation Button */}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                  isMoreActive
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-bg-alt text-ink/80 hover:bg-bg-alt/80 border border-champagne/40'
                }`}
                aria-label="More navigation items"
              >
                <MoreHorizontal size={16} />
                <span>More</span>
                {unreadNotificationsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Sheet for More Navigation Items */}
          {isMobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => setIsMobileNavOpen(false)}
              />
              
              {/* Bottom Sheet Panel */}
              <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-2xl border-t border-champagne/50 max-h-[85vh] overflow-y-auto z-10 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-champagne/40">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-gray-900 rounded-full" />
                    <h3 className="text-sm font-bold text-ink">Account Navigation</h3>
                  </div>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-700 rounded-lg flex items-center justify-center cursor-pointer"
                    title="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const showBadge = item.id === 'notifications' && unreadNotificationsCount > 0;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`min-h-[44px] flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-ink text-white shadow-xs'
                            : 'bg-gray-50 text-ink hover:bg-gray-100 border border-champagne/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {showBadge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white shrink-0">
                            {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-champagne/40">
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      handleLogout();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="bg-white rounded-xl shadow-xs border border-champagne/50 overflow-hidden sticky top-28">
                
                {/* User Identity Header */}
                <div className="p-6 bg-ink text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative overflow-hidden flex-shrink-0">
                        {avatarUrl ? (
                          <SmartImage 
                            src={avatarUrl} 
                            alt={displayName} 
                            fill
                            fallbackType="avatar"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-white truncate">{displayName}</h3>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          <ShieldCheck size={14} className="text-primary" />
                          <span className="text-[11px] font-medium text-gray-300">
                            {activeUser?.phoneVerified || activeUser?.emailVerified ? 'Verified Account' : 'Customer Account'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 font-medium truncate">{activeUser?.email || activeUser?.phone || 'customer@example.com'}</div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-3">
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const showBadge = item.id === 'notifications' && unreadNotificationsCount > 0;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`
                            w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors group
                            ${isActive 
                              ? 'bg-sage/30 text-primary' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-ink'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={17} className={isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'} />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {showBadge && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-primary text-white">
                                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                              </span>
                            )}
                            <ChevronRight 
                              size={14} 
                              className={`transition-transform duration-200 ${
                                isActive 
                                  ? 'text-primary translate-x-0.5' 
                                  : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'
                              }`} 
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-champagne/40">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-gray-600 hover:text-primary hover:bg-sage/30 rounded-lg transition-colors font-semibold text-xs cursor-pointer"
                    >
                      <LogOut size={17} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </nav>

                <div className="px-5 py-3 bg-gray-50 border-t border-champagne/40 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-[11px] text-gray-600">{siteName} Customer Portal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-9 min-w-0">
              {children}
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
