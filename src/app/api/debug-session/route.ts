import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log(
      "🔍 Debug - Sessão completa:",
      JSON.stringify(session, null, 2)
    );

    return NextResponse.json({
      hasSession: !!session,
      session: session,
      user: session?.user,
      role: session?.user?.role,
      isAdminMaster: session?.user?.role === "ADMIN_MASTER",
    });
  } catch (error) {
    console.error("❌ Erro ao verificar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao verificar sessão" },
      { status: 500 }
    );
  }
}
