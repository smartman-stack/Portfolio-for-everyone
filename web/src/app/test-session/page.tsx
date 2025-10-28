"use client";
import { useState } from "react";

export default function SessionTest() {
	const [result, setResult] = useState<string>("");

	async function testSession() {
		try {
			const res = await fetch("/api/auth/test-session");
			const data = await res.json();
			setResult(JSON.stringify(data, null, 2));
		} catch (error) {
			setResult(`Error: ${error}`);
		}
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Session Test</h1>
			<button 
				onClick={testSession}
				className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
			>
				Test Session
			</button>
			<pre className="bg-gray-100 p-4 rounded">{result}</pre>
		</div>
	);
}
