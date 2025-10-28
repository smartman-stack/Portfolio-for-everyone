import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
	const token = req.cookies.get("auth")?.value;
	const session = token ? verifyAuthToken(token) : null;
	
	return NextResponse.json({
		hasToken: !!token,
		hasSession: !!session,
		session: session,
		tokenLength: token?.length || 0,
		cookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
	});
}
