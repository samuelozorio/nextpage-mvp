import { ReactNode } from "react";
import { AdminDashboardLayout } from "@/components/admin/layout/admin-dashboard-layout";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
