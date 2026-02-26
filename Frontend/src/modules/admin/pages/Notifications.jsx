import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    ShoppingBag,
    AlertCircle,
    Star,
    Zap,
    CheckCircle,
    X,
    Filter,
    Send,
    UserPlus,
    Loader2,
    Trash2
} from 'lucide-react';
import { Button } from '../../user/components/ui/button';
import { Badge } from '../../user/components/ui/badge';
import { Input } from '../../user/components/ui/input';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { socket } from '@/lib/socket';
import { useToast } from '../../user/components/Toast';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [sending, setSending] = useState(false);
    const [newNotif, setNewNotif] = useState({ title: '', message: '' });

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!newNotif.title || !newNotif.message) return;
        setSending(true);
        try {
            const { data } = await api.post('/notifications/admin/send', {
                ...newNotif,
                type: 'admin'
            });
            if (data.success) {
                toast({ title: "Sent!", description: "Notification sent to all users.", variant: "success" });
                setNewNotif({ title: '', message: '' });
                fetchNotifications();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to send notification.", variant: "destructive" });
        } finally {
            setSending(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications/admin/broadcasts');
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Fetch layouts notifications failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const removeNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return { icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'stock': return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
            case 'review': return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' };
            default: return { icon: Zap, color: 'text-primary', bg: 'bg-primary/10' };
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase mb-1 md:mb-2">Broadcast Center</h1>
                    <p className="text-xs md:text-base text-muted-foreground font-medium italic">Manage and view your sent broadcasts ({notifications.length} total)</p>
                </div>
                {notifications.length > 0 && (
                    <Button
                        variant="ghost"
                        onClick={async () => {
                            try {
                                await api.delete('/notifications/admin/clear-all?type=admin');
                                fetchNotifications();
                            } catch (e) {
                                console.error("Clear failed", e);
                            }
                        }}
                        className="rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 h-auto py-2"
                    >
                        Clear All Broadcasts
                    </Button>
                )}
            </div>

            {/* Create Notification Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background border border-secondary/20 p-6 md:p-8 rounded-[2.5rem] shadow-xl"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Send className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Create Notification</h2>
                        <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest italic">Blast a message to all users</p>
                    </div>
                </div>

                <form onSubmit={handleSendNotification} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] pl-4 text-muted-foreground">Notification Title</label>
                            <Input
                                placeholder="e.g. MEGA SALE IS LIVE!"
                                value={newNotif.title}
                                onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                                className="h-12 md:h-14 rounded-2xl bg-secondary/5 border-secondary/20 focus:border-primary/50 text-xs md:text-sm font-bold placeholder:opacity-30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] pl-4 text-muted-foreground">Message Content</label>
                            <Input
                                placeholder="Describe the update..."
                                value={newNotif.message}
                                onChange={(e) => setNewNotif({ ...newNotif, message: e.target.value })}
                                className="h-12 md:h-14 rounded-2xl bg-secondary/5 border-secondary/20 focus:border-primary/50 text-xs md:text-sm font-bold placeholder:opacity-30"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={sending || !newNotif.title || !newNotif.message}
                            className="w-full md:w-auto px-8 md:px-12 h-12 md:h-14 rounded-2xl font-black italic uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Blast <Send className="ml-2 h-4 w-4" /></>}
                        </Button>
                    </div>
                </form>
            </motion.div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-[2rem] overflow-hidden">
                <div className="divide-y divide-secondary/10">
                    <AnimatePresence mode='popLayout'>
                        {notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const style = getIcon(notif.type);
                                const Icon = style.icon;

                                return (
                                    <motion.div
                                        key={notif._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`p-4 md:p-6 flex gap-4 md:gap-6 items-start transition-colors relative group bg-background/40`}
                                    >
                                        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color} border border-current opacity-20`}>
                                            <Icon className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>

                                        <div className="flex-1 space-y-0.5 md:space-y-1">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <Badge variant="outline" className={`text-[8px] uppercase tracking-widest px-2`}>
                                                    {notif.type}
                                                </Badge>
                                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                                    {format(new Date(notif.createdAt), 'MMM dd, hh:mm a')}
                                                </span>
                                            </div>
                                            <h4 className={`text-sm md:text-lg font-black italic uppercase tracking-tighter`}>
                                                {notif.title}
                                            </h4>
                                            <p className="text-xs md:text-sm font-medium italic leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1 md:gap-2">
                                            <button
                                                onClick={() => removeNotification(notif._id)}
                                                className="p-1.5 md:p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Broadcast"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })
                        ) : (
                            <div className="p-10 md:p-20 text-center flex flex-col items-center">
                                <div className="h-16 w-16 md:h-20 md:w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-emerald-500" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-foreground">All caught up!</h3>
                                <p className="text-muted-foreground italic mt-2 text-xs md:text-base">No new notifications at the moment.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </div>
    );
}
