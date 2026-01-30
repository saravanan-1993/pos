import { AdminResetPassword } from "@/components/auth/admin-reset-password";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Admin Portal",
  description: "Create a new password for your admin account",
};

export default function AdminResetPasswordPage() {
  return <AdminResetPassword />;
}
