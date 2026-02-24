import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../components/Toast";

export function VerifyResetOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const verifyResetOtp = useAuthStore((state) => state.verifyResetOtp);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !otp) {
            toast({
                title: "Missing Fields",
                description: "Email and OTP are required.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyResetOtp(email, otp);
            if (result.success) {
                toast({
                    title: "OTP VERIFIED! ✅",
                    description: "You can now reset your password.",
                });
                navigate("/reset-password", { state: { email, otp } });
            } else {
                toast({
                    title: "VERIFICATION FAILED",
                    description: result.error || "Invalid or expired OTP",
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
                            to="/forgot-password"
                            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Email
                        </Link>
                        <h2 className="text-xl font-black italic tracking-tighter text-primary mb-2">
                            ELECTRICI TOYS-HUB
                        </h2>
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">
                            Verify OTP
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Enter the 6-digit code sent to <b>{email || "your email"}</b>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground ml-1">
                                OTP Code
                            </label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full h-14 pl-14 pr-6 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all text-base tracking-[0.5em] font-bold"
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-foreground text-background rounded-full font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Remembered your password?{" "}
                        <Link to="/login" className="font-bold text-foreground hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:block w-1/2 p-12">
                <div className="w-full h-full rounded-tl-[100px] rounded-br-[100px] rounded-tr-[30px] rounded-bl-[30px] relative overflow-hidden">
                    <img
                        src="/assets/products/WhatsApp Image 2026-01-10 at 16.11.07 (1).jpeg"
                        alt="OTP Verification"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 md:p-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            One Step Away
                        </h2>
                        <p className="text-gray-300 text-lg mb-10 max-w-lg">
                            We need to make sure it&apos;s really you. Enter the code to regain access to your account.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
