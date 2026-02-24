import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useToast } from "../../components/Toast";
import { useAuthStore } from "../../store/authStore";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        toast({
          title: "OTP SENT! 📧",
          description: "Check your inbox for the 6-digit verification code.",
          variant: "success",
        });
        navigate("/verify-reset-otp", { state: { email } });
      } else {
        toast({
          title: "ERROR",
          description: result.error || "Failed to send reset OTP",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "ERROR",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-background transition-colors duration-300 overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 lg:p-16 justify-start pt-28 h-full">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Header */}
          <div>
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
            <h2 className="text-xl font-black italic tracking-tighter text-primary mb-2">
              ELECTRICI TOYS-HUB
            </h2>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Forgot Password?
            </h1>
            <p className="text-base text-muted-foreground">
              Don&apos;t worry! It happens. Enter your email to receive a 6-digit OTP code to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 rounded-full bg-secondary/50 border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-foreground text-background rounded-full font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-bold text-foreground hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block w-1/2 p-12">
        <div className="w-full h-full rounded-tl-[100px] rounded-br-[100px] rounded-tr-[30px] rounded-bl-[30px] relative overflow-hidden">
          <img
            src="/assets/products/WhatsApp Image 2026-01-10 at 16.11.07 (1).jpeg"
            alt="Forgot Password Feature"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Secure & Safe
              <br />
              OTP Verification
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-lg">
              We ensure your account security is our top priority. Reset your
              password safely and get back to the fun.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-sm font-semibold">
                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  🔒
                </span>
                Secure Reset
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-sm font-semibold">
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  ✉️
                </span>
                Instant Email
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
