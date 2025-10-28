"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Scene3D from "@/components/Scene3D";

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
	useEffect(() => {
		fetch("/api/portfolio").then(r => r.json()).then(setData).finally(() => setLoading(false));
	}, []);

	const navbarVertical = data?.styles?.navbarOrientation === "VERTICAL";
	const showCursor = data?.styles?.showCursor ?? true;
	const cursorVariant = useMemo(() => {
		const c = data?.styles?.cursorStyle || "GLOW_WINDY";
		return c === "GLOW_STRONG" ? "strong" : c === "MINIMAL" ? "minimal" : "windy";
	}, [data]);

	if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

	return (
		<div className="min-h-screen overflow-hidden" style={{ background: data?.styles?.secondaryColor || "#0b0b0b", color: "white" }}>
			<Scene3D 
				enabled={data?.styles?.enable3DScene ?? true}
				type={data?.styles?.scene3DType || "ANIMATED_SPHERE"}
				color={data?.styles?.scene3DColor || "#0ea5e9"}
				speed={data?.styles?.scene3DSpeed || 1.0}
			/>
			{showCursor && <GlowCursor variant={cursorVariant as any} enabled />}
			<nav className={`${navbarVertical ? "fixed left-0 top-0 h-screen w-20" : "w-full h-16"} flex items-center justify-center`} style={{ background: data?.styles?.primaryColor || "#0ea5e9" }}>
				<ul className={`${navbarVertical ? "flex flex-col gap-4" : "flex gap-6"}`}>
					<li><a href="#about">About</a></li>
					<li><a href="#skills">Skills</a></li>
					<li><a href="#exp">Experience</a></li>
				</ul>
			</nav>
			<main className={`mx-auto ${navbarVertical ? "pl-24" : "pt-16"} max-w-5xl min-h-screen flex flex-col items-center justify-center gap-16`}>
				<section id="about" className="text-center space-y-4" style={{ textAlign: (data?.styles?.align || "CENTER").toLowerCase() as any }}>
					{data?.photoUrl ? (
						<div className="w-40 h-40 relative rounded-full overflow-hidden ring-2 ring-white/30">
							<Image src={data.photoUrl} alt={data.displayName} fill sizes="160px" style={{ objectFit: "cover" }} />
						</div>
					) : null}
					<h1 className="text-4xl font-bold" style={{ color: data?.styles?.accentColor || "#22d3ee" }}>{data?.displayName}</h1>
					{data?.headline && <p className="text-lg opacity-90">{data.headline}</p>}
					{data?.bio && <p className="max-w-2xl opacity-80">{data.bio}</p>}
				</section>

				<section id="skills" className="w-full">
					<h2 className="text-2xl mb-4">Skills</h2>
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
					<h2 className="text-2xl mb-4">Experience</h2>
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
	);
}
