import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { Button } from '../../../user/components/ui/button';
import { Input } from '../../../user/components/ui/input';
import { useToast } from '../../../user/components/Toast';
import { Loader2, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { resetPassword } = useAdminAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        otp: location.state?.otp || '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Passwords Mismatch",
                description: "New password and confirmation do not match.",
                variant: "destructive",
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await resetPassword(formData);

            if (result.success) {
                toast({
                    title: "SUCCESS! 🎊",
                    description: "Password reset successful. Welcome back!",
                    variant: "success",
                });
                navigate('/admin/login');
            } else {
                toast({
                    title: "Reset Failed",
                    description: result.error || "Unable to reset password",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex text-foreground relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-6xl mx-auto flex items-center justify-center p-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-background/60 backdrop-blur-xl border border-secondary/20 p-8 md:p-10 rounded-[2.5rem] shadow-2xl"
                    >
                        <div className="mb-8">
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">New Password</h1>
                            <p className="text-muted-foreground font-medium italic">Create a secure password to protect your Toy Empire hub.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest pl-4">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="h-12 pl-12 pr-12 rounded-2xl bg-secondary/10 border-secondary/20 focus:border-primary/50 text-sm font-bold"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest pl-4">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="h-12 pl-12 rounded-2xl bg-secondary/10 border-secondary/20 focus:border-primary/50 text-sm font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl text-lg font-black italic uppercase tracking-widest hover:scale-[1.02] transition-transform bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        Update Password <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="hidden lg:block text-right space-y-8"
                    >
                        <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-tight">
                            Access<br />
                            <span className="text-primary">Restored.</span>
                        </h2>
                        <p className="text-xl text-muted-foreground font-medium max-w-md ml-auto">
                            Once updated, you can immediately dive back into managing your business hub.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
