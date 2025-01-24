'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Logo from "@/assets/logo2.png";

interface LoginFormData {
    username: string;
    password: string;
}

export default function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleGoogleLogin = () => {
        window.location.href = 'https://localhost:8080/api/auth/google';
    };
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

const GoogleLogo = () => (
    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

return (
    <div className="max-w-4xl max-h-4xl flex items-center justify-center">
        <div className="w-full max-h-full rounded-lg bg-gray-100 px-16 py-16 shadow-2xl">
            <div className="flex justify-center mb-8">
            <Image
                src={Logo}
                alt="streamline-logo"
                width={200} 
                height={200} 
                className="rounded bg-center"
            />
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="text-center text-base text-red-600">
                {error}
                </div>
            )}

            <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2"
            >
                <GoogleLogo />
                Sign in with Google
            </button>

            <hr className="my-4" />

            <div className="space-y-6">
                <input
                type="text"
                name="username"
                required
                className="block w-full rounded-md border border-gray-300 px-5 py-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                
                <input
                type="password"
                name="password"
                required
                className="block w-full rounded-md border border-gray-300 px-5 py-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <div className="justify-start text-right">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                </a>
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
}