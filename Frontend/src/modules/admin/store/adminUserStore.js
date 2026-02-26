import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAdminUserStore = create(
  persist(
    (set) => ({
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      loading: false,
      error: null,
      selectedUser: null,
      selectedUserOrders: [],
      selectedUserMetrics: null,

      fetchUsers: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });
        try {
          const resp = await api.get(`/admin/users?page=${page}&limit=${limit}`);
          if (resp.data.success) {
            const mapped = resp.data.users.map(u => ({
              id: u._id,
              name: u.fullName,
              email: u.email,
              phone: u.phone || 'N/A',
              role: (u.role || 'user').toUpperCase(),
              createdAt: u.createdAt,
              status: u.isActive ? 'Active' : 'Inactive',
              ...u
            }));
            set({
              users: mapped,
              total: resp.data.total,
              page: resp.data.page,
              limit: resp.data.limit
            });
          }
        } catch (error) {
          set({ error: error.response?.data?.message || error.message });
        } finally {
          set({ loading: false });
        }
      },

      fetchUserDetail: async (id) => {
        set({ loading: true, error: null, selectedUser: null, selectedUserOrders: [], selectedUserMetrics: null });
        try {
          const resp = await api.get(`/admin/users/${id}`);
          if (resp.data.success) {
            const u = resp.data.user;
            const user = {
              id: u._id,
              name: u.fullName,
              email: u.email,
              phone: u.phone || 'N/A',
              address: u.address || '',
              city: u.city || '',
              state: u.state || '',
              zipCode: u.zipCode || '',
              role: (u.role || 'user').toUpperCase(),
              status: u.isActive ? 'Active' : 'Inactive',
              createdAt: u.createdAt,
              isVerified: !!u.isVerified,
              ...u
            };
            const orders = (resp.data.orders || []).map(o => ({
              id: o._id,
              date: o.createdAt,
              status: o.orderStatus ? o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1) : 'Pending',
              total: o.grandTotal || o.totalAmount || 0,
              paymentStatus: o.paymentStatus || 'Pending',
              itemsCount: Array.isArray(o.products) ? o.products.reduce((acc, p) => acc + (p.quantity || 1), 0) : 0,
              ...o
            }));
            set({
              selectedUser: user,
              selectedUserOrders: orders,
              selectedUserMetrics: resp.data.metrics || null
            });
          }
        } catch (error) {
          set({ error: error.response?.data?.message || error.message });
        } finally {
          set({ loading: false });
        }
      },

      toggleUserStatus: async (id) => {
        try {
          const resp = await api.patch(`/admin/users/${id}/toggle-status`);
          if (resp.data.success) {
            // Update local state for the user list
            set((state) => ({
              users: state.users.map((u) =>
                u.id === id ? { ...u, status: resp.data.isActive ? "Active" : "Inactive", isActive: resp.data.isActive } : u
              ),
              // If the current detail view is for this user, update it too
              selectedUser: state.selectedUser?.id === id
                ? { ...state.selectedUser, status: resp.data.isActive ? "Active" : "Inactive", isActive: resp.data.isActive }
                : state.selectedUser
            }));
            return { success: true, message: resp.data.message };
          }
        } catch (error) {
          return { success: false, message: error.response?.data?.message || error.message };
        }
      }
    }),
    {
      name: 'admin-user-storage'
    }
  )
);
