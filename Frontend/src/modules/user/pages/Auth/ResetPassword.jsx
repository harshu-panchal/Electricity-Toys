import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../components/Toast";

export function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        email: location.state?.email || "",
        otp: location.state?.otp || "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const resetPassword = useAuthStore((state) => state.resetPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "PASSWORDS MISMATCH",
                description: "New password and confirmation do not match.",
                variant: "destructive",
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            toast({
                title: "WEAK PASSWORD",
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
                    description: "Your password has been reset. Please log in.",
                });
                navigate("/login");
            } else {
                toast({
                    title: "RESET FAILED",
                    description: result.error || "Failed to reset password",
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "ERROR",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-background transition-colors duration-300 overflow-hidden">
            <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 lg:p-16 justify-start pt-28 h-full">
                <div className="max-w-md w-full mx-auto space-y-8">
                    <div>
                        <Link
                            to="/verify-reset-otp"
                            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to OTP
                        </Link>
                        <h2 className="text-xl font-black italic tracking-tighter text-primary mb-2">
                            ELECTRICI TOYS-HUB
                        </h2>
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">
                            Reset Password
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Create a new strong password for your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full h-14 pl-14 pr-12 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all text-base"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full h-14 pl-14 pr-12 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all text-base"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-foreground text-background rounded-full font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden lg:block w-1/2 p-12">
                <div className="w-full h-full rounded-tl-[100px] rounded-br-[100px] rounded-tr-[30px] rounded-bl-[30px] relative overflow-hidden">
                    <img
                        src="/assets/products/WhatsApp Image 2026-01-10 at 16.11.07 (1).jpeg"
                        alt="Secure Reset"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 md:p-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Password Security
                        </h2>
                        <p className="text-gray-300 text-lg mb-10 max-w-lg">
                            Make sure your new password is unique and not used on other websites.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
