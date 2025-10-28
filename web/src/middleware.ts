import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
	const token = req.cookies.get("auth")?.value;
	const session = token ? verifyAuthToken(token) : null;
	const url = req.nextUrl;
	// Protect /hiddenpage (admin)
	if (url.pathname.startsWith("/hiddenpage")) {
		if (!session) {
			url.pathname = "/";
			return NextResponse.redirect(url);
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/hiddenpage/:path*"],
};
