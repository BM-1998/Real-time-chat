// LandingPage.jsx
import { Link } from '@inertiajs/react';

export default function LandingPage() {
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Navbar */}
            <header className="bg-indigo-600 p-4 shadow-md flex justify-between items-center">
                <h1 className="text-white text-3xl font-bold">ChatVerse</h1>
                <div>
                    <Link href={route('login')} className="text-white px-4 py-2 mr-2 hover:underline">
                        Login
                    </Link>
                    <Link href={route('register')} className="text-white px-4 py-2 hover:underline">
                        Register
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-10">
                <h2 className="text-5xl font-bold text-indigo-700 mb-4">Welcome to ChatVerse</h2>
                <p className="text-gray-600 text-lg mb-8">
                    Connect, share, and stay in touch with your friends, family, and colleagues.
                </p>
                <div className="space-x-4">
                    <Link
                        href={route('register')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-indigo-700"
                    >
                        Get Started
                    </Link>
                    <Link
                        href={route('login')}
                        className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-400"
                    >
                        Log In
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-12 px-4 text-center">
                <h3 className="text-3xl font-bold text-indigo-600 mb-6">Why ChatVerse?</h3>
                <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
                    <div className="w-80 p-6 bg-gray-50 rounded-lg shadow-lg">
                        <h4 className="text-xl font-semibold mb-2">Instant Messaging</h4>
                        <p className="text-gray-600">Chat with friends and family in real-time.</p>
                    </div>
                    <div className="w-80 p-6 bg-gray-50 rounded-lg shadow-lg">
                        <h4 className="text-xl font-semibold mb-2">Secure Conversations</h4>
                        <p className="text-gray-600">Privacy-focused encryption for safe chats.</p>
                    </div>
                    <div className="w-80 p-6 bg-gray-50 rounded-lg shadow-lg">
                        <h4 className="text-xl font-semibold mb-2">Media Sharing</h4>
                        <p className="text-gray-600">Share photos, videos, and more effortlessly.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 p-4 text-center text-white">
                <p>&copy; 2024 ChatVerse. All rights reserved.</p>
            </footer>
        </div>
    );
}
