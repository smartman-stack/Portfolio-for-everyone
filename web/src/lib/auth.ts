import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me-12345";

export type JwtPayload = { uid: number; email: string };

export function signAuthToken(payload: JwtPayload): string {
	return jwt.sign(payload, AUTH_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): JwtPayload | null {
	try {
		console.log("Verifying token:", { tokenLength: token.length, secretLength: AUTH_SECRET.length });
		const result = jwt.verify(token, AUTH_SECRET) as JwtPayload;
		console.log("Token verification successful:", result);
		return result;
	} catch (error) {
		console.log("Token verification failed:", error);
		return null;
	}
}

export async function hashPassword(plain: string): Promise<string> {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}
