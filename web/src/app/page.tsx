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
		const container = document.createElement("div");
		Object.assign(container.style, {
			position: "fixed",
			inset: "0px",
			pointerEvents: "none",
			zIndex: "9999",
			overflow: "hidden",
		});
		const trailCount = variant === "minimal" ? 8 : variant === "strong" ? 18 : 14;
		const baseColors = {
			windy: ["rgba(255,214,102,0.9)", "rgba(255,147,74,0.65)", "rgba(255,80,22,0.25)"],
			strong: ["rgba(255,252,210,0.95)", "rgba(255,188,102,0.7)", "rgba(255,99,72,0.3)"],
			minimal: ["rgba(252,211,77,0.8)", "rgba(253,186,116,0.4)", "rgba(255,255,255,0.2)"],
		};
		const colors = baseColors[variant] ?? baseColors.windy;
		const dots = Array.from({ length: trailCount }, () => {
			const dot = document.createElement("div");
			const size = variant === "minimal" ? 10 : 18;
			Object.assign(dot.style, {
				position: "fixed",
				width: `${size}px`,
				height: `${size}px`,
				borderRadius: "9999px",
				left: "-100px",
				top: "-100px",
				pointerEvents: "none",
				background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
				boxShadow: "0 0 25px rgba(255, 170, 64, 0.55)",
				mixBlendMode: "screen",
				transform: "translate3d(-50%, -50%, 0)",
			});
			container.appendChild(dot);
			return dot;
		});
		document.body.appendChild(container);
		const positions = Array.from({ length: trailCount }, () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
		const mouse = { x: positions[0].x, y: positions[0].y };
		const onMove = (e: MouseEvent) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		};
		document.addEventListener("mousemove", onMove);
		const baseEase = variant === "minimal" ? 0.25 : 0.18;
		const followEase = variant === "strong" ? 0.45 : 0.38;
		let rafId = 0;
		const animate = () => {
			positions[0].x += (mouse.x - positions[0].x) * baseEase;
			positions[0].y += (mouse.y - positions[0].y) * baseEase;
			for (let i = 1; i < trailCount; i++) {
				const previous = positions[i - 1];
				positions[i].x += (previous.x - positions[i].x) * followEase;
				positions[i].y += (previous.y - positions[i].y) * followEase;
			}
			dots.forEach((dot, index) => {
				const pos = positions[index];
				const scale = Math.max(0.2, 1 - index / (trailCount * 1.15));
				dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
				dot.style.opacity = `${Math.max(0.15, 1 - index / (trailCount * 1.1))}`;
			});
			rafId = requestAnimationFrame(animate);
		};
		rafId = requestAnimationFrame(animate);
		return () => {
			root.style.cursor = "auto";
			cancelAnimationFrame(rafId);
			document.removeEventListener("mousemove", onMove);
			container.remove();
		};
	}, [mounted, enabled, variant]);
	
	if (!mounted) return null;
	return null;
}

