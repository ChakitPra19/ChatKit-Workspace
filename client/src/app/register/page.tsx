"use client"
import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const t = {
        readyToJoin: "Welcome to ChatKit Workspace",
        connectWithYourFriends: "Connect with your friends",
        username: "Username",
        email: "Email",
        password: "Password",
        register: "Register",
        haveAccount: "Already have an account?",
        loginHere: "Login Here",
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await axios.post("http://localhost:5001/api/auth/register", {
                username,
                email,
                password,
            });

            router.push("/login");
        } catch (error: any) {
            setError(error.response?.data?.message || "Register Failed!");
        }
    };
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-white">
            <div className="col-span-1 md:col-span-5 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-5xl font-extrabold mb-2 text-gray-900 tracking-tight">{t.readyToJoin}</h2>
                    <h2 className="text-4xl font-bold mb-6 text-gray-600">{t.connectWithYourFriends}</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleRegister}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">{t.email}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">{t.username}</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                        <button type="submit" className="w-full bg-black text-white py-2 rounded">
                            {t.register}
                        </button>
                    </form>
                    <p className="mt-4 text-center">
                        {t.haveAccount}{" "}
                        <a href="/login" className="text-gray-400">
                            {t.loginHere}
                        </a>
                    </p>
                </div>
            </div>
            <div className="hidden md:flex md:col-span-7 w-full flex-col items-center justify-center p-12 bg-black">
            </div>
        </div>
    );
}