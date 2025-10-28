"use client";
import { useEffect, useMemo, useState } from "react";
import { Pacifico } from "next/font/google";
import Scene3D from "@/components/Scene3D";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

function GlowCursor({ enabled = true, variant = "windy" as "windy" | "strong" | "minimal" }) {
	const [mounted, setMounted] = useState(false);
	
	useEffect(() => {
		setMounted(true);
	}, []);
	
	useEffect(() => {
		if (!mounted || !enabled) return;
		const root = document.documentElement;
		root.style.cursor = "none";
		const el = document.createElement("div");
		Object.assign(el.style, {
			position: "fixed",
			inset: "0px",
			pointerEvents: "none",
			zIndex: "9999",
		});
		const dot = document.createElement("div");
		Object.assign(dot.style, {
			position: "fixed",
			width: variant === "minimal" ? "10px" : "24px",
			height: variant === "minimal" ? "10px" : "24px",
			borderRadius: "9999px",
			background: variant === "strong" ? "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,0,0,0) 60%)" : "radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(56,189,248,0) 60%)",
			boxShadow: variant === "strong" ? "0 0 60px 20px rgba(255,255,255,0.35)" : "0 0 80px 30px rgba(56,189,248,0.35)",
			transform: "translate(-50%, -50%)",
		});
		el.appendChild(dot);
		document.body.appendChild(el);
		let x = 0, y = 0, tx = 0, ty = 0;
		const speed = variant === "windy" ? 0.12 : 0.25;
		function onMove(e: MouseEvent) { tx = e.clientX; ty = e.clientY; }
		function raf() {
			x += (tx - x) * speed;
			y += (ty - y) * speed;
			dot.style.left = `${x}px`;
			dot.style.top = `${y}px`;
			id = requestAnimationFrame(raf);
		}
		let id = requestAnimationFrame(raf);
		document.addEventListener("mousemove", onMove);
		return () => {
			root.style.cursor = "auto";
			cancelAnimationFrame(id);
			document.removeEventListener("mousemove", onMove);
			el.remove();
		};
	}, [mounted, enabled, variant]);
	
	if (!mounted) return null;
	return null;
}

export default function Home() {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [isMounted, setIsMounted] = useState(false);
	
	useEffect(() => {
		setIsMounted(true);
		fetch("/api/portfolio").then(r => r.json()).then(setData).finally(() => setLoading(false));
	}, []);

	const showCursor = data?.styles?.showCursor ?? true;
	const cursorVariant = useMemo(() => {
		const c = data?.styles?.cursorStyle || "GLOW_WINDY";
		return c === "GLOW_STRONG" ? "strong" : c === "MINIMAL" ? "minimal" : "windy";
	}, [data]);
	const normalizedDisplayName = useMemo(() => (data?.displayName || "").replace(/\s+/g, " ").trim(), [data?.displayName]);
	const normalizedHeadline = useMemo(() => (data?.headline || "").replace(/\s+/g, " ").trim(), [data?.headline]);
	const headlineLooksLikeLastName = normalizedHeadline !== "" && !normalizedHeadline.includes(" ");
	const fullName = useMemo(() => {
		if (!normalizedDisplayName && !normalizedHeadline) return "";
		if (headlineLooksLikeLastName) {
			return `${normalizedDisplayName} ${normalizedHeadline}`.trim();
		}
		return normalizedDisplayName;
	}, [normalizedDisplayName, normalizedHeadline, headlineLooksLikeLastName]);
	const secondaryHeadline = headlineLooksLikeLastName ? "" : normalizedHeadline;
	const glowName = useMemo(() => fullName.split("").map((char, index) => (
		<span
			key={`${char}-${index}`}
			className="glow-letter"
			style={{ animationDelay: `${index * 0.08}s` }}
		>
			{char === " " ? "\u00A0" : char}
		</span>
	)), [fullName]);

	// Return null on server to avoid hydration mismatch
	if (!isMounted) return null;
	
	if (loading) return <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>Loading…</div>;

	return (
		<div className="relative min-h-screen overflow-hidden" style={{ background: data?.styles?.secondaryColor || "#0b0b0b", color: "white" }} suppressHydrationWarning>
			{isMounted && <Scene3D 
				enabled={data?.styles?.enable3DScene ?? true}
				type={data?.styles?.scene3DType || "ANIMATED_SPHERE"}
				color={data?.styles?.scene3DColor || "#0ea5e9"}
				speed={data?.styles?.scene3DSpeed || 1.0}
			/>}
		{showCursor && <GlowCursor variant={cursorVariant as any} enabled />}
		<div className="relative z-10">
			<main className="mx-auto max-w-5xl min-h-screen flex flex-col items-center justify-center gap-16 py-24">
			<section id="about" className="text-center space-y-4" style={{ textAlign: (data?.styles?.align || "CENTER").toLowerCase() as any }}>
				{fullName && (
					<h1
						className={`${pacifico.className} text-4xl font-bold flex flex-wrap justify-center gap-1`}
						style={{ color: data?.styles?.accentColor || "#22d3ee" }}
					>
						{glowName}
					</h1>
				)}
					{secondaryHeadline && <p className="text-lg opacity-90">{secondaryHeadline}</p>}
					{data?.bio && <p className="max-w-2xl opacity-80">{data.bio}</p>}
				</section>

				<section id="skills" className="w-full">
					<h2 className={`${pacifico.className} text-2xl mb-4`}>Skills</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{(data?.skills || []).map((s: any, i: number) => (
							<div key={i} className="p-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition">
								<div className="flex items-center justify-between">
									<span className="font-medium">{s.name}</span>
									<span className="text-sm opacity-80">{s.level ?? 0}%</span>
								</div>
								<div className="h-2 bg-white/10 rounded mt-2 overflow-hidden">
									<div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, Math.max(0, s.level ?? 0))}%` }} />
								</div>
								{s.description && <p className="mt-2 text-sm opacity-80">{s.description}</p>}
							</div>
						))}
					</div>
				</section>

				<section id="exp" className="w-full">
					<h2 className={`${pacifico.className} text-2xl mb-4`}>Experience</h2>
					<div className="space-y-3">
						{(data?.experiences || []).map((e: any, i: number) => (
							<details key={i} className="p-4 rounded border border-white/10 bg-white/5">
								<summary className="cursor-pointer select-none">
									<span className="font-medium">{e.title}</span>{" "}
									<span className="opacity-80">{e.company}</span>
								</summary>
								{e.description && <p className="mt-2 opacity-90">{e.description}</p>}
							</details>
						))}
					</div>
				</section>
				</main>
			</div>
		</div>
	);
}
