'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Pill, ArrowRight, User, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isLandingPage = pathname === '/';

    useEffect(() => {
        // Check initial dark mode preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }

        // Check auth status
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkUser();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-teal-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                <Pill className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                                MediRemind
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            {!user ? (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        Login
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all hover:shadow-lg hover:shadow-teal-500/20 flex items-center gap-2"
                                    >
                                        Start Free
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className={clsx(
                                            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            pathname === '/dashboard'
                                                ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                                                : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                                        )}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className={clsx(
                                            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            pathname === '/profile'
                                                ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                                                : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                                        )}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/add"
                                        className={clsx(
                                            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            pathname === '/add'
                                                ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                                                : "text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                                        )}
                                    >
                                        Add Medication
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </>
                            )}

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-teal-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className={clsx('md:hidden', isOpen ? 'block' : 'hidden')} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    {!user ? (
                        <Link
                            href="/login"
                            className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Get Started
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/profile"
                                className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Profile
                            </Link>
                            <Link
                                href="/add"
                                className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium"
                                onClick={() => setIsOpen(false)}
                            >
                                Add Medication
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Logout
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => {
                            toggleDarkMode();
                            setIsOpen(false);
                        }}
                        className="w-full text-left text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium"
                    >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>
            </div>
        </nav>
    );
}
