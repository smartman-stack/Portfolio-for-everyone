import { PrismaClient } from "@/generated/prisma";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

async function main() {
	const email = process.env.ADMIN_EMAIL || "admin@example.com";
	const password = process.env.ADMIN_PASSWORD || "admin123";
	const hash = await hashPassword(password);
	await prisma.adminUser.upsert({ where: { email }, update: {}, create: { email, password: hash } });
	const existing = await prisma.portfolio.findFirst();
	if (!existing) {
		await prisma.portfolio.create({ data: { displayName: "Your Name", headline: "Your headline" } });
	}
	console.log("Seed complete. Admin:", email);
}

main().finally(async () => { await prisma.$disconnect(); });
