import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
	// Auth is handled client-side with localStorage
	// No server-side auth checks needed
	return NextResponse.next();
}
