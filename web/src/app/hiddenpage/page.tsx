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
			const isValidUrl = (value?: string | null) => {
				if (!value) return false;
				try {
					const url = new URL(value);
					const hostname = url.hostname;
					const looksLikeIp = /^\d+(?:\.\d+){3}$/.test(hostname);
					const hasDot = hostname.includes(".");
					return Boolean(url.protocol && hostname && (hasDot || looksLikeIp));
				} catch {
					return false;
				}
			};
			const sanitizePortfolio = (p: any) => {
				if (!p) return p;
				const trimOrUndefined = (value?: string | null) => {
					if (typeof value !== "string") return value;
					const trimmed = value.trim();
					return trimmed === "" ? undefined : trimmed;
				};
				return {
					...p,
					displayName: (p.displayName ?? "").toString().trim(),
					headline: trimOrUndefined(p.headline),
					bio: trimOrUndefined(p.bio),
					photoUrl: (() => {
						const trimmed = trimOrUndefined(p.photoUrl);
						return isValidUrl(typeof trimmed === "string" ? trimmed : undefined) ? trimmed : undefined;
					})(),
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
		<div className="min-h-screen p-6 flex flex-col gap-6 bg-white text-black">
			<h1 className={`${pacifico.className} text-2xl font-semibold`}>Admin Editor</h1>
			{error && <p className="text-red-600">{error}</p>}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<section className="space-y-3">
					<h2 className={`${pacifico.className} font-medium`}>Profile</h2>
					<input className="border p-2 w-full" placeholder="Display name" value={portfolio?.displayName || ""} onChange={e => setPortfolio({ ...portfolio, displayName: e.target.value })} />
					<input className="border p-2 w-full" placeholder="Headline" value={portfolio?.headline || ""} onChange={e => setPortfolio({ ...portfolio, headline: e.target.value })} />
					<textarea className="border p-2 w-full" placeholder="Bio" value={portfolio?.bio || ""} onChange={e => setPortfolio({ ...portfolio, bio: e.target.value })} />
					<input className="border p-2 w-full" placeholder="Photo URL" value={portfolio?.photoUrl || ""} onChange={e => setPortfolio({ ...portfolio, photoUrl: e.target.value })} />
				</section>
				<section className="space-y-3">
					<h2 className={`${pacifico.className} font-medium`}>Styles</h2>
					<label className="block">Primary <input type="color" className="ml-2" value={portfolio?.styles?.primaryColor || "#0ea5e9"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, primaryColor: e.target.value } })} /></label>
					<label className="block">Secondary <input type="color" className="ml-2" value={portfolio?.styles?.secondaryColor || "#111827"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, secondaryColor: e.target.value } })} /></label>
					<label className="block">Accent <input type="color" className="ml-2" value={portfolio?.styles?.accentColor || "#22d3ee"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, accentColor: e.target.value } })} /></label>
					<select className="border p-2 w-full" value={portfolio?.styles?.cursorStyle || "GLOW_WINDY"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, cursorStyle: e.target.value } })}>
						<option value="GLOW_WINDY">Glow - Windy</option>
						<option value="GLOW_STRONG">Glow - Strong</option>
						<option value="MINIMAL">Minimal</option>
					</select>
					<label className="inline-flex items-center gap-2"><input type="checkbox" checked={portfolio?.styles?.showCursor ?? true} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, showCursor: e.target.checked } })} /> Show Cursor</label>
					<select className="border p-2 w-full" value={portfolio?.styles?.align || "CENTER"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, align: e.target.value } })}>
						<option value="LEFT">Left</option>
						<option value="CENTER">Center</option>
						<option value="RIGHT">Right</option>
					</select>
					
					<h3 className={`${pacifico.className} font-medium mt-4`}>3D Background Scene</h3>
					<label className="inline-flex items-center gap-2"><input type="checkbox" checked={portfolio?.styles?.enable3DScene ?? true} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, enable3DScene: e.target.checked } })} /> Enable 3D Scene</label>
					<select className="border p-2 w-full" value={portfolio?.styles?.scene3DType || "ANIMATED_SPHERE"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, scene3DType: e.target.value } })}>
						<option value="ANIMATED_SPHERE">Animated Sphere</option>
						<option value="FLOATING_PARTICLES">Floating Particles</option>
						<option value="GEOMETRIC_SHAPES">Geometric Shapes</option>
						<option value="WAVE_MOTION">Wave Motion</option>
					</select>
					<label className="block">3D Scene Color <input type="color" className="ml-2" value={portfolio?.styles?.scene3DColor || "#0ea5e9"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, scene3DColor: e.target.value } })} /></label>
					<label className="block">Animation Speed <input type="range" min="0.1" max="3" step="0.1" className="w-full" value={portfolio?.styles?.scene3DSpeed || 1.0} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, scene3DSpeed: parseFloat(e.target.value) } })} /></label>
				</section>
				<section className="space-y-3 md:col-span-2">
					<h2 className={`${pacifico.className} font-medium`}>Skills</h2>
					<div className="space-y-2">
						{(portfolio?.skills || []).map((s: any, i: number) => (
							<div key={i} className="grid grid-cols-3 gap-2">
								<input className="border p-2" placeholder="Skill" value={s.name} onChange={e => {
									const next = [...portfolio.skills];
									next[i] = { ...next[i], name: e.target.value };
									setPortfolio({ ...portfolio, skills: next });
								}} />
								<input className="border p-2" type="number" placeholder="Level" value={s.level ?? 0} onChange={e => {
									const next = [...portfolio.skills];
									next[i] = { ...next[i], level: Number(e.target.value) };
									setPortfolio({ ...portfolio, skills: next });
								}} />
								<input className="border p-2" placeholder="Description" value={s.description || ""} onChange={e => {
									const next = [...portfolio.skills];
									next[i] = { ...next[i], description: e.target.value };
									setPortfolio({ ...portfolio, skills: next });
								}} />
								<button className="text-red-600" onClick={() => setPortfolio({ ...portfolio, skills: portfolio.skills.filter((_: any, j: number) => j !== i) })}>Remove</button>
							</div>
						))}
						<button className="border px-3 py-1" onClick={() => setPortfolio({ ...portfolio, skills: [...(portfolio?.skills || []), { name: "" }] })}>+ Add Skill</button>
					</div>
				</section>
				<section className="space-y-3 md:col-span-2">
					<h2 className={`${pacifico.className} font-medium`}>Experiences</h2>
					<div className="space-y-2">
						{(portfolio?.experiences || []).map((e: any, i: number) => (
							<div key={i} className="grid grid-cols-5 gap-2">
								<input className="border p-2" placeholder="Title" value={e.title} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], title: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<input className="border p-2" placeholder="Company" value={e.company || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], company: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<input className="border p-2" type="date" value={e.startDate?.slice(0,10) || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], startDate: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<input className="border p-2" type="date" value={e.endDate?.slice(0,10) || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], endDate: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<input className="border p-2" placeholder="Description" value={e.description || ""} onChange={ev => { const next = [...portfolio.experiences]; next[i] = { ...next[i], description: ev.target.value }; setPortfolio({ ...portfolio, experiences: next }); }} />
								<button className="text-red-600" onClick={() => setPortfolio({ ...portfolio, experiences: portfolio.experiences.filter((_: any, j: number) => j !== i) })}>Remove</button>
							</div>
						))}
						<button className="border px-3 py-1" onClick={() => setPortfolio({ ...portfolio, experiences: [...(portfolio?.experiences || []), { title: "" }] })}>+ Add Experience</button>
					</div>
				</section>
			</div>
			<div className="flex gap-3">
				<button disabled={saving} onClick={save} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
				<a href="/" className="border px-4 py-2 rounded">Preview</a>
				<button onClick={() => {
					localStorage.removeItem("adminSession");
					localStorage.removeItem("adminEmail");
					window.location.href = "/login";
				}} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
			</div>
		</div>
	);
}
