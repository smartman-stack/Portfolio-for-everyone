import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAuthToken, verifyPassword, hashPassword } from "@/lib/auth";
import { z } from "zod";

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export async function POST(req: NextRequest) {
	const json = await req.json().catch(() => null);
	const parsed = LoginSchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}
	const { email, password } = parsed.data;

	// Bootstrap: if no admin exists, create with provided credentials
	const count = await prisma.adminUser.count();
	if (count === 0) {
		const passHash = await hashPassword(password);
		await prisma.adminUser.create({ data: { email, password: passHash } });
	}

	const user = await prisma.adminUser.findUnique({ where: { email } });
	if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	const ok = await verifyPassword(password, user.password);
	if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	const token = signAuthToken({ uid: user.id, email: user.email });
	const res = NextResponse.json({ ok: true });
	res.cookies.set("auth", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
	return res;
}
