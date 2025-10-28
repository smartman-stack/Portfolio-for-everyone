require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
	const email = process.env.ADMIN_EMAIL || 'admin@example.com';
	const password = process.env.ADMIN_PASSWORD || 'admin123';
	const hash = await bcrypt.hash(password, 10);
	await prisma.adminUser.upsert({ where: { email }, update: {}, create: { email, password: hash } });
	const existing = await prisma.portfolio.findFirst();
	if (!existing) {
		await prisma.portfolio.create({ data: { displayName: 'Your Name', headline: 'Your headline' } });
	}
	console.log('Seed complete. Admin:', email);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
}).finally(async () => {
	await prisma.$disconnect();
});
