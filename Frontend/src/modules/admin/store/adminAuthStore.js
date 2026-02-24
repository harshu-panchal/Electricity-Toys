import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../lib/axios';

export const useAdminAuthStore = create(
    persist(
        (set) => ({
            admin: null,
            isAuthenticated: false,

            login: async (email, password) => {
                try {
                    // Call the new Merged Admin Login/Register Endpoint
                    const response = await api.post('/auth/admin-login', { email, password });
                    if (response.data.success) {
                        const user = response.data.data;
                        // Store admin data and token
                        set({ admin: { ...user, token: response.data.token }, isAuthenticated: true });
                        return { success: true };
                    }
                    return { success: false, error: response.data.message };
                } catch (error) {
                    return { success: false, error: error.response?.data?.message || 'Access failed' };
                }
            },

            logout: () => set({ admin: null, isAuthenticated: false }),

            updateProfile: async (updates) => {
                // Placeholder for update profile if needed
                set((state) => ({ admin: { ...state.admin, ...updates } }));
                return { success: true };
            },

            forgotPassword: async (email) => {
                try {
                    const response = await api.post('/auth/forgot-password', { email, role: 'admin' });
                    return { success: response.data.success, message: response.data.message };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Request failed'
                    };
                }
            },

            verifyResetOtp: async (email, otp) => {
                try {
                    const response = await api.post('/auth/verify-reset-otp', { email, otp });
                    return { success: response.data.success, message: response.data.message };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Verification failed'
                    };
                }
            },

            resetPassword: async (data) => {
                try {
                    const response = await api.post('/auth/reset-password', data);
                    return { success: response.data.success, message: response.data.message };
                } catch (error) {
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Reset failed'
                    };
                }
            },
        }),
        {
            name: 'admin-auth-storage',
        }
    )
);
