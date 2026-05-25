import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.name ?? undefined,
        },
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
