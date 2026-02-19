'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Activity,
    Calendar,
    TrendingUp,
    Settings,
    LogOut,
    Pill,
    AlertCircle,
    CheckCircle2,
    Clock,
    History,
    Trophy,
    Flame,
    ArrowRight,
    Star,
    ChevronLeft,
    ChevronRight,
    RotateCcw
} from 'lucide-react';
import { useMedicationStore } from '@/store/useMedicationStore';
import MedicationList from '@/components/MedicationList';
import MedicationForm from '@/components/MedicationForm';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';
import AdherenceHeatmap from '@/components/Stats/AdherenceHeatmap';
import DoctorsReport from '@/components/Stats/DoctorsReport';

export default function Dashboard() {
    const {
        medications,
        dependents,
        fetchMedications,
        fetchDependents,
        checkDailyReset,
        streak,
        isLoading,
        error,
        clearStore,
        refillMedication
    } = useMedicationStore();
    const [showAddForm, setShowAddForm] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [activeDependent, setActiveDependent] = useState<any>(null); // null means "Personal"
    const scrollRef = useRef<HTMLDivElement>(null);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && isMounted.current) {
                    setUserName(user.user_metadata?.full_name || user.email);
                    // Fetch dependents and medications in parallel for speed
                    await Promise.all([
                        fetchDependents(),
                        fetchMedications(activeDependent?.id)
                    ]);

                    if (!activeDependent && isMounted.current) {
                        checkDailyReset();
                    }
                }
            } catch (error) {
                console.error('Failed to initialize dashboard:', error);
            }
        };
        init();
        return () => { isMounted.current = false; };
    }, [fetchMedications, fetchDependents, checkDailyReset, activeDependent]);

    const totalMeds = medications.length;
    const takenMeds = medications.filter(m => m.status === 'taken').length;
    const progress = totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 0;
    const lowStockMeds = medications.filter(m => m.inventory_count <= 5);
    const allTaken = totalMeds > 0 && takenMeds === totalMeds;

    const currentViewTitle = activeDependent ? `${activeDependent.full_name}'s Schedule` : 'Personal Dashboard';
    const isReadOnly = !!activeDependent;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Low Stock Banner */}
                <AnimatePresence>
                    {lowStockMeds.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600 animate-pulse">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-red-900 dark:text-red-100">Low Stock Alert</p>
                                    <p className="text-xs font-bold text-red-600">{lowStockMeds.length} items need a refill soon.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                {lowStockMeds.slice(0, 2).map(med => (
                                    <button
                                        key={med.id}
                                        onClick={() => refillMedication(med.id, 30)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all whitespace-nowrap"
                                    >
                                        Refill {med.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-4 flex items-center gap-3 overflow-hidden mb-6"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm font-bold text-red-900 dark:text-red-100">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Celebration Header / Streak Banner */}
                <AnimatePresence>
                    {allTaken ? (
                        <motion.div
                            initial={{ height: 0, opacity: 0, y: -20 }}
                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-[2rem] p-6 mb-6 text-white shadow-xl shadow-teal-200 dark:shadow-none relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Trophy size={120} />
                                </div>
                                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"
                                        >
                                            <Trophy className="w-8 h-8 text-white" />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-2xl font-black">All Done for Today!</h2>
                                            <p className="text-teal-50 font-medium">You've successfully taken all your medications. Great job!</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-100">Current Streak</p>
                                            <p className="text-2xl font-black">{streak} Days</p>
                                        </div>
                                        <Flame className="w-8 h-8 text-orange-400" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
                                    <Flame className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Daily Streak</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{streak} Day Persistence</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                <span>{totalMeds - takenMeds} doses left to keep the flame alive</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-full"
                            >
                                {currentViewTitle}
                            </motion.div>
                            {isReadOnly && (
                                <button
                                    onClick={() => setActiveDependent(null)}
                                    className="text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors"
                                >
                                    Switch to Personal
                                </button>
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            {activeDependent ? `Monitoring: ${activeDependent.full_name}` : `Hello, ${userName?.split(' ')[0]}`}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            {isReadOnly ? "You are viewing this schedule in read-only mode." : allTaken ? "You're all set for today!" : `You have ${totalMeds - takenMeds} medications remaining.`}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Dependent Switcher */}
                        {dependents.length > 0 && (
                            <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <button
                                    onClick={() => setActiveDependent(null)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                        !activeDependent ? "bg-teal-600 text-white shadow-lg shadow-teal-100 dark:shadow-none" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    Me
                                </button>
                                {dependents.map(dep => (
                                    <button
                                        key={dep.id}
                                        onClick={() => setActiveDependent(dep)}
                                        className={clsx(
                                            "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                            activeDependent?.id === dep.id ? "bg-teal-600 text-white shadow-lg shadow-teal-100 dark:shadow-none" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {dep.full_name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchMedications(activeDependent?.id)}
                                className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-teal-600 transition-all shadow-sm flex items-center gap-2"
                                title="Refresh Schedule"
                            >
                                <RotateCcw className={clsx("w-5 h-5", isLoading && "animate-spin")} />
                            </button>
                            <Link
                                href="/add"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-100 dark:shadow-teal-900/20 hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                Add Medication
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Stats Section with Responsive Slider & Navigation */}
                <div className="relative group">
                    <section
                        ref={scrollRef}
                        className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-smooth snap-x snap-mandatory no-scrollbar"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-teal-50 dark:bg-teal-900/30 rounded-2xl text-teal-600">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{Math.round(progress)}%</span>
                                    <p className="text-sm font-bold text-teal-600">{takenMeds} of {totalMeds} taken</p>
                                </div>
                                <div className="w-16 h-16 relative">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-teal-50 dark:text-slate-800" />
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={175.92} strokeDashoffset={175.92 - (175.92 * progress) / 100} className="text-teal-500 transition-all duration-1000" strokeLinecap="round" />
                                    </svg>
                                    {allTaken && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Star className="w-6 h-6 text-teal-500 fill-teal-500" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600">
                                    <Flame className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Consistency</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{streak} Days</span>
                            <p className="text-sm font-bold text-amber-600 mt-1">{streak > 5 ? "You're on fire! 🔥" : "Start your journey! 🌱"}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl text-red-600">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Inventory</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{lowStockMeds.length} Alerts</span>
                            <p className="text-sm font-bold text-red-600 mt-1">{lowStockMeds.length > 0 ? "Items need refill 📦" : "All stocks healthy ✅"}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Reminders</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalMeds} Active</span>
                            <p className="text-sm font-bold text-blue-600 mt-1">Full schedule ⏰</p>
                        </motion.div>
                    </section>

                    {/* Navigation Arrows (Visible only on mobile/touch with overflow) */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-6 h-6 text-teal-600" />
                                {isReadOnly ? "Dependent Schedule" : "Your Schedule"}
                            </h2>
                        </div>
                        <MedicationList readOnly={isReadOnly} />
                    </div>

                    <aside className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <History className="w-5 h-5 text-teal-600" />
                                Recent Activity
                            </h3>
                            <div className="space-y-6">
                                {medications.filter(m => m.status === 'taken').slice(0, 4).length > 0 ? (
                                    medications.filter(m => m.status === 'taken').slice(0, 4).map((med, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Took {med.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">Just now</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 font-medium text-center py-4">No activity yet today</p>
                                )}
                            </div>
                        </div>

                    </aside>
                </main>

                {/* Tracking & Reports */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AdherenceHeatmap />
                    <DoctorsReport />
                </section>

                {/* Health Tip Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-teal-100 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                            <TrendingUp size={120} />
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8 relative">
                            <div className="flex-1">
                                <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6" />
                                    Daily Health Tip
                                </h3>
                                <p className="text-teal-50 text-lg font-medium leading-relaxed mb-6">
                                    Consistency is key! Taking your medications at the same time every day improves treatment effectiveness by up to {Math.round(progress > 0 ? progress : 85)}%. Keep up the great work!
                                </p>
                            </div>
                            <button className="whitespace-nowrap px-8 py-4 bg-white text-teal-700 font-black rounded-2xl hover:bg-teal-50 transition-all shadow-lg hover:scale-105 active:scale-95">
                                View Full Analytics
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showAddForm && (
                        <MedicationForm onClose={() => setShowAddForm(false)} />
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
}
