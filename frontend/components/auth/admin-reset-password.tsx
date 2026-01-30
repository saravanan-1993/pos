"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useWebSettings } from "@/hooks/useWebSettings";
import { Store } from "lucide-react";

function AdminResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logoUrl, isLoading: isLoadingLogo } = useWebSettings();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      router.push("/admin/login");
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      password: "",
      confirmPassword: "",
    };

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${apiUrl}/api/admin/auth/reset-password`,
        {
          token,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => router.push("/signin"), 3000);
      } else {
        setErrors((prev) => ({
          ...prev,
          password: response.data.error || "Failed to reset password",
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Network error. Please try again.";

      setErrors((prev) => ({
        ...prev,
        password: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-200 via-blue-100 to-transparent dark:from-blue-900/40 dark:via-blue-800/20 dark:to-transparent opacity-40 blur-3xl -mt-32"></div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Password Reset Successful
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Your password has been successfully reset. You will be redirected
                  to the sign-in page.
                </p>
                <Link
                  href="/signin"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Go to Sign In
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 text-center">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter new password (8+ chars)"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                />
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{errors.password}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Must contain uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 dark:from-blue-600 dark:via-blue-500 dark:to-blue-400 dark:hover:from-blue-700 dark:hover:via-blue-600 dark:hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm">
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

export function AdminResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <AdminResetPasswordContent />
    </Suspense>
  );
}
