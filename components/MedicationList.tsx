'use client';

import { useState, useMemo } from 'react';
import { useMedicationStore, Medication } from '@/store/useMedicationStore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, AlertTriangle, CheckCircle2, RotateCcw, Package, Clock, XCircle, AlertCircle, Plus } from 'lucide-react';
import MedicationForm from './MedicationForm';
import clsx from 'clsx';

interface MedicationListProps {
    readOnly?: boolean;
}

export default function MedicationList({ readOnly = false }: MedicationListProps) {
    const { medications, deleteMedication, updateStatus, isLoading } = useMedicationStore();
    const [editingMed, setEditingMed] = useState<Medication | null>(null);

    // Smart Sorting & Overdue Detection
    const sortedAndCategorizedMeds = useMemo(() => {
        const now = new Date();
        const currentTimeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        return [...medications].sort((a, b) => {
            // Primarily sort by time
            if (!a.time) return 1;
            if (!b.time) return -1;

            // If statuses are different, put pending/overdue first
            if (a.status !== b.status) {
                if (a.status === 'taken') return 1;
                if (b.status === 'taken') return -1;
            }

            return a.time.localeCompare(b.time);
        }).map(med => {
            const overdue = med.status === 'pending' && med.time && med.time < currentTimeString;
            return { ...med, overdue };
        });
    }, [medications]);

    if (isLoading && medications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-12 h-12 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-bold">Loading schedule...</p>
            </div>
        );
    }

    if (medications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No medications added yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
                    Start by adding your first medication to track your schedule and inventory.
                </p>
                {!readOnly && (
                    <Link
                        href="/add"
                        className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-100 dark:shadow-none hover:scale-105 active:scale-95 gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Medication
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {sortedAndCategorizedMeds.map((med) => (
                        <motion.div
                            key={med.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                                layout: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className={clsx(
                                "bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all group relative min-h-[180px] flex flex-col justify-between overflow-hidden",
                                med.status === 'taken'
                                    ? "bg-teal-50/50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800/50 opacity-75"
                                    : med.overdue
                                        ? "border-red-300 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/5 shadow-lg shadow-red-100 dark:shadow-none"
                                        : "border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800"
                            )}
                        >
                            {/* Urgent Badge */}
                            {med.overdue && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl flex items-center gap-1 shadow-sm">
                                    <AlertCircle className="w-3 h-3" />
                                    Urgent / Overdue
                                </div>
                            )}

                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                        med.status === 'taken' ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600" :
                                            med.overdue ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                                                "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                    )}>
                                        <Pill className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className={clsx(
                                            "font-bold text-lg transition-colors",
                                            med.status === 'taken' ? "text-teal-900 dark:text-teal-100" :
                                                med.overdue ? "text-red-900 dark:text-red-100" :
                                                    "text-slate-900 dark:text-white"
                                        )}>{med.name}</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {med.dosage && (
                                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                                                    {med.dosage}
                                                </span>
                                            )}
                                            {med.time && (
                                                <span className={clsx(
                                                    "text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors",
                                                    med.overdue ? "bg-red-100 dark:bg-red-900/40 text-red-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                )}>
                                                    <Clock className="w-3 h-3" />
                                                    {med.time}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!readOnly && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingMed(med)}
                                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-teal-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteMedication(med.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                {med.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        {!readOnly ? (
                                            <>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => updateStatus(med.id, 'taken')}
                                                    className={clsx(
                                                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm",
                                                        med.overdue
                                                            ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none"
                                                            : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100 dark:shadow-none"
                                                    )}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Mark as Taken
                                                </motion.button>
                                                <button
                                                    onClick={() => updateStatus(med.id, 'missed')}
                                                    className="px-3 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="Skip/Missed"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Pending dose
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={clsx(
                                                "flex items-center gap-1.5 text-sm font-bold",
                                                med.status === 'taken' ? "text-teal-600" : "text-red-500"
                                            )}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {med.status === 'taken' ? 'Completed' : 'Missed'}
                                        </motion.div>
                                        {!readOnly && (
                                            <button
                                                onClick={() => updateStatus(med.id, 'pending')}
                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Inventory</span>
                                    <span className={clsx(
                                        "text-xs font-bold",
                                        med.inventory_count <= 5 ? 'text-orange-600' : 'text-slate-500'
                                    )}>
                                        {med.inventory_count} remaining
                                    </span>
                                </div>
                                {med.inventory_count <= 5 && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full animate-pulse">
                                        <AlertTriangle className="w-3 h-3" />
                                        REFILL SOON
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {editingMed && (
                    <MedicationForm
                        onClose={() => setEditingMed(null)}
                        editMedication={editingMed}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
