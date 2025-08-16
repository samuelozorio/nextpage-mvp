"use client";

import { Separator } from "@/components/ui/separator";
import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSidebarUserInfo() {
  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <div
      className={
        "flex flex-col items-start pb-8 px-2 text-sm font-medium lg:px-4"
      }
    >
      <Separator
        className={"relative mt-6 dashboard-sidebar-highlight bg-[#283031]"}
      />
      <div className={"flex w-full flex-row mt-6 items-center justify-between"}>
        <div className={"flex items-center gap-2 flex-1"}>
          <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div
            className={
              "flex flex-col items-start justify-center overflow-hidden text-white"
            }
          >
            <div
              className={
                "text-sm leading-5 font-semibold w-full overflow-hidden text-white"
              }
            >
              Admin Master
            </div>
            <div
              className={
                "text-sm leading-5 text-white w-full overflow-hidden text-ellipsis"
              }
            >
              Administrador
            </div>
          </div>
        </div>
        <div>
          <LogOut
            onClick={handleLogout}
            className={"h-6 w-6 text-white cursor-pointer"}
          />
        </div>
      </div>
    </div>
  );
}
