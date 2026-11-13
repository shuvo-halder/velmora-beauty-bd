'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SmartImage } from '../common/SmartImage';
import { useStorefront } from '../../context/StorefrontContext';
import { AccountLayout } from './AccountLayout';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/formatters';
import { customerService } from '../../services/customerService';
import { CustomerOrderListItem } from '../../types/customer';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import { getOrderStatusMeta } from '../../utils/trackingStatus';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Clock, 
  RefreshCw, 
  ShoppingBag, 
  Search,
  ChevronLeft,
  AlertCircle,
  CreditCard,
  Filter,
  Check
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
] as const;

export const OrdersPage: React.FC = () => {
  const { navigateTo, publicSettings } = useStorefront();
  const { settings } = useSettings();
  const siteName = settings?.general?.siteName || publicSettings?.general?.siteName || 'Store';
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [selectedTrackingOrderNumber, setSelectedTrackingOrderNumber] = useState<string | null>(null);

  // Filter & Pagination States
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Currency resolution
  let currencyCode = 'BDT';
  let currencySymbol = '৳';
  try {
    const { settings } = useSettings();
    currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
    currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');
  } catch {
    // Ignore
  }

  // TanStack Query for GET /customer/orders
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customer', 'orders', { page, limit, status: selectedStatus, search: debouncedSearch }],
    queryFn: async () => {
      const res = await customerService.getOrders({
        page,
        limit,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: debouncedSearch.trim() || undefined,
      });
      if (res.status === 'error' && !res.data) {
        throw new Error(res.message || 'Failed to fetch customer orders.');
      }
      return res;
    },
    staleTime: 30 * 1000,
  });

  // Query for Quick Tracking Modal
  const {
    data: trackingResponse,
    isLoading: isTrackingLoading,
    isFetching: isTrackingFetching,
    error: trackingError,
    refetch: refetchTracking,
  } = useQuery({
    queryKey: ['customer', 'order-tracking', selectedTrackingOrderId],
    queryFn: async () => {
      if (!selectedTrackingOrderId) return null;
      const res = await customerService.getOrderTracking(selectedTrackingOrderId);
      if (res.status === 'error' && !res.data) {
        throw new Error(res.message || 'Failed to fetch tracking details.');
      }
      return res.data;
    },
    enabled: Boolean(selectedTrackingOrderId),
    staleTime: 15 * 1000,
  });

  const orders: CustomerOrderListItem[] = response?.data?.orders || [];
  const pagination = response?.data?.pagination || {
    page: 1,
    limit: 10,
    total: orders.length,
    totalPages: Math.max(1, Math.ceil(orders.length / limit)),
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedStatus('ALL');
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
  };

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <span>My Orders</span>
              {!isLoading && (
                <span className="text-xs font-bold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                  {pagination.total}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Track shipments, review past receipts, and view detailed financial breakdowns.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-3.5 py-2 bg-white text-gray-700 font-semibold text-xs rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin text-primary' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by order number (e.g. ORD-2026...)"
                className="w-full pl-9.5 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Tabs on Desktop / Mobile Scroll with Edge Fade */}
            <div className="relative min-w-0 flex-1">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none pr-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1 shrink-0">
                  <Filter size={13} />
                  <span className="hidden sm:inline">Status:</span>
                </span>
                {STATUS_FILTERS.map((tab) => {
                  const isActive = selectedStatus === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => handleStatusChange(tab.value)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden" />
            </div>
          </div>

          {/* Active filter summary tag if applied */}
          {(selectedStatus !== 'ALL' || debouncedSearch) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold text-gray-700">Filters active:</span>
                {selectedStatus !== 'ALL' && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                    Status: {selectedStatus}
                  </span>
                )}
                {debouncedSearch && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                    Search: &ldquo;{debouncedSearch}&rdquo;
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State matching real card layout */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4 animate-pulse">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="space-y-2">
                      <div className="w-28 h-4 bg-gray-200 rounded" />
                      <div className="w-20 h-3 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="w-24 h-6 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-28 h-7 bg-gray-200 rounded-full" />
                  <div className="w-20 h-7 bg-gray-200 rounded-full" />
                </div>
                <div className="py-2 border-t border-gray-100">
                  <div className="flex justify-between items-center px-2">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="flex flex-col items-center gap-1.5">
                        <div className="w-6 h-6 bg-gray-200 rounded-full" />
                        <div className="w-12 h-2.5 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <div className="w-48 h-3.5 bg-gray-200 rounded" />
                      <div className="w-28 h-3 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-gray-100">
                  <div className="w-full sm:w-36 h-11 bg-gray-200 rounded-lg" />
                  <div className="w-full sm:w-28 h-11 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="bg-white border border-red-200 rounded-xl p-8 shadow-2xs text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Unable to load orders</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {(error as any)?.message || 'An error occurred while connecting to the server. Please try again.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-900 text-white font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 sm:p-16 shadow-2xs text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {debouncedSearch || selectedStatus !== 'ALL' ? 'No matching orders found' : 'No orders placed yet'}
              </h3>
              <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                {debouncedSearch || selectedStatus !== 'ALL'
                  ? 'Try adjusting your search keywords or switching status filter tabs.'
                  : `Your purchases from ${siteName} will appear here with live tracking and receipts.`}
              </p>
            </div>
            <div>
              {debouncedSearch || selectedStatus !== 'ALL' ? (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-900 text-white font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/products"
                  className="btn-primary inline-flex items-center gap-2 text-xs"
                >
                  <ShoppingBag size={14} />
                  <span>Start Shopping</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((ord) => {
              const orderId = ord.id;
              const orderCode = ord.orderNumber || (ord.id ? ord.id.slice(0, 10) : 'ORD');
              const orderDate = ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';
              const status = ord.status || ord.orderStatus || 'Processing';
              const paymentStatus = ord.paymentStatus || 'Pending';
              const total = ord.total || ord.totalAmount || 0;
              const itemsList = Array.isArray(ord.items) ? ord.items : [];
              const itemCount = ord.itemCount || ord.itemsCount || itemsList.length || 1;
              const orderMeta = getOrderStatusMeta(status);
              const PROGRESS_STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];

              return (
                <div 
                  key={ord.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-2xs hover:border-gray-300 transition-all group"
                >
                  {/* Card Top Row: Order Code, Date & Total */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-primary-light group-hover:text-primary transition-colors border border-gray-200/80 flex-shrink-0">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">#{orderCode}</span>
                          <span className="text-xs text-gray-400 font-medium">• {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">
                          Placed on {orderDate}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-gray-500 font-medium">Order Total</div>
                      <div className="text-base font-bold text-gray-900">
                        {formatPrice(total, currencyCode, currencySymbol)}
                      </div>
                    </div>
                  </div>

                  {/* Prominent Status Row (right under order number and date) */}
                  <div className="pt-3 pb-1 flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={status} size="md" />
                    <PaymentStatusBadge status={paymentStatus} size="sm" />
                  </div>

                  {/* Compact 4-step Progress or Terminal Negative Banner */}
                  {orderMeta.isTerminalNegative ? (
                    <div className={`mt-3.5 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center gap-2.5 ${orderMeta.classes}`}>
                      <orderMeta.icon className="w-4 h-4 shrink-0" />
                      <span>This order is {orderMeta.label.toLowerCase()}. For support, please contact customer care.</span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-3 right-3 top-3 h-0.5 bg-gray-200 -z-0">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${(Math.min(orderMeta.step, 3) / 3) * 100}%` }}
                          />
                        </div>
                        {PROGRESS_STEPS.map((stepLabel, idx) => {
                          const isDone = idx <= orderMeta.step;
                          const isCurrent = idx === orderMeta.step;
                          return (
                            <div key={stepLabel} className="relative z-10 flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border-2 border-gray-300 text-gray-400'
                              }`}>
                                {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
                              </div>
                              <span className={`text-xs mt-1 font-medium ${
                                isCurrent ? 'text-gray-900 font-bold' : isDone ? 'text-gray-700' : 'text-gray-400'
                              }`}>
                                {stepLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items Preview */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2.5">
                    {itemsList.length > 0 ? (
                      itemsList.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden relative flex-shrink-0 bg-gray-50">
                            <SmartImage 
                              src={item.productImage || item.image || ''} 
                              alt={item.productName || item.name || 'Product'} 
                              fill
                              fallbackType="product"
                              fallbackLabel={item.productName || item.name}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-gray-900 truncate">
                              {item.productName || item.name || 'Store Item'}
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">
                              Qty: {item.quantity} • {formatPrice(item.unitPrice || item.price || 0, currencyCode, currencySymbol)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 italic py-1">
                        Standard packaged shipment with {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </div>
                    )}

                    {itemsList.length > 2 && (
                      <div className="text-xs font-semibold text-gray-500 pt-0.5">
                        +{itemsList.length - 2} more {itemsList.length - 2 === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>

                  {/* Actions Row (Mobile-first, min-h-[44px]) */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                    <Link
                      href={`/account/orders/${orderId}`}
                      className="min-h-[44px] px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      <span>View Order Details</span>
                      <ChevronRight size={16} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrackingOrderId(orderId);
                        setSelectedTrackingOrderNumber(ord.orderNumber || `#${orderId.slice(-8)}`);
                      }}
                      className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm rounded-lg border border-gray-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Truck size={16} className="text-primary" />
                      <span>Track Order</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls with min 44px buttons */}
            {pagination.totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-800">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-bold text-gray-800">{Math.min(page * limit, pagination.total)}</span> of{' '}
                  <span className="font-bold text-gray-800">{pagination.total}</span> orders
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                    className="min-h-[44px] min-w-[44px] p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1)
                    .filter((p) => {
                      if (pagination.totalPages <= 7) return true;
                      if (p === 1 || p === pagination.totalPages) return true;
                      if (Math.abs(p - page) <= 1) return true;
                      return false;
                    })
                    .map((p, idx, arr) => {
                      const prevVal = arr[idx - 1];
                      const hasGap = prevVal && p - prevVal > 1;

                      return (
                        <React.Fragment key={p}>
                          {hasGap && <span className="px-1 text-xs text-gray-400">...</span>}
                          <button
                            onClick={() => setPage(p)}
                            className={`min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center ${
                              page === p
                                ? 'bg-primary text-white shadow-xs'
                                : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                    disabled={page >= pagination.totalPages}
                    className="min-h-[44px] min-w-[44px] p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Quick Tracking Modal */}
      {selectedTrackingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" 
            onClick={() => setSelectedTrackingOrderId(null)} 
          />
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full relative z-10 shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Shipment Tracking</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Order {selectedTrackingOrderNumber}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTrackingOrderId(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Real API Tracking Timeline */}
            <OrderTrackingTimeline
              trackingData={trackingResponse}
              isLoading={isTrackingLoading}
              isFetching={isTrackingFetching}
              error={trackingError}
              onRetry={() => refetchTracking()}
              showExternalLink={true}
            />

            <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100">
              <Link
                href={`/account/orders/${selectedTrackingOrderId}`}
                className="flex-1 py-2.5 bg-gray-900 text-white text-center font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors shadow-2xs"
              >
                Full Order View
              </Link>
              <button 
                onClick={() => setSelectedTrackingOrderId(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
};
