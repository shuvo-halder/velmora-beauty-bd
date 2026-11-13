'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { CustomerShipment, TrackingEvent, ShipmentItem } from '../../types/customer';
import { ShipmentStatusBadge } from './OrderStatusBadge';
import { getTrackingStatusMeta } from '../../utils/trackingStatus';
import { SmartImage } from '../common/SmartImage';
import { AccountLayout } from './AccountLayout';
import { 
  Truck, 
  Package, 
  ShoppingBag, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Hash,
  ArrowRight
} from 'lucide-react';

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

export const ShipmentsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
  const [expandedShipmentIds, setExpandedShipmentIds] = useState<Record<string, boolean>>({});

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customer', 'shipments', { page, limit }],
    queryFn: async () => {
      const res = await customerService.getShipments({ page, limit });
      if (res.status === 'error' && !res.data) {
        throw new Error(res.message || 'Failed to load customer shipments.');
      }
      return res;
    },
    staleTime: 30 * 1000,
  });

  const shipments: CustomerShipment[] = response?.data?.shipments || [];
  const pagination = response?.data?.pagination || {
    page,
    limit,
    total: shipments.length,
    totalPages: 1,
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTrackingId(id);
    setTimeout(() => {
      setCopiedTrackingId((current) => (current === id ? null : current));
    }, 2000);
  };

  const toggleAccordion = (id: string) => {
    setExpandedShipmentIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AccountLayout activeTab="shipments">
      <div className="space-y-6">
        {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Shipments & Tracking</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Monitor real-time package delivery status, courier tracking codes, and transit history.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="min-h-[44px] px-3.5 py-2 bg-white text-gray-700 hover:text-primary font-semibold text-xs sm:text-sm rounded-lg border border-champagne/50 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-2xs inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 sm:p-6 border border-champagne/40 shadow-2xs animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-champagne/30">
                <div className="h-5 bg-gray-200 rounded w-36" />
                <div className="h-6 bg-gray-200 rounded-full w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="bg-white border border-red-200 rounded-xl p-8 sm:p-12 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">Unable to load shipments</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              {(error as any)?.message || 'An error occurred while communicating with the shipping service.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="min-h-[44px] px-5 py-2.5 bg-gray-900 text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && shipments.length === 0 && (
        <div className="bg-white border border-champagne/50 rounded-xl p-12 sm:p-16 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-champagne/40">
            <Truck size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">No shipments found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1 leading-relaxed">
              Once your orders are packed and dispatched with our courier partners, their live tracking milestones will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="min-h-[44px] px-5 py-2.5 bg-primary text-white hover:bg-primary-hover font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <ShoppingBag size={15} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      )}

      {/* Shipments List */}
      {!isLoading && !isError && shipments.length > 0 && (
        <div className="space-y-5">
          {shipments.map((shipment, sIdx) => {
            const shipmentKey = shipment.id || `shipment-${sIdx}`;
            const courier = shipment.courierName || shipment.providerName || shipment.carrier || 'Express Delivery';
            const trackingNum = shipment.trackingNumber || null;
            const trackingUrl = shipment.trackingUrl && shipment.trackingUrl.trim() !== '' ? shipment.trackingUrl : null;
            const isCopied = trackingNum ? copiedTrackingId === shipmentKey : false;
            const orderCode = shipment.orderNumber || (shipment.orderId ? shipment.orderId.slice(0, 10) : null);
            const orderLink = shipment.orderId ? `/account/orders/${encodeURIComponent(shipment.orderId)}` : null;

            const shippedDate = shipment.shippedAt ? formatDateTime(shipment.shippedAt) : null;
            const deliveredDate = shipment.deliveredAt ? formatDateTime(shipment.deliveredAt) : null;
            const estimatedDate = (shipment.estimatedDelivery || shipment.estimatedDeliveryDate)
              ? formatDateTime(shipment.estimatedDelivery || shipment.estimatedDeliveryDate)
              : null;

            const items: ShipmentItem[] = Array.isArray(shipment.items) ? shipment.items : [];
            const isExpanded = Boolean(expandedShipmentIds[shipmentKey]);

            // Sort events newest first
            const rawEvents: TrackingEvent[] = Array.isArray(shipment.trackingEvents)
              ? [...shipment.trackingEvents]
              : [];
            const sortedEvents = rawEvents.sort((a, b) => {
              const timeA = new Date(a.timestamp || a.date || a.createdAt || 0).getTime();
              const timeB = new Date(b.timestamp || b.date || b.createdAt || 0).getTime();
              return timeB - timeA;
            });

            return (
              <div
                key={shipmentKey}
                className="bg-white border border-champagne/50 rounded-xl p-5 sm:p-6 shadow-2xs hover:border-champagne transition-all space-y-4"
              >
                {/* Header: Courier, Status Badge & Order Number */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-champagne/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-champagne/40 flex items-center justify-center text-primary shrink-0">
                      <Truck size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-ink">{courier}</span>
                        {orderCode && (
                          <span className="text-xs text-muted font-medium">
                            • Order #{orderCode}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        Package ID: <span className="font-mono text-gray-700">{shipment.id || `#${sIdx + 1}`}</span>
                      </div>
                    </div>
                  </div>

                  <ShipmentStatusBadge status={shipment.status} size="md" />
                </div>

                {/* Details Grid: Tracking Number & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1 text-xs">
                  {/* Tracking Number Box */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-champagne/40 flex flex-col justify-between">
                    <span className="text-muted font-medium">Tracking Number</span>
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <span className="font-mono font-bold text-ink truncate">
                        {trackingNum || 'Pending Assignment'}
                      </span>
                      {trackingNum && (
                        <button
                          onClick={() => handleCopy(trackingNum, shipmentKey)}
                          className="min-h-[44px] min-w-[44px] p-1 text-gray-500 hover:text-primary rounded hover:bg-gray-200/60 transition-colors inline-flex items-center justify-center cursor-pointer shrink-0"
                          title={isCopied ? 'Copied' : 'Copy tracking number'}
                          aria-label="Copy tracking number"
                        >
                          {isCopied ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shipped Date */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-champagne/40 flex flex-col justify-between">
                    <span className="text-muted font-medium flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span>Dispatch Date</span>
                    </span>
                    <span className="font-bold text-ink mt-1">
                      {shippedDate || 'Processing Dispatch'}
                    </span>
                  </div>

                  {/* Delivery / Estimate Date */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-champagne/40 flex flex-col justify-between">
                    <span className="text-muted font-medium flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      <span>{deliveredDate ? 'Delivered On' : 'Estimated Delivery'}</span>
                    </span>
                    <span className="font-bold text-ink mt-1">
                      {deliveredDate || estimatedDate || 'Standard (2-4 Days)'}
                    </span>
                  </div>
                </div>

                {/* Package Items Preview */}
                {items.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-semibold text-muted mb-2">
                      Package Items ({items.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-2.5 p-2 bg-gray-50/70 rounded-lg border border-champagne/30"
                        >
                          <div className="w-10 h-10 rounded-md border border-champagne/40 overflow-hidden relative shrink-0 bg-white">
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
                            <div className="text-xs font-bold text-ink truncate">
                              {item.productName || item.name || 'Product Item'}
                            </div>
                            <div className="text-[11px] text-muted">
                              Qty: <span className="font-semibold text-gray-700">{item.quantity}</span>
                              {item.variantName && <span> • {item.variantName}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracking Events Accordion */}
                {sortedEvents.length > 0 && (
                  <div className="pt-2 border-t border-champagne/30">
                    <button
                      onClick={() => toggleAccordion(shipmentKey)}
                      className="min-h-[44px] w-full flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-primary py-2 transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" />
                        <span>Tracking Timeline ({sortedEvents.length} events)</span>
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pl-2 sm:pl-4 border-l-2 border-champagne/60 space-y-4">
                        {sortedEvents.map((evt, eIdx) => {
                          const evtMeta = getTrackingStatusMeta(evt.status);
                          const EvtIcon = evtMeta.icon;
                          const formattedTime = formatDateTime(evt.timestamp || evt.date || evt.createdAt);

                          return (
                            <div key={evt.id || eIdx} className="relative pl-5">
                              <span
                                className={`absolute -left-[1.35rem] top-0.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs ${evtMeta.dotClass}`}
                              >
                                <EvtIcon size={12} />
                              </span>
                              <div>
                                <div className="text-xs font-bold text-ink">
                                  {evt.description || evt.title || evtMeta.label}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-muted">
                                  <span>{formattedTime}</span>
                                  {evt.location && (
                                    <>
                                      <span>•</span>
                                      <span className="inline-flex items-center gap-0.5 text-gray-700">
                                        <MapPin size={11} className="text-gray-400" />
                                        {evt.location}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-champagne/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {orderLink && (
                      <Link
                        href={orderLink}
                        className="min-h-[44px] px-3.5 py-2 bg-white text-gray-700 hover:text-primary border border-champagne/50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ShoppingBag size={14} />
                        <span>View Order</span>
                      </Link>
                    )}
                  </div>

                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Track on Courier Site</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-champagne/40">
          <div className="text-xs text-muted font-medium">
            Page <span className="font-bold text-ink">{pagination.page}</span> of{' '}
            <span className="font-bold text-ink">{pagination.totalPages}</span> ({pagination.total} total)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg border border-champagne/50 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg border border-champagne/50 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  </AccountLayout>
  );
};

export default ShipmentsPage;