export default function Home() {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [isMounted, setIsMounted] = useState(false);
	const [typedName, setTypedName] = useState("");
	const [summaryText, setSummaryText] = useState("");
	const [summaryPhraseIndex, setSummaryPhraseIndex] = useState(0);
	const [summaryLetterIndex, setSummaryLetterIndex] = useState(0);
	const [summaryDeleting, setSummaryDeleting] = useState(false);
	
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
	const displayName = isMounted ? typedName : fullName;
	const glowName = useMemo(() => displayName.split("").map((char, index) => (
		<span
			key={`${char}-${index}`}
			className="glow-letter"
			style={{ animationDelay: `${index * 0.08}s` }}
		>
			{char === " " ? "\u00A0" : char}
		</span>
	)), [displayName]);
	const contactDetails = useMemo(() => {
		const entries: { label: string; value: string }[] = [];
		if (data?.contactEmail) entries.push({ label: "Email", value: data.contactEmail });
		if (data?.contactPhone) entries.push({ label: "Phone", value: data.contactPhone });
		if (data?.contactLocation) entries.push({ label: "Location", value: data.contactLocation });
		return entries;
	}, [data?.contactEmail, data?.contactPhone, data?.contactLocation]);
	const summaryPhrases = useMemo(() => {
		const phrases: string[] = [];
		if (data?.headline) phrases.push(data.headline.trim());
		if (data?.bio) {
			const bioSegments = data.bio.split(/\n|\.|•|-/g).map(segment => segment.trim()).filter(Boolean);
			phrases.push(...bioSegments);
		}
		(data?.experiences || []).forEach((exp: any) => {
			if (exp?.title) {
				phrases.push(`${exp.title}${exp?.company ? ` @ ${exp.company}` : ""}`.trim());
			}
		});
		const unique = Array.from(new Set(phrases.filter(Boolean)));
		return unique.length ? unique : ["a fullstack engineer", "building immersive digital experiences", "pushing the web forward"];
	}, [data?.headline, data?.bio, data?.experiences]);

	useEffect(() => {
		if (!isMounted) return;
		if (!fullName) {
			setTypedName("");
			return;
		}
		let index = 0;
		let timeout: ReturnType<typeof setTimeout>;
		setTypedName("");
		const typeNext = () => {
			setTypedName(fullName.slice(0, index + 1));
			index += 1;
			if (index < fullName.length) {
				timeout = setTimeout(typeNext, 85);
			}
		};
		timeout = setTimeout(typeNext, 100);
		return () => clearTimeout(timeout);
	}, [fullName, isMounted]);

	useEffect(() => {
		setSummaryPhraseIndex(0);
		setSummaryLetterIndex(0);
		setSummaryDeleting(false);
		setSummaryText(summaryPhrases[0] ?? "");
	}, [summaryPhrases]);

	useEffect(() => {
		if (!isMounted || summaryPhrases.length === 0) return;
		const currentPhrase = summaryPhrases[summaryPhraseIndex % summaryPhrases.length] ?? "";
		const clampedLetters = Math.min(summaryLetterIndex, currentPhrase.length);
		setSummaryText(currentPhrase.slice(0, clampedLetters));
		let timeout: ReturnType<typeof setTimeout> | undefined;
		if (!summaryDeleting) {
			if (summaryLetterIndex < currentPhrase.length) {
				timeout = setTimeout(() => setSummaryLetterIndex(summaryLetterIndex + 1), 90);
			} else {
				timeout = setTimeout(() => setSummaryDeleting(true), 1500);
			}
		} else {
			if (summaryLetterIndex > 0) {
				timeout = setTimeout(() => setSummaryLetterIndex(summaryLetterIndex - 1), 45);
			} else {
				setSummaryDeleting(false);
				setSummaryPhraseIndex((summaryPhraseIndex + 1) % summaryPhrases.length);
			}
		}
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [isMounted, summaryDeleting, summaryLetterIndex, summaryPhraseIndex, summaryPhrases]);

	const formatDate = (iso?: string | null) => {
		if (!iso) return null;
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return null;
		return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
	};

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
			<div className="relative z-10" suppressHydrationWarning>
				<main className="mx-auto max-w-6xl min-h-screen flex flex-col items-center justify-center gap-16 py-24 px-6" suppressHydrationWarning>
					<section id="about" className="text-center space-y-5" style={{ textAlign: (data?.styles?.align || "CENTER").toLowerCase() as any }}>
						{fullName && (
						<h1
								className={`${pacifico.className} text-5xl sm:text-6xl lg:text-7xl font-bold flex flex-wrap justify-center gap-1`}
								style={{ color: data?.styles?.accentColor || "#22d3ee" }}
							>
								{glowName}
							</h1>
						)}
						<div className="min-h-[1.75rem]">
							{summaryPhrases.length > 0 ? (
								<p className="text-lg font-light text-white/80" aria-live="polite">
									<span className="opacity-70">I am </span>
									<span className="font-semibold text-white/90">{isMounted ? summaryText : summaryPhrases[0]}</span>
									<span className="ml-1 inline-block h-6 w-[2px] align-middle bg-white/80 animate-pulse" />
								</p>
							) : (
								secondaryHeadline && <p className="text-lg opacity-90">{secondaryHeadline}</p>
							)}
						</div>
						{data?.bio && <p className="max-w-2xl mx-auto opacity-80 whitespace-pre-line">{data.bio}</p>}
						{contactDetails.length > 0 && (
							<div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-white/80">
								{contactDetails.map(({ label, value }, idx) => (
									<div key={`${label}-${idx}`} className="rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-md">
										<span className="font-medium text-white/90">{label}:</span> <span>{value}</span>
									</div>
								))}
							</div>
						)}
					</section>

					<section id="skills" className="w-full" suppressHydrationWarning>
						<h2 className={`${pacifico.className} text-2xl mb-4`}>Skills</h2>
						<div className="flex flex-wrap justify-center gap-9">
							{(data?.skills || []).map((s: any, i: number) => {
								const levelValue = Math.min(100, Math.max(0, s.level ?? 0));
								const radius = 56;
								const circumference = 2 * Math.PI * radius;
								const offset = circumference * (1 - levelValue / 100);
								return (
									<div key={i} className="flex flex-col items-center gap-3">
										<div className="relative w-32 h-32">
											<svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
												<defs>
													<linearGradient id={`skillGradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
														<stop offset="0%" stopColor={data?.styles?.accentColor || "#22d3ee"} stopOpacity="0.95" />
														<stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
													</linearGradient>
												</defs>
												<circle cx="70" cy="70" r={radius} stroke="rgba(255,255,255,0.15)" strokeWidth="12" fill="transparent" />
												<circle
													cx="70"
													cy="70"
													r={radius}
													stroke={`url(#skillGradient-${i})`}
													strokeWidth="12"
													strokeLinecap="round"
													strokeDasharray={circumference.toString()}
													strokeDashoffset={offset.toString()}
													fill="transparent"
												/>
											</svg>
											<div className="absolute inset-0 rotate-90 flex flex-col items-center justify-center">
												<span className="text-2xl font-semibold">{levelValue}%</span>
											</div>
										</div>
										<div className="max-w-[12rem] text-center space-y-1">
											<h3 className="text-base font-medium">{s.name}</h3>
											{s.description && <p className="text-sm text-white/70 whitespace-pre-line">{s.description}</p>}
										</div>
									</div>
								);
							})}
						</div>
					</section>

					<section id="exp" className="w-full" suppressHydrationWarning>
						<h2 className={`${pacifico.className} text-2xl mb-4`}>Experience</h2>
						<div className="grid gap-5 md:grid-cols-2">
							{(data?.experiences || []).map((e: any, i: number) => {
								const start = formatDate(e.startDate);
								const end = formatDate(e.endDate) ?? "Present";
								return (
									<div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-3">
										<div className="flex flex-col gap-1">
											<h3 className="text-lg font-semibold text-white/95">{e.title}</h3>
											<p className="text-sm text-white/70">{e.company}</p>
											{start && (
												<p className="text-xs uppercase tracking-[0.3em] text-white/50">
													{start} – {end}
												</p>
											)}
										</div>
										{e.description && <p className="text-sm opacity-90 whitespace-pre-line">{e.description}</p>}
									</div>
								);
							})}
						</div>
					</section>
				</main>
			</div>
		</div>
	);
}
