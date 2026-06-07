"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();


    const t = {
        readyToChat: "Ready to chat?",
        letsCollaborate: "Let's Collaborate",
        usernameOrEmail: "Username or Email",
        password: "Password",
        signIn: "Sign in",
        noAccount: "Don't have an account?",
        registerHere: "Register here"
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post("http://localhost:5001/api/auth/login", {
                identifier,
                password,
            });

            localStorage.setItem("token", res.data.token);
            router.push("/rooms");

        } catch (err: any) {
            setError(err.response?.data?.message || "Login Failed!!");
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-white">
            <div className="col-span-1 md:col-span-5 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-5xl font-extrabold mb-2 text-gray-900 tracking-tight">{t.readyToChat}</h2>
                    <h2 className="text-4xl font-bold mb-6 text-blue-500">{t.letsCollaborate}</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">{t.usernameOrEmail}</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-8">
                            <label className="block text-gray-700 mb-2">{t.password}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                            {t.signIn}
                        </button>
                    </form>
                    <p className="mt-4 text-center">
                        {t.noAccount}{" "}
                        <a href="/register" className="text-blue-500">
                            {t.registerHere}
                        </a>
                    </p>
                </div>
            </div>
            <div className="hidden md:flex md:col-span-7 w-full flex-col items-center justify-center p-12 bg-blue-400">
            </div>
        </div>
    );
}