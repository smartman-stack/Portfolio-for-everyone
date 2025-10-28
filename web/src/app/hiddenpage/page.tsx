"use client";
import { useEffect, useState } from "react";

export default function HiddenAdmin() {
	const [portfolio, setPortfolio] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("/api/portfolio").then(r => r.json()).then(setPortfolio).finally(() => setLoading(false));
	}, []);

	async function save() {
		setSaving(true);
		setError(null);
		try {
			const res = await fetch("/api/portfolio", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(portfolio) });
			if (!res.ok) throw new Error("Failed to save");
			const data = await res.json();
			setPortfolio(data);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setSaving(false);
		}
	}

	if (loading) return <div className="p-6">Loading…</div>;
	return (
		<div className="min-h-screen p-6 flex flex-col gap-6 bg-white text-black">
			<h1 className="text-2xl font-semibold">Admin Editor</h1>
			{error && <p className="text-red-600">{error}</p>}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<section className="space-y-3">
					<h2 className="font-medium">Profile</h2>
					<input className="border p-2 w-full" placeholder="Display name" value={portfolio?.displayName || ""} onChange={e => setPortfolio({ ...portfolio, displayName: e.target.value })} />
					<input className="border p-2 w-full" placeholder="Headline" value={portfolio?.headline || ""} onChange={e => setPortfolio({ ...portfolio, headline: e.target.value })} />
					<textarea className="border p-2 w-full" placeholder="Bio" value={portfolio?.bio || ""} onChange={e => setPortfolio({ ...portfolio, bio: e.target.value })} />
					<input className="border p-2 w-full" placeholder="Photo URL" value={portfolio?.photoUrl || ""} onChange={e => setPortfolio({ ...portfolio, photoUrl: e.target.value })} />
				</section>
				<section className="space-y-3">
					<h2 className="font-medium">Styles</h2>
					<select className="border p-2 w-full" value={portfolio?.styles?.navbarOrientation || "HORIZONTAL"} onChange={e => setPortfolio({ ...portfolio, styles: { ...portfolio?.styles, navbarOrientation: e.target.value } })}>
						<option value="HORIZONTAL">Horizontal</option>
						<option value="VERTICAL">Vertical</option>
					</select>
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
				</section>
				<section className="space-y-3 md:col-span-2">
					<h2 className="font-medium">Skills</h2>
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
					<h2 className="font-medium">Experiences</h2>
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
			</div>
		</div>
	);
}
