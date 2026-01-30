"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useWebSettings } from "@/hooks/useWebSettings";
import { Store } from "lucide-react";

export const AdminForgotPassword = () => {
  const { logoUrl, isLoading: isLoadingLogo } = useWebSettings();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${apiUrl}/api/admin/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        setError(response.data.error || "Failed to send reset email");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Network error. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent dark:from-blue-900/40 dark:via-blue-800/20 dark:to-transparent opacity-40 blur-3xl -mt-32"></div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  We&apos;ve sent a password reset link to {email}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                  If you don&apos;t see the email, check your spam folder or try
                  again.
                </p>
                <Link
                  href="/signin"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent dark:from-blue-900/40 dark:via-blue-800/20 dark:to-transparent opacity-40 blur-3xl -mt-32"></div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/50 via-blue-50/30 to-transparent dark:from-blue-900/20 dark:via-blue-800/10 dark:to-transparent opacity-60"></div>
          <div className="p-8 relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="mb-6 flex items-center justify-center">
                {isLoadingLogo ? (
                  <Store className="w-20 h-20 animate-pulse text-slate-400 dark:text-slate-500" />
                ) : logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                    priority
                  />
                ) : (
                  <Store className="w-20 h-20 text-slate-700 dark:text-slate-300" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 text-center">
                Enter your email address and we&apos;ll send you a link to reset
                your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                />
                {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 dark:from-blue-600 dark:via-blue-500 dark:to-blue-400 dark:hover:from-blue-700 dark:hover:via-blue-600 dark:hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending...</span>
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Remember your password? </span>
              <Link
                href="/signin"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
