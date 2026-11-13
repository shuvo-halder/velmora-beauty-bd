'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../services/customerService';
import { CustomerPayment } from '../../types/customer';
import { PaymentStatusBadge } from './OrderStatusBadge';
import { getPaymentGatewayMeta } from '../../utils/trackingStatus';
import { formatPrice } from '../../utils/formatters';
import { useStorefront } from '../../context/StorefrontContext';
import { useSettings } from '../../context/SettingsContext';
import { AccountLayout } from './AccountLayout';
import { 
  CreditCard, 
  ShoppingBag, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Receipt,
  Calendar,
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

export const PaymentsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { publicSettings } = useStorefront();
  const { settings } = useSettings();
  const currencyCode = publicSettings?.general?.currency || settings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || settings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customer', 'payments', { page, limit }],
    queryFn: async () => {
      const res = await customerService.getPayments({ page, limit });
      if (res.status === 'error' && !res.data) {
        throw new Error(res.message || 'Failed to load payment transactions.');
      }
      return res;
    },
    staleTime: 30 * 1000,
  });

  const payments: CustomerPayment[] = response?.data?.payments || [];
  const pagination = response?.data?.pagination || {
    page,
    limit,
    total: payments.length,
    totalPages: 1,
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 2000);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Summary Metrics
  const totalPaidInBatch = payments
    .filter((p) => (p.status || '').toUpperCase() === 'PAID')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return (
    <AccountLayout activeTab="payments">
      <div className="space-y-6">
        {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Payment History</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Review your digital receipts, gateway payment statuses, and transaction references.
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

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-champagne/50 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Receipt size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted">Total Paid on Page</div>
            <div className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
              {formatPrice(totalPaidInBatch, currencyCode, currencySymbol)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-champagne/50 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted">Total Recorded Transactions</div>
            <div className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
              {pagination.total ?? payments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 sm:p-6 border border-champagne/40 shadow-2xs animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-champagne/30">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-36" />
                <div className="h-3 bg-gray-200 rounded w-48" />
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
            <h3 className="text-base font-bold text-ink">Unable to load payments</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              {(error as any)?.message || 'An error occurred while communicating with the payment server.'}
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
      {!isLoading && !isError && payments.length === 0 && (
        <div className="bg-white border border-champagne/50 rounded-xl p-12 sm:p-16 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 border border-champagne/40">
            <CreditCard size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">No payment records found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1 leading-relaxed">
              When you complete checkout via online gateway or Cash on Delivery, your payment receipts will appear here.
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

      {/* Payments List (2-col grid on desktop, 1-col on mobile) */}
      {!isLoading && !isError && payments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {payments.map((payment) => {
            const rawMethod = payment.method || payment.paymentMethod || payment.gateway || 'COD';
            const gatewayMeta = getPaymentGatewayMeta(rawMethod);
            const GatewayIcon = gatewayMeta.icon;
            const dateDisplay = formatDateTime(payment.paidAt || payment.createdAt);
            const orderCode = payment.orderNumber || (payment.orderId ? payment.orderId.slice(0, 10) : null);
            const orderLink = payment.orderId ? `/account/orders/${encodeURIComponent(payment.orderId)}` : null;
            const txnRef = payment.transactionReference || payment.transactionId || null;
            const shortTxnRef = txnRef ? (txnRef.length > 14 ? `${txnRef.slice(0, 12)}...` : txnRef) : null;
            const isCopied = txnRef ? copiedId === txnRef : false;

            return (
              <div
                key={payment.id}
                className="bg-white border border-champagne/50 rounded-xl p-5 sm:p-6 shadow-2xs hover:border-champagne transition-all flex flex-col justify-between gap-4 group"
              >
                {/* Top Row: Method & Status Badge */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-champagne/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-champagne/40 flex items-center justify-center text-gray-600 group-hover:bg-sage/20 group-hover:text-primary transition-colors shrink-0">
                      <GatewayIcon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink leading-tight">
                        {gatewayMeta.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        <span>{dateDisplay}</span>
                      </div>
                    </div>
                  </div>

                  <PaymentStatusBadge status={payment.status} size="sm" />
                </div>

                {/* Middle Row: Amount & Order Link */}
                <div className="grid grid-cols-2 gap-3 py-1">
                  <div>
                    <div className="text-xs font-semibold text-muted">Amount Paid</div>
                    <div className="text-lg sm:text-xl font-bold text-ink mt-0.5">
                      {formatPrice(payment.amount, currencyCode, currencySymbol)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted">Associated Order</div>
                    <div className="mt-0.5">
                      {orderLink ? (
                        <Link
                          href={orderLink}
                          className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:underline"
                        >
                          <Hash size={13} className="shrink-0" />
                          <span>{orderCode || 'View Order'}</span>
                          <ArrowRight size={12} className="shrink-0" />
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500">
                          {orderCode ? `#${orderCode}` : 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Transaction Reference & Details */}
                {txnRef && (
                  <div className="pt-3 border-t border-champagne/30 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0 text-muted">
                      <span className="font-semibold text-gray-700 shrink-0">Txn Ref:</span>
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800 font-mono text-[11px] truncate">
                        {shortTxnRef}
                      </code>
                    </div>

                    <button
                      onClick={() => handleCopy(txnRef, txnRef)}
                      className="min-h-[44px] min-w-[44px] px-2 py-1 text-gray-500 hover:text-primary rounded-md hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-1 shrink-0 cursor-pointer text-xs"
                      title={isCopied ? 'Copied to clipboard' : 'Copy Transaction Reference'}
                      aria-label="Copy Transaction Reference"
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-emerald-600" />
                          <span className="text-emerald-700 font-semibold text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span className="font-semibold text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
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

export default PaymentsPage;
