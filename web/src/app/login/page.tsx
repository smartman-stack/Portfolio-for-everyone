"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

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
		router.push("/hiddenpage");
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 border p-6 rounded">
				<h1 className="text-xl font-semibold">Admin Login</h1>
				{error && <p className="text-red-600">{error}</p>}
				<input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
				<input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
				<button disabled={loading} className="bg-black text-white w-full py-2 rounded">{loading ? "Loading…" : "Login"}</button>
			</form>
		</div>
	);
}
