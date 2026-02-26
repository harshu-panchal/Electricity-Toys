import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Removed to avoid CORS issues with * origin
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        let token = null;

        // Helper to extract token from storage
        const getTokenFromStorage = (storageName, keyPath = ['user', 'token']) => {
            try {
                const storage = localStorage.getItem(storageName);
                if (storage) {
                    const parsed = JSON.parse(storage);
                    let current = parsed.state;
                    for (const key of keyPath) {
                        if (current && current[key]) {
                            current = current[key];
                        } else {
                            return null;
                        }
                    }
                    return current; // This should be the token string
                }
            } catch (e) {
                return null;
            }
            return null;
        };

        // Check current path to decide priority
        const isAdminPath = window.location.pathname.startsWith('/admin');

        if (isAdminPath) {
            // Prioritize Admin Token
            token = getTokenFromStorage('admin-auth-storage', ['admin', 'token']);
            if (!token) token = getTokenFromStorage('auth-storage', ['user', 'token']);
        } else {
            // Prioritize User Token
            token = getTokenFromStorage('auth-storage', ['user', 'token']);
            if (!token) token = getTokenFromStorage('admin-auth-storage', ['admin', 'token']);
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            const msg = error.response.data?.message || "";

            if (msg.toLowerCase().includes("deactivated") || msg.toLowerCase().includes("deleted")) {
                if (isAdminPath) {
                    localStorage.removeItem('admin-auth-storage');
                    window.location.href = '/admin/login';
                } else {
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
