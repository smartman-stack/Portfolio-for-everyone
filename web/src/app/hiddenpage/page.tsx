"use client";
import { useEffect, useState } from "react";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

export default function HiddenAdmin() {
	const [portfolio, setPortfolio] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const cardClass = "rounded-3xl border border-white/10 bg-white/5/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(8,47,73,0.35)]";
	const fieldClass = "w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-300/70 transition";
	const selectClass = `${fieldClass} option-contrast pr-8`;
	const labelClass = "text-xs font-semibold uppercase tracking-[0.3em] text-white/50";
	const toggleClass = "relative inline-flex h-9 w-16 flex-shrink-0 cursor-pointer items-center rounded-full border border-white/10 bg-white/10 transition peer-checked:bg-cyan-500/80";
	const toggleDotClass = "absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow-md transition peer-checked:translate-x-7";

	useEffect(() => {
		setIsMounted(true);
		// Check if user is authenticated via localStorage
		const session = localStorage.getItem("adminSession");
		if (session === "true") {
			setIsAuthenticated(true);
			fetch("/api/portfolio").then(r => r.json()).then(setPortfolio).finally(() => setLoading(false));
		} else {
			// Redirect to login if not authenticated
			window.location.href = "/login";
		}
	}, []);

	async function save() {
		setSaving(true);
		setError(null);
		try {
			const clampNumber = (value: any, fallback: number, min?: number, max?: number) => {
				const n = typeof value === "number" ? value : parseFloat(value);
				if (!Number.isFinite(n)) return fallback;
				let result = n;
				if (typeof min === "number") result = Math.max(min, result);
				if (typeof max === "number") result = Math.min(max, result);
				return result;
			};
			const sanitizePortfolio = (p: any) => {
				if (!p) return p;
				const trimOrUndefined = (value?: string | null) => {
					if (value === undefined || value === null) return undefined;
					if (typeof value !== "string") return value;
					const trimmed = value.trim();
					return trimmed === "" ? undefined : trimmed;
				};
				return {
					...p,
					displayName: (p.displayName ?? "").toString().trim(),
					headline: trimOrUndefined(p.headline),
					bio: trimOrUndefined(p.bio),
					contactEmail: trimOrUndefined(p.contactEmail),
					contactPhone: trimOrUndefined(p.contactPhone),
					contactLocation: trimOrUndefined(p.contactLocation),
					summarySnippets: trimOrUndefined(p.summarySnippets),
					styles: p.styles
						? {
							...p.styles,
							primaryColor: trimOrUndefined(p.styles.primaryColor) ?? "#0ea5e9",
							secondaryColor: trimOrUndefined(p.styles.secondaryColor) ?? "#111827",
							accentColor: trimOrUndefined(p.styles.accentColor) ?? "#22d3ee",
							cursorStyle: ((): "GLOW_WINDY" | "GLOW_STRONG" | "MINIMAL" => {
								const value = p.styles.cursorStyle;
								if (value === "GLOW_STRONG" || value === "MINIMAL" || value === "GLOW_WINDY") return value;
								return "GLOW_WINDY";
							})(),
							align: ((): "LEFT" | "CENTER" | "RIGHT" => {
								const value = p.styles.align;
								if (value === "LEFT" || value === "CENTER" || value === "RIGHT") return value;
								return "CENTER";
							})(),
							scene3DType: ((): "ANIMATED_SPHERE" | "FLOATING_PARTICLES" | "GEOMETRIC_SHAPES" | "WAVE_MOTION" => {
								const value = p.styles.scene3DType;
								if (value === "ANIMATED_SPHERE" || value === "FLOATING_PARTICLES" || value === "GEOMETRIC_SHAPES" || value === "WAVE_MOTION") return value;
								return "ANIMATED_SPHERE";
							})(),
							scene3DColor: trimOrUndefined(p.styles.scene3DColor) ?? "#0ea5e9",
							scene3DSpeed: clampNumber(p.styles.scene3DSpeed, 1, 0.1, 5),
							showCursor: Boolean(p.styles.showCursor ?? true),
							enable3DScene: Boolean(p.styles.enable3DScene ?? true),
						}
						: undefined,
					skills: Array.isArray(p.skills)
						? p.skills.map((s: any) => ({
							name: (s?.name ?? "").toString().trim(),
							description: trimOrUndefined(s?.description),
							level: clampNumber(s?.level, 0, 0, 100),
						}))
						: [],
					experiences: Array.isArray(p.experiences)
						? p.experiences.map((e: any) => ({
							title: (e?.title ?? "").toString().trim(),
							company: trimOrUndefined(e?.company),
							description: trimOrUndefined(e?.description),
							startDate: trimOrUndefined(e?.startDate),
							endDate: trimOrUndefined(e?.endDate),
						}))
						: [],
				};
			};
			const payload = sanitizePortfolio(portfolio);
			const res = await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
			if (!res.ok) {
				const errorPayload = await res.json().catch(() => null);
				throw new Error(errorPayload?.error || "Failed to save");
			}
			const data = await res.json();
			setPortfolio(data);
		} catch (e: any) {
			setError(e.message || "Failed to save");
		} finally {
			setSaving(false);
		}
	}

	// Only render after mounting to avoid hydration errors
	if (!isMounted) return null;
	if (!isAuthenticated) return <div className="p-6">Redirecting to login...</div>;
	if (loading) return <div className="p-6">Loading…</div>;
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
			<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 pb-14 pt-10">
				<header className="flex flex-col gap-3">
					<h1 className={`${pacifico.className} text-3xl font-semibold text-white drop-shadow-[0_8px_18px_rgba(14,165,233,0.4)]`}>Admin Editor</h1>
					<p className="text-sm text-white/60">Craft and preview your portfolio experience in real time.</p>
				</header>
				{error && <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 shadow-[0_12px_30px_rgba(225,29,72,0.25)]">{error}</p>}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
					<section className={`${cardClass} p-6 space-y-5`}>
						<div className="space-y-2">
							<p className={labelClass}>Profile</p>
							<h2 className={`${pacifico.className} text-xl`}>Identity</h2>
						</div>
						<div className="space-y-4">
							<input className={fieldClass} placeholder="Display name" value={portfolio?.displayName || ""} onChange={e => setPortfolio({ ...portfolio, displayName: e.target.value })} />
							<input className={fieldClass} placeholder="Headline" value={portfolio?.headline || ""} onChange={e => setPortfolio({ ...portfolio, headline: e.target.value })} />
							<textarea className={`${fieldClass} min-h-[140px] resize-none`} placeholder="Bio" value={portfolio?.bio || ""} onChange={e => setPortfolio({ ...portfolio, bio: e.target.value })} />
						<div className="grid gap-3 sm:grid-cols-3">
							<input className={fieldClass} placeholder="Contact email" value={portfolio?.contactEmail || ""} onChange={e => setPortfolio({ ...portfolio, contactEmail: e.target.value })} />
							<input className={fieldClass} placeholder="Contact phone" value={portfolio?.contactPhone || ""} onChange={e => setPortfolio({ ...portfolio, contactPhone: e.target.value })} />
							<input className={fieldClass} placeholder="Location" value={portfolio?.contactLocation || ""} onChange={e => setPortfolio({ ...portfolio, contactLocation: e.target.value })} />
						</div>
							<textarea className={`${fieldClass} min-h-[120px]`} placeholder={`Intro phrases (one per line)${"\n"}Example:${"\n"}Full-stack engineer${"\n"}AI enthusiast${"\n"}Open-source maintainer`} value={portfolio?.summarySnippets || ""} onChange={e => setPortfolio({ ...portfolio, summarySnippets: e.target.value })} />
						</div>
					</section>
					<section className={`${cardClass} p-6 space-y-5`}>
						<div className="space-y-2">
							<p className={labelClass}>Styles</p>
							<h2 className={`${pacifico.className} text-xl`}>Visual System</h2>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<p className="text-xs text-white/60">Primary Color</p>
								<input type="color" className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-1" value={portfolio?.styles?.primaryColor || "#0ea5e9"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, primaryColor: e.target.value } })} />
							</div>
							<div className="space-y-2">
								<p className="text-xs text-white/60">Secondary Color</p>
								<input type="color" className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-1" value={portfolio?.styles?.secondaryColor || "#111827"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, secondaryColor: e.target.value } })} />
							</div>
							<div className="space-y-2">
								<p className="text-xs text-white/60">Accent Color</p>
								<input type="color" className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-1" value={portfolio?.styles?.accentColor || "#22d3ee"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, accentColor: e.target.value } })} />
							</div>
							<div className="space-y-2">
								<p className="text-xs text-white/60">Layout Alignment</p>
							<select className={selectClass} value={portfolio?.styles?.align || "CENTER"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, align: e.target.value } })}>
									<option value="LEFT">Left</option>
									<option value="CENTER">Center</option>
									<option value="RIGHT">Right</option>
								</select>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<p className="text-xs text-white/60">Cursor Style</p>
							<select className={selectClass} value={portfolio?.styles?.cursorStyle || "GLOW_WINDY"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, cursorStyle: e.target.value } })}>
									<option value="GLOW_WINDY">Glow - Windy</option>
									<option value="GLOW_STRONG">Glow - Strong</option>
									<option value="MINIMAL">Minimal</option>
								</select>
							</div>
							<div className="space-y-2">
								<p className="text-xs text-white/60">Show Cursor</p>
								<label className="flex items-center gap-3 text-sm text-white/70">
									<input type="checkbox" className="peer sr-only" checked={portfolio?.styles?.showCursor ?? true} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, showCursor: e.target.checked } })} />
									<span className={toggleClass}>
										<span className={toggleDotClass} />
									</span>
									<span>Visible</span>
								</label>
							</div>
						</div>
						<div className="space-y-2">
							<p className={labelClass}>3D Background</p>
							<h3 className={`${pacifico.className} text-lg`}>Scene Configuration</h3>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<p className="text-xs text-white/60">Scene Type</p>
								<select className={selectClass} value={portfolio?.styles?.scene3DType || "ANIMATED_SPHERE"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, scene3DType: e.target.value } })}>
									<option value="ANIMATED_SPHERE">Animated Sphere</option>
									<option value="FLOATING_PARTICLES">Floating Particles</option>
									<option value="GEOMETRIC_SHAPES">Geometric Shapes</option>
									<option value="WAVE_MOTION">Wave Motion</option>
								</select>
							</div>
							<div className="space-y-2">
								<p className="text-xs text-white/60">Enable Scene</p>
								<label className="flex items-center gap-3 text-sm text-white/70">
									<input type="checkbox" className="peer sr-only" checked={portfolio?.styles?.enable3DScene ?? true} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, enable3DScene: e.target.checked } })} />
									<span className={toggleClass}>
										<span className={toggleDotClass} />
									</span>
									<span>Active</span>
								</label>
							</div>
							<div className="space-y-2">
								<p className="text-xs text-white/60">Scene Color</p>
								<input type="color" className="h-12 w-full cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-1" value={portfolio?.styles?.scene3DColor || "#0ea5e9"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, scene3DColor: e.target.value } })} />
							</div>
							<div className="space-y-2">
								<p className="text-xs text-white/60">Animation Speed</p>
								<input type="range" min="0.1" max="3" step="0.1" className="h-2 w-full cursor-pointer accent-cyan-400" value={portfolio?.styles?.scene3DSpeed || 1.0} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, scene3DSpeed: parseFloat(e.target.value) } })} />
							</div>
						</div>
					</section>
				</div>
				<section className={`${cardClass} p-6 space-y-5`}>
					<div className="space-y-2">
						<p className={labelClass}>Skills</p>
						<h2 className={`${pacifico.className} text-xl`}>Capabilities</h2>
					</div>
					<div className="space-y-4">
						{(portfolio?.skills || []).map((s: any, i: number) => (
							<div key={i} className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_1fr_auto]">
								<input className={fieldClass} placeholder="Skill name" value={s.name} onChange={e => {
									const next = [...portfolio.skills];
									next[i] = { ...next[i], name: e.target.value };
									setPortfolio({ ...portfolio, skills: next });
								}} />
								<input className={fieldClass} type="number" placeholder="Level" value={s.level ?? 0} onChange={e => {
									const next = [...portfolio.skills];
									next[i] = { ...next[i], level: Number(e.target.value) };
									setPortfolio({ ...portfolio, skills: next });
								}} />
								<input className={fieldClass} placeholder="Description" value={s.description || ""} onChange={e => {
									const next = [...portfolio.skills];
									next[i] = { ...next[i], description: e.target.value };
									setPortfolio({ ...portfolio, skills: next });
								}} />
								<button className="rounded-full border border-rose-500/40 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/15" onClick={() => setPortfolio({ ...portfolio, skills: portfolio.skills.filter((_: any, j: number) => j !== i) })}>Remove</button>
							</div>
						))}
						<button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300/60 hover:bg-cyan-500/20" onClick={() => setPortfolio({ ...portfolio, skills: [...(portfolio?.skills || []), { name: "" }] })}>+ Add Skill</button>
					</div>
				</section>
				<section className={`${cardClass} p-6 space-y-5`}>
					<div className="space-y-2">
						<p className={labelClass}>Experience</p>
						<h2 className={`${pacifico.className} text-xl`}>Career Timeline</h2>
					</div>
					<div className="space-y-4">
						{(portfolio?.experiences || []).map((e: any, i: number) => (
							<div key={i} className="grid gap-3 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr]">
								<input className={fieldClass} placeholder="Role" value={e.title} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], title: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<input className={fieldClass} placeholder="Company" value={e.company || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], company: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<input className={fieldClass} type="date" value={e.startDate?.slice(0,10) || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], startDate: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<input className={fieldClass} type="date" value={e.endDate?.slice(0,10) || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], endDate: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<textarea className={`${fieldClass} min-h-[120px] lg:col-span-4`} placeholder="Highlights" value={e.description || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], description: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<div className="flex items-center lg:col-span-4">
									<button className="ml-auto rounded-full border border-rose-500/40 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/15" onClick={() => setPortfolio({ ...portfolio, experiences: portfolio.experiences.filter((_: any, j: number) => j !== i) })}>Remove</button>
								</div>
							</div>
						))}
						<button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-300/60 hover:bg-cyan-500/20" onClick={() => setPortfolio({ ...portfolio, experiences: [...(portfolio?.experiences || []), { title: "" }] })}>+ Add Experience</button>
					</div>
				</section>
				<footer className="mt-2 flex flex-wrap items-center gap-4">
					<button disabled={saving} onClick={save} className="rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(6,182,212,0.35)] transition hover:scale-[1.02] disabled:scale-100 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
					<a href="/" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-cyan-300/70 hover:text-cyan-200">Preview</a>
					<button onClick={() => {
						localStorage.removeItem("adminSession");
						localStorage.removeItem("adminEmail");
						window.location.href = "/login";
					}} className="rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(225,29,72,0.35)] transition hover:scale-[1.02]">Logout</button>
				</footer>
			</div>
		</div>
	);
}
