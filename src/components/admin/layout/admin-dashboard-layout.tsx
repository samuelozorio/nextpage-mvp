import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import "@/styles/dashboard.css";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminSidebarUserInfo } from "@/components/admin/layout/admin-sidebar-user-info";
import { Separator } from "@/components/ui/separator";

interface Props {
  children: ReactNode;
}

export function AdminDashboardLayout({ children }: Props) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative overflow-hidden bg-[#0f0f0f]">
      <div className="hidden border-r border-[#283031] md:block relative bg-[#0f0f0f]">
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center pt-8 pl-6">
            <div className="flex items-center gap-2 font-semibol">
              <div className="w-10 h-10 bg-white rounded-full p-2 flex items-center justify-center">
                <span className="text-muted-foreground font-bold">A</span>
              </div>
              <span className="text-white">Admin</span>
            </div>
          </div>
          <Separator
            className={"relative mt-6 dashboard-sidebar-highlight bg-[#283031]"}
          />
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
