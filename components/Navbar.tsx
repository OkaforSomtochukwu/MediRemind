'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill,
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,
    Settings,
    Bell,
    ChevronDown
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { supabase } from '@/lib/supabase';
import { useMedicationStore } from '@/store/useMedicationStore';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const clearStore = useMedicationStore((state) => state.clearStore);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            clearStore();
            localStorage.clear(); // Ensure all local state is nuked
            router.push('/login');
            setShowUserMenu(false);
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to sign out. Please try again.');
        }
    };

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (isAuthPage) return null;

    return (
        <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-teal-900/20 group-hover:scale-110 transition-transform">
                                <Pill className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Medi<span className="text-teal-600">Remind</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                        pathname === '/dashboard'
                                            ? "text-teal-600 bg-teal-50 dark:bg-teal-900/30"
                                            : "text-slate-500 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    Dashboard
                                </Link>
                                <div className="h-6 w-px bg-slate-100 dark:border-slate-800" />
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-1.5 pl-3 pr-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-teal-300 transition-all group"
                                    >
                                        <div className="w-7 h-7 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center overflow-hidden">
                                            <User className="w-4 h-4 text-teal-600" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                                            {user.email?.split('@')[0]}
                                        </span>
                                        <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", showUserMenu ? "rotate-180" : "")} />
                                    </button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden"
                                            >
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profile
                                                </Link>
                                                <Link
                                                    href="/profile" // Placeholder for settings since it's missing, or keep as profile
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Settings
                                                </Link>
                                                <div className="h-px bg-slate-50 dark:bg-slate-800 my-2 mx-2" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-teal-100 dark:shadow-none hover:scale-105"
                                >
                                    Join MediRemind
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-2">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600"
                                    >
                                        <User className="w-5 h-5" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-3 text-center bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-100"
                                    >
                                        Join MediRemind
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
