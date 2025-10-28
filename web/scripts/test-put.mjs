const trimU = (value) => {
	if (typeof value !== "string") return value;
	const trimmed = value.trim();
	return trimmed === "" ? undefined : trimmed;
};

const clamp = (value, fallback, min, max) => {
	const n = typeof value === "number" ? value : parseFloat(value);
	if (!Number.isFinite(n)) return fallback;
	let r = n;
	if (typeof min === "number") r = Math.max(min, r);
	if (typeof max === "number") r = Math.min(max, r);
	return r;
};

const allowedSceneTypes = new Set(["ANIMATED_SPHERE", "FLOATING_PARTICLES", "GEOMETRIC_SHAPES", "WAVE_MOTION"]);
const allowedCursor = new Set(["GLOW_WINDY", "GLOW_STRONG", "MINIMAL"]);
const allowedAlign = new Set(["LEFT", "CENTER", "RIGHT"]);

const sanitize = (data) => ({
	...data,
	displayName: (data.displayName ?? "").toString().trim(),
	headline: trimU(data.headline),
	bio: trimU(data.bio),
	styles: data.styles
		? {
			...data.styles,
			primaryColor: trimU(data.styles.primaryColor) ?? "#0ea5e9",
			secondaryColor: trimU(data.styles.secondaryColor) ?? "#111827",
			accentColor: trimU(data.styles.accentColor) ?? "#22d3ee",
			cursorStyle: allowedCursor.has(data.styles.cursorStyle) ? data.styles.cursorStyle : "GLOW_WINDY",
			align: allowedAlign.has(data.styles.align) ? data.styles.align : "CENTER",
			scene3DType: allowedSceneTypes.has(data.styles.scene3DType) ? data.styles.scene3DType : "ANIMATED_SPHERE",
			scene3DColor: trimU(data.styles.scene3DColor) ?? "#0ea5e9",
			scene3DSpeed: clamp(data.styles.scene3DSpeed, 1, 0.1, 5),
			showCursor: Boolean(data.styles.showCursor ?? true),
			enable3DScene: Boolean(data.styles.enable3DScene ?? true),
		}
		: undefined,
	skills: Array.isArray(data.skills)
		? data.skills.map((s) => ({
			name: (s?.name ?? "").toString().trim(),
			description: trimU(s?.description),
			level: clamp(s?.level, 0, 0, 100),
		}))
		: [],
	experiences: Array.isArray(data.experiences)
		? data.experiences.map((e) => ({
			title: (e?.title ?? "").toString().trim(),
			company: trimU(e?.company),
			description: trimU(e?.description),
			startDate: trimU(e?.startDate),
			endDate: trimU(e?.endDate),
		}))
		: [],
});

const main = async () => {
	const res = await fetch("http://localhost:3000/api/portfolio");
	const data = await res.json();
	const payload = sanitize(data);
	const response = await fetch("http://localhost:3000/api/portfolio", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	console.log("PUT status:", response.status);
	const text = await response.text();
	console.log(text);
};

main();

