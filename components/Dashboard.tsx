'use client';

import { useMedicationStore } from '@/store/useMedicationStore';
import { Pill, Trash2, CheckCircle, XCircle, Plus, RotateCcw, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { medications, removeMedication, updateStatus, checkDailyReset, streak, history, fetchMedications } = useMedicationStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchMedications();
        checkDailyReset();
    }, [checkDailyReset, fetchMedications]);

    if (!mounted) return null;

    const total = medications.length;
    const takenCount = medications.filter(m => m.status === 'taken').length;
    const progress = total === 0 ? 0 : Math.round((takenCount / total) * 100);

    const weeklyAdherence = (() => {
        if (history.length === 0) return 0;
        const totalTaken = history.reduce((acc, day) => acc + day.taken, 0);
        const totalMeds = history.reduce((acc, day) => acc + day.total, 0);
        return totalMeds === 0 ? 0 : Math.round((totalTaken / totalMeds) * 100);
    })();

    return (
        <div className="space-y-8">
            {/* Header & Date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Today's Schedule
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Link
                    href="/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add Medication
                </Link>
            </div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
                {/* Streak Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Streak</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{streak}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">days</span>
                        </div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <svg
                            className="h-8 w-8 text-orange-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                    </div>
                </div>

                {/* Weekly Adherence Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly Adherence</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {weeklyAdherence}
                                %
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                </div>
            </motion.div>

            {/* Progress Bar */}
            {total > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Progress</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                You've taken <span className="font-bold text-teal-600 dark:text-teal-400">{takenCount}</span> of <span className="font-bold text-slate-900 dark:text-white">{total}</span> medications
                            </p>
                        </div>
                        <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                        <motion.div
                            className="bg-teal-500 h-4 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Medication List */}
            {total === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 mb-6 relative">
                        <div className="absolute inset-0 rounded-full bg-teal-100/50 dark:bg-teal-900/20 animate-ping opacity-75"></div>
                        <Pill className="h-10 w-10 text-teal-500 relative z-10" />
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">No medications to track</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                        Your schedule is clear. Add a medication to start tracking your daily adherence.
                    </p>
                    <Link
                        href="/add"
                        className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all hover:scale-105"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Your First Medication
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {medications.map((med) => (
                            <motion.div
                                layout
                                key={med.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className={clsx(
                                    "relative group rounded-2xl shadow-sm border p-6 flex flex-col justify-between min-h-[200px]",
                                    med.status === 'taken'
                                        ? "bg-teal-50/50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-900/30"
                                        : med.status === 'missed'
                                            ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 opacity-75"
                                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className={clsx(
                                                "text-lg font-bold transition-colors",
                                                med.status === 'taken' ? "text-teal-900 dark:text-teal-100" :
                                                    med.status === 'missed' ? "text-red-900 dark:text-red-100" :
                                                        "text-slate-900 dark:text-white"
                                            )}>
                                                {med.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {med.dosage}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-light text-slate-900 dark:text-white">
                                                {med.time}
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide font-medium mt-0.5">
                                                {med.frequency}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100 dark:border-slate-800/50">
                                    {med.status === 'pending' ? (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => updateStatus(med.id, 'taken')}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50 transition-colors font-medium text-sm"
                                            >
                                                <CheckCircle className="h-5 w-5" />
                                                Take
                                            </button>
                                            <button
                                                onClick={() => updateStatus(med.id, 'missed')}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors font-medium text-sm"
                                            >
                                                <XCircle className="h-5 w-5" />
                                                Skip
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between w-full">
                                            <motion.span
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={clsx(
                                                    "flex items-center gap-2 font-medium text-sm",
                                                    med.status === 'taken' ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"
                                                )}>
                                                {med.status === 'taken' ? (
                                                    <><CheckCircle className="h-5 w-5" /> Taken</>
                                                ) : (
                                                    <><XCircle className="h-5 w-5" /> Missed</>
                                                )}
                                            </motion.span>
                                            <button
                                                onClick={() => updateStatus(med.id, 'pending')}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Reset status"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeMedication(med.id)}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                    aria-label="Remove medication"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
