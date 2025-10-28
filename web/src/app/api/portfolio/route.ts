import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const StyleSettingsSchema = z.object({
	navbarOrientation: z.enum(["HORIZONTAL", "VERTICAL"]).optional(),
	primaryColor: z.string().optional(),
	secondaryColor: z.string().optional(),
	accentColor: z.string().optional(),
	cursorStyle: z.enum(["GLOW_WINDY", "GLOW_STRONG", "MINIMAL"]).optional(),
	showCursor: z.boolean().optional(),
	align: z.enum(["LEFT", "CENTER", "RIGHT"]).optional(),
	enable3DScene: z.boolean().optional(),
	scene3DType: z.enum(["ANIMATED_SPHERE", "FLOATING_PARTICLES", "GEOMETRIC_SHAPES", "WAVE_MOTION"]).optional(),
	scene3DColor: z.string().optional(),
	scene3DSpeed: z.number().optional(),
});

const SkillSchema = z.object({ id: z.number().optional(), name: z.string(), level: z.number().min(0).max(100).optional(), description: z.string().optional() });
const ExperienceSchema = z.object({ id: z.number().optional(), title: z.string(), company: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), description: z.string().optional() });

const PortfolioSchema = z.object({
	id: z.number().optional(),
	displayName: z.string(),
	headline: z.string().optional(),
	bio: z.string().optional(),
	contactEmail: z.string().optional(),
	contactPhone: z.string().optional(),
	contactLocation: z.string().optional(),
	skills: z.array(SkillSchema).default([]),
	experiences: z.array(ExperienceSchema).default([]),
	styles: StyleSettingsSchema.optional(),
});

export async function GET() {
	let portfolio = await prisma.portfolio.findFirst({
		include: { skills: true, experiences: true, styles: true },
	});
	if (!portfolio) {
		portfolio = await prisma.portfolio.create({
			data: { displayName: "Your Name", headline: "Your headline" },
			include: { skills: true, experiences: true, styles: true },
		});
	}
	return NextResponse.json(portfolio);
}

export async function PUT(req: NextRequest) {
	const json = await req.json().catch(() => null);
	const parsed = PortfolioSchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json({
			error: "Invalid payload",
			details: parsed.error.flatten(),
		}, { status: 400 });
	}
	const data = parsed.data;
	// Upsert portfolio
	const existing = await prisma.portfolio.findFirst();
	let updated = await prisma.portfolio.upsert({
		where: { id: existing?.id ?? 0 },
		create: {
			displayName: data.displayName,
			headline: data.headline,
			bio: data.bio,
			contactEmail: data.contactEmail,
			contactPhone: data.contactPhone,
			contactLocation: data.contactLocation,
			skills: { create: data.skills?.map(s => ({ name: s.name, level: s.level, description: s.description })) ?? [] },
			experiences: { create: data.experiences?.map(e => ({ title: e.title, company: e.company, description: e.description, startDate: e.startDate ? new Date(e.startDate) : undefined, endDate: e.endDate ? new Date(e.endDate) : undefined })) ?? [] },
			styles: data.styles ? { create: data.styles } : undefined,
		},
		update: {
			displayName: data.displayName,
			headline: data.headline,
			bio: data.bio,
			contactEmail: data.contactEmail,
			contactPhone: data.contactPhone,
			contactLocation: data.contactLocation,
			skills: {
				deleteMany: {},
				create: data.skills?.map(s => ({ name: s.name, level: s.level, description: s.description })) ?? [],
			},
			experiences: {
				deleteMany: {},
				create: data.experiences?.map(e => ({ title: e.title, company: e.company, description: e.description, startDate: e.startDate ? new Date(e.startDate) : undefined, endDate: e.endDate ? new Date(e.endDate) : undefined })) ?? [],
			},
			styles: data.styles ? { upsert: { update: data.styles, create: data.styles } } : undefined,
		},
		include: { skills: true, experiences: true, styles: true },
	});
	return NextResponse.json(updated);
}
