import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { DashboardGradient } from "@/components/gradients/dashboard-gradient";
import "@/styles/dashboard.css";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminSidebarUserInfo } from "@/components/admin/layout/admin-sidebar-user-info";

interface Props {
  children: ReactNode;
}

export function AdminDashboardLayout({ children }: Props) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative overflow-hidden bg-[#0f0f0f]">
      <DashboardGradient />
      <div className="hidden border-r border-[#283031] md:block relative bg-[#0f0f0f]">
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center pt-8 pl-6 pb-10">
            <div className="flex items-center gap-2 font-semibold text-white">
              <div className="w-10 h-10 bg-destructive rounded-lg flex items-center justify-center">
                <span className="text-destructive-foreground font-bold">A</span>
              </div>
              <span>Admin</span>
            </div>
          </div>
          <div className="flex flex-col grow">
            <AdminSidebar />
            <AdminSidebarUserInfo />
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-[#0f0f0f] text-white">{children}</div>
    </div>
  );
}
