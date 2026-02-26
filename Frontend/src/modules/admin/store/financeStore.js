import { create } from "zustand";
import api from "@/lib/axios";

export const useFinanceStore = create((set, get) => ({
  summary: null,
  transactions: [],
  pagination: null,
  summaryLoading: false,
  transactionsLoading: false,
  summaryError: null,
  transactionsError: null,

  fetchSummary: async (startDate, endDate) => {
    set({ summaryLoading: true, summaryError: null });
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get("/admin/finance/summary", { params });
      
      if (data.success) {
        set({ summary: data.summary, summaryLoading: false });
      } else {
        set({ summaryError: data.message, summaryLoading: false });
      }
    } catch (error) {
      console.error("[Finance] Summary fetch error:", error);
      set({
        summaryError: error.response?.data?.message || error.message,
        summaryLoading: false,
      });
    }
  },

  fetchTransactions: async (filters = {}) => {
    set({ transactionsLoading: true, transactionsError: null });
    try {
      const { data } = await api.get("/admin/finance/transactions", {
        params: filters,
      });

      if (data.success) {
        set({
          transactions: data.transactions,
          pagination: data.pagination,
          transactionsLoading: false,
        });
      } else {
        set({ transactionsError: data.message, transactionsLoading: false });
      }
    } catch (error) {
      console.error("[Finance] Transactions fetch error:", error);
      set({
        transactionsError: error.response?.data?.message || error.message,
        transactionsLoading: false,
      });
    }
  },
}));
