"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
  isVerified?: boolean;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  currency?: string;
  companyName?: string;
  gstNumber?: string;
}

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag immediately
    setIsClient(true);
    
    const checkAuth = async () => {
      try {
        // Ensure we're on the client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        // Don't redirect on root path
        const isRootPath = window.location.pathname === "/";
        
        if (!token || !userData) {
          if (requireAuth && !isRootPath) {
            router.push("/signin");
          }
          setIsLoading(false);
          return;
        }

        // Validate token expiry
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp <= currentTime) {
            // Token expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
            if (requireAuth && !isRootPath) {
              router.push("/signin");
            }
            setIsLoading(false);
            return;
          }
        } catch {
          // Invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          if (requireAuth && !isRootPath) {
            router.push("/signin");
          }
          setIsLoading(false);
          return;
        }

        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (parseError) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          if (requireAuth && !isRootPath) {
            router.push("/signin");
          }
        }
      } catch (error) {
        if (requireAuth) {
          router.push("/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth failures from axios interceptor
    const handleAuthFailure = () => {
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
        router.push('/signin');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-failure', handleAuthFailure);
    }

    checkAuth();

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-failure', handleAuthFailure);
      }
    };
  }, [router, requireAuth]);

  const logout = async () => {
    try {
      // Call backend logout - use admin endpoint if admin
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const logoutEndpoint = user?.role === 'admin' 
          ? '/api/admin/auth/logout' 
          : '/api/auth/logout';
        await axios.post(`${apiUrl}${logoutEndpoint}`, {}, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        // Silent - continue with logout
      }
      
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate based on role
      if (typeof window !== 'undefined') {
        const redirectPath = user?.role === 'admin' ? '/signin' : '/';
        if (window.location.pathname !== redirectPath) {
          router.push(redirectPath);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
      
    } catch (error) {
      // Even if error, clear state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Navigate based on role on error
      if (typeof window !== 'undefined') {
        const redirectPath = user?.role === 'admin' ? '/signin' : '/';
        router.push(redirectPath);
        // Refresh the page after 1 second even on error
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    // Redirect based on role
    if (userData.role === 'admin') {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  return {
    user: isClient ? user : null,
    isLoading,
    isAuthenticated: isClient ? isAuthenticated : false,
    logout,
    login,
    updateUser,
    isAdmin,
    isUser
  };
};
