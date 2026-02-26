import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, User, Bell, Search, LogOut, CheckCircle, ShoppingBag, AlertCircle, Star, Zap, Trash2 } from 'lucide-react';
import { Button } from '../../user/components/ui/button';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { socket } from '@/lib/socket';

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { admin, logout } = useAdminAuthStore();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notificationRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications/admin');
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Fetch layouts notifications failed", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        if (isNotifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotifOpen]);

    React.useEffect(() => {
        fetchNotifications();
        if (!socket.connected) socket.connect();

        const handleAdminNotif = (notif) => {
            setNotifications(prev => [notif, ...prev]);
        };
        socket.on("admin-notification", handleAdminNotif);
        return () => socket.off("admin-notification", handleAdminNotif);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const toggleRead = async (id) => {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        try { await api.put(`/notifications/${id}/read`); } catch (e) { }
    };

    const handleClearAll = async () => {
        try {
            await api.delete('/notifications/admin/clear-all');
            setNotifications([]);
        } catch (error) {
            console.error("Clear notifications failed", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return { icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'stock': return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
            default: return { icon: Zap, color: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            // Navigate to products page with search query
            navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />

            <div className="lg:ml-72 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 md:h-20 border-b border-secondary/20 flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-secondary/20 rounded-xl transition-all"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="hidden md:flex items-center bg-secondary/30 rounded-full px-4 py-2 gap-3 min-w-[300px] border border-transparent focus-within:border-primary/30 transition-all">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products, orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="bg-transparent border-none outline-none text-xs w-full uppercase tracking-widest font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 relative" ref={notificationRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full relative"
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary border-2 border-background rounded-full animate-bounce" />
                                )}
                            </Button>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-4 w-80 md:w-96 bg-background border border-secondary/20 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-secondary/10 flex items-center justify-between bg-secondary/5">
                                            <h3 className="text-sm font-black italic uppercase tracking-tighter">Notifications</h3>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleClearAll}
                                                    className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    Clear All
                                                </button>
                                                <span className="text-[10px] font-bold py-0.5 px-2 bg-primary/20 text-primary rounded-full uppercase">{unreadCount} New</span>
                                            </div>
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto divide-y divide-secondary/5">
                                            {notifications.length > 0 ? (
                                                notifications.slice(0, 10).map((notif) => {
                                                    const style = getIcon(notif.type);
                                                    const Icon = style.icon;
                                                    return (
                                                        <div
                                                            key={notif._id}
                                                            className={`p-4 flex gap-3 hover:bg-secondary/5 transition-colors cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                                            onClick={() => {
                                                                console.log("Notification Clicked:", notif);
                                                                if (!notif.isRead) toggleRead(notif._id);

                                                                // Redirect if it's an order notification
                                                                if (notif.type === 'order') {
                                                                    if (notif.referenceId) {
                                                                        console.log("Navigating to detail page:", notif.referenceId);
                                                                        navigate(`/admin/orders/${notif.referenceId}`);
                                                                    } else {
                                                                        console.log("No referenceId found, navigating to list page");
                                                                        navigate('/admin/orders');
                                                                    }
                                                                    setIsNotifOpen(false);
                                                                }
                                                            }}
                                                        >
                                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color}`}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <p className="text-xs font-black italic uppercase tracking-tighter truncate">{notif.title}</p>
                                                                    <span className="text-[8px] font-bold text-muted-foreground whitespace-nowrap">{format(new Date(notif.createdAt), 'hh:mm a')}</span>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No notifications</p>
                                                </div>
                                            )}
                                        </div>

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-[1px] bg-secondary/20 mx-2" />

                        <div className="flex items-center gap-4 pl-2">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-black italic uppercase tracking-tighter">{admin?.fullName || 'Admin Panel'}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center p-0.5 border border-primary/20 overflow-hidden">
                                {admin?.avatar ? (
                                    <img src={admin.avatar} alt="Admin" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <User className="h-5 w-5 text-primary" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 bg-secondary/5">
                    <Outlet />
                </main>
            </div >
        </div >
    );
}
