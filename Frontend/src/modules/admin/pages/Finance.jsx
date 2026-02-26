import React, { useState, useEffect, useMemo } from "react";
import { useFinanceStore } from "../store/financeStore";
import { Badge } from "../../user/components/ui/badge";
import { Button } from "../../user/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  RotateCcw,
  XCircle,
  Truck,
  CreditCard,
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

export default function Finance() {
  const {
    summary,
    transactions,
    pagination,
    summaryLoading,
    transactionsLoading,
    summaryError,
    transactionsError,
    fetchSummary,
    fetchTransactions,
  } = useFinanceStore();

  // Filters
  const [filters, setFilters] = useState({
    paymentMethod: "all",
    orderStatus: "all",
    startDate: "",
    endDate: "",
    search: "",
    page: 1,
    limit: 15,
  });

  useEffect(() => {
    fetchSummary(filters.startDate, filters.endDate);
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    const params = {};
    if (filters.paymentMethod !== "all") params.paymentMethod = filters.paymentMethod;
    if (filters.orderStatus !== "all") params.orderStatus = filters.orderStatus;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.search) params.search = filters.search;
    params.page = filters.page;
    params.limit = filters.limit;
    fetchTransactions(params);
  }, [filters]);

  const s = summary || {};

  const summaryCards = [
    {
      title: "Total Income",
      value: s.totalIncome || 0,
      icon: IndianRupee,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      subtitle: `COD: ₹${(s.totalIncomeCOD || 0).toLocaleString()} / Online: ₹${(s.totalIncomeOnline || 0).toLocaleString()}`,
      trend: "up",
    },
    {
      title: "Pending Income",
      value: s.pendingIncome || 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      subtitle: `${s.pendingCount || 0} orders awaiting settlement`,
      trend: "neutral",
    },
    {
      title: "Total Refunds",
      value: s.totalRefundAmount || 0,
      icon: RotateCcw,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      subtitle: `${s.pendingRefundsCount || 0} pending · ${s.completedRefundsCount || 0} completed`,
      trend: "down",
    },
    {
      title: "Cancelled Orders",
      value: s.cancelledOrdersAmount || 0,
      icon: XCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      subtitle: `${s.cancelledCount || 0} orders cancelled`,
      trend: "down",
    },
    {
      title: "Returned Orders",
      value: s.returnedOrdersAmount || 0,
      icon: RefreshCw,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      subtitle: `${s.returnedCount || 0} orders returned`,
      trend: "down",
    },
    {
      title: "Shipping Collected",
      value: s.totalShippingCollected || 0,
      icon: Truck,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      subtitle: `COD Surcharge: ₹${(s.totalCodChargesCollected || 0).toLocaleString()}`,
      trend: "up",
    },
  ];

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      shipped: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return map[status] || "bg-secondary/10 text-muted-foreground";
  };

  const getPaymentBadge = (status) => {
    const map = {
      Paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      Failed: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return map[status] || "bg-secondary/10 text-muted-foreground";
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-secondary/10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              Finance
            </h1>
          </div>
          <p className="text-sm md:text-lg text-muted-foreground font-medium italic pl-1">
            Revenue analytics, payment tracking & financial health
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-full font-black uppercase tracking-widest text-[10px] h-10 px-6"
            onClick={() => {
              fetchSummary(filters.startDate, filters.endDate);
              fetchTransactions(filters);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(summaryError || transactionsError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-widest">
            ⚠️ Error: {summaryError || transactionsError}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "relative group p-6 rounded-[2rem] border overflow-hidden transition-all duration-300 hover:shadow-lg",
              card.border,
              i === 0
                ? "sm:col-span-2 lg:col-span-1 bg-foreground text-background"
                : "bg-background"
            )}
          >
            <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: "currentColor" }} />
            
            <div className="flex items-center justify-between mb-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              {card.trend === "up" && <ArrowUpRight className="h-4 w-4 text-emerald-400" />}
              {card.trend === "down" && <ArrowDownRight className="h-4 w-4 text-red-400" />}
            </div>

            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-2",
              i === 0 ? "opacity-60" : "text-muted-foreground"
            )}>
              {card.title}
            </p>
            <p className="text-3xl font-black italic tracking-tighter">
              ₹{(card.value || 0).toLocaleString()}
            </p>
            <p className={cn(
              "text-[10px] font-bold tracking-wide mt-1",
              i === 0 ? "opacity-40" : "text-muted-foreground"
            )}>
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-secondary/5 rounded-[2rem] border border-secondary/10 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Transaction Filters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order ID or Name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-11 pr-4 py-3 bg-background border border-secondary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
            />
          </div>

          {/* Payment Method */}
          <select
            value={filters.paymentMethod}
            onChange={(e) =>
              setFilters({ ...filters, paymentMethod: e.target.value, page: 1 })
            }
            className="px-4 py-3 bg-background border border-secondary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold cursor-pointer appearance-none"
          >
            <option value="all">All Payments</option>
            <option value="COD">COD</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="ONLINE">Online</option>
          </select>

          {/* Order Status */}
          <select
            value={filters.orderStatus}
            onChange={(e) =>
              setFilters({ ...filters, orderStatus: e.target.value, page: 1 })
            }
            className="px-4 py-3 bg-background border border-secondary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold cursor-pointer appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-2 lg:col-span-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value, page: 1 })
              }
              className="flex-1 px-4 py-3 bg-background border border-secondary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value, page: 1 })
              }
              className="flex-1 px-4 py-3 bg-background border border-secondary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black italic tracking-tighter uppercase">
              Transaction Ledger
            </h3>
          </div>
          <Badge variant="outline" className="font-bold">
            {pagination?.total || 0} Records
          </Badge>
        </div>

        <div className="bg-background border border-secondary/20 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-secondary/20">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                  <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 whitespace-nowrap">Method</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Subtotal</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Shipping</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Grand Total</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Payment</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Order</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Refund</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="group hover:bg-secondary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-xs font-black italic tracking-tighter uppercase group-hover:text-primary transition-colors">
                        #{(t.orderId || t._id).slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold truncate max-w-[120px]">
                        {t.userName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {(t.paymentMethod || "").toUpperCase() === "COD" ? (
                          <Wallet className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {t.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-bold">
                        ₹{(t.totalAmount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-bold text-muted-foreground">
                        ₹{((t.shippingAmount || 0) + (t.codCharge || 0)).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black italic">
                        ₹{(t.grandTotal || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          getPaymentBadge(t.paymentStatus)
                        )}
                      >
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          getStatusBadge(t.orderStatus)
                        )}
                      >
                        {t.isReturned ? "Returned" : t.isCancelled ? "Cancelled" : t.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p
                        className={cn(
                          "text-xs font-black italic",
                          t.refundAmount > 0
                            ? "text-red-500"
                            : "text-muted-foreground/30"
                        )}
                      >
                        {t.refundAmount > 0
                          ? `₹${t.refundAmount.toLocaleString()}`
                          : "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        {t.createdAt
                          ? format(new Date(t.createdAt), "MMM dd, yyyy")
                          : "-"}
                      </p>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && !transactionsLoading && (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-secondary/5 flex items-center justify-center">
                          <IndianRupee className="h-6 w-6 text-muted-foreground opacity-20" />
                        </div>
                        <p className="text-xs font-black italic uppercase tracking-[0.2em] text-muted-foreground/50">
                          No transactions found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {transactionsLoading && (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <p className="text-xs font-black italic uppercase tracking-widest text-muted-foreground">
                          Loading...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-secondary/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 w-8 p-0"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 w-8 p-0"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
