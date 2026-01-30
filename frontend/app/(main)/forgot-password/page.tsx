import { AdminForgotPassword } from "@/components/auth/admin-forgot-password";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Admin Portal",
  description: "Reset your admin password",
};

export default function AdminForgotPasswordPage() {
  return <AdminForgotPassword />;
}
