"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
		setLoading(false);
		if (!res.ok) {
			const j = await res.json().catch(() => ({}));
			setError(j?.error || "Login failed");
			return;
		}
		// Store session in localStorage for simpler management
		localStorage.setItem("adminSession", "true");
		localStorage.setItem("adminEmail", email);
		router.push("/hiddenpage");
	}

	if (!isMounted) return null;

	return (
		<div className="min-h-screen flex items-center justify-center p-4" suppressHydrationWarning>
			<form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 border p-6 rounded" suppressHydrationWarning>
				<h1 className="text-xl font-semibold" suppressHydrationWarning>Admin Login</h1>
				{error && <p className="text-red-600">{error}</p>}
				<input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} suppressHydrationWarning />
				<input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} suppressHydrationWarning />
				<button disabled={loading} className="bg-black text-white w-full py-2 rounded" suppressHydrationWarning>{loading ? "Loading…" : "Login"}</button>
			</form>
		</div>
	);
}
