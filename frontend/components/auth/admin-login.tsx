"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import axios from "axios";
import { useWebSettings } from "@/hooks/useWebSettings";
import { Store } from "lucide-react";

export const AdminLogin = () => {
  const router = useRouter();
  const { logoUrl, isLoading: isLoadingLogo } = useWebSettings();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await axios.post(
          `${apiUrl}/api/admin/auth/login`,
          formData,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          const token = response.data.data.token;
          const user = response.data.data.user;

          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth-refresh"));
          }

          router.replace("/dashboard");
          router.refresh();
        } else {
          setErrors((prev) => ({
            ...prev,
            password: response.data.error || "Login failed",
          }));
        }
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { error?: string } } })?.response
            ?.data?.error || "Network error. Please try again.";

        setErrors((prev) => ({
          ...prev,
          password: errorMessage,
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
                Welcome Back
              </h2>
              <p className="text-center text-slate-600 dark:text-slate-400 mt-2 text-sm">
                Sign in to your admin account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md p-2"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <IconEyeOff size={18} />
                    ) : (
                      <IconEye size={18} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 dark:from-blue-600 dark:via-blue-500 dark:to-blue-400 dark:hover:from-blue-700 dark:hover:via-blue-600 dark:hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setFormData({
                    email: "manoj@mntfuture.com",
                    password: "Admin@123",
                  });
                  setErrors({ email: "", password: "" });
                  
                  setTimeout(() => {
                    setIsLoading(true);
                    const adminFormData = {
                      email: "manoj@mntfuture.com",
                      password: "Admin@123",
                    };

                    (async () => {
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                        const response = await axios.post(
                          `${apiUrl}/api/admin/auth/login`,
                          adminFormData,
                          {
                            withCredentials: true,
                          }
                        );

                        if (response.data.success) {
                          const token = response.data.data.token;
                          const user = response.data.data.user;

                          localStorage.setItem("token", token);
                          localStorage.setItem("user", JSON.stringify(user));

                          if (typeof window !== "undefined") {
                            window.dispatchEvent(new CustomEvent("auth-refresh"));
                          }

                          router.replace("/dashboard");
                          router.refresh();
                        } else {
                          setErrors((prev) => ({
                            ...prev,
                            password: response.data.error || "Login failed",
                          }));
                          setIsLoading(false);
                        }
                      } catch (error: unknown) {
                        const errorMessage =
                          (error as { response?: { data?: { error?: string } } })
                            ?.response?.data?.error || "Network error. Please try again.";

                        setErrors((prev) => ({
                          ...prev,
                          password: errorMessage,
                        }));
                        setIsLoading(false);
                      }
                    })();
                  }, 300);
                }}
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-500 dark:from-emerald-600 dark:via-emerald-500 dark:to-emerald-400 dark:hover:from-emerald-700 dark:hover:via-emerald-600 dark:hover:to-emerald-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isLoading ? "Auto-Login..." : "Auto Login (Demo)"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6">
          © 2024 Your Store. All rights reserved.
        </p>
      </div>
    </div>
  );
};
