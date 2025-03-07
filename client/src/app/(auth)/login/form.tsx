"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Logo from "@/src/assets/logo2.png";

/**
 * @file form.tsx
 * @module LoginPage
 *
 * @remarks
 * Developer Notes:
 * - The login page is one of the first pages seen by the user, it can often times be the first impression of the application.
 * - With this login page I tried to keep it simple and clean, with a focus on the login form.
 * - Very straight forward, with a username and password input, and a submit button, there is a forgot password area that is not yet been created.
 * - The google sign in button is a nice touch, and is a great way to allow users to sign in with their google account, still learning on how to link this to already created user accounts.
 * - The main goal was having a way to sign in and get into the application to be able to tet out authentication and security features.
 * - One thing to mention is EQSi does a lot of military work and a requirment of that work is to have MFA, so that is something that will be added in the future.
 * - Started on 2025-01-12. JTW
 *
 * @returns {JSX.Element} 
 */

const LoginForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const validateInput = (input: string) => {
        const regex = /^[a-zA-Z0-9_!@#$%^&*()+=-]*$/;
        return regex.test(input);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.username || !formData.password) {
            setError("Username and password cannot be empty.");
            return;
        }

        const result = await signIn("credentials", {
            redirect: false,
            username: formData.username,
            password: formData.password,
            csrfToken: await fetchCsrfToken(), 
        });

        console.log("Sign In Result:", result);

        if (result?.error) {
            setError("Invalid username or password");
        } else {
            router.push("/dashboard"); 
        }
    };

    const handleGoogleLogin = async () => {
        signIn("google", { callbackUrl: "/dashboard" });
    };

    const fetchCsrfToken = async () => {
        const res = await fetch("/api/auth/csrf");
        const data = await res.json();
        return data.csrfToken;
    };

    return (
        <div className="max-w-4xl max-h-4xl flex items-center justify-center figtree-font">
            <div className="w-full max-h-full rounded-lg bg-gray-100 px-16 py-16 shadow-2xl figtree-font">
                <div className="flex justify-center mb-8">
                    <Image src={Logo} alt="streamline-logo" width={250} height={100} className="rounded bg-center" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && <div className="text-center text-base text-red-600">{error}</div>}

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2"
                    >
                        <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                            <path fill="#4285F4" d="M24 9.5c3.9 0 6.6 1.6 8.1 2.9l6-6C34.6 2.5 29.8 0 24 0 14.6 0 6.8 5.8 3.3 14.2l7.1 5.5C12.4 13.1 17.7 9.5 24 9.5z"/>
                            <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.1-2.4 5.7-4.9 7.4l7.5 5.8c4.4-4.1 7.2-10.2 7.2-17.7z"/>
                            <path fill="#FBBC05" d="M10.4 28.7c-1.1-3.1-1.1-6.5 0-9.6L3.3 13.6C-1.1 21.2-1.1 30.8 3.3 38.4l7.1-5.5z"/>
                            <path fill="#EA4335" d="M24 48c5.8 0 10.6-1.9 14.1-5.2l-7.5-5.8c-2.1 1.4-4.8 2.2-7.6 2.2-6.3 0-11.6-4.3-13.5-10.1l-7.1 5.5C6.8 42.2 14.6 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                        </svg>
                        Sign in with Google
                    </button>

                    <hr className="my-4" />

                    <div className="space-y-6">
                        <input
                            type="text"
                            name="username"
                            required
                            className="block w-full rounded-md border border-gray-300 bg-white px-5 py-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                        
                        <input
                            type="password"
                            name="password"
                            required
                            className="block w-full rounded-md border border-gray-300 bg-white px-5 py-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-sm text-blue-500 hover:underline focus:outline-none"
                                onClick={() => router.push("/forgot-password")}
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-1/2 rounded-md bg-[#3b82f6] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;