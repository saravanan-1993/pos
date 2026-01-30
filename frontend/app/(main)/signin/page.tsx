import { AdminLogin } from "@/components/auth/admin-login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | E-Commerce",
  description: "Admin login portal for e-commerce management system",
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}