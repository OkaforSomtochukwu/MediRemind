'use client';

import { useForm } from 'react-hook-form';
import { useMedicationStore } from '@/store/useMedicationStore';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Clock, Activity, Calendar, Pill, Hash } from 'lucide-react';
import Link from 'next/link';

type FormData = {
    name: string;
    dosage: string;
    frequency: string;
    time: string;
    inventory_count: number;
};

export default function AddMedicationForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            frequency: 'Daily',
            time: '08:00',
            inventory_count: 0
        }
    });
    const addMedication = useMedicationStore((state) => state.addMedication);
    const isLoading = useMedicationStore((state) => state.isLoading);
    const router = useRouter();

    const onSubmit = async (data: FormData) => {
        try {
            await addMedication({
                ...data,
                inventory_count: Number(data.inventory_count)
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Error adding medication:', error);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-4">
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Add Medication
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                    Set up your schedule and inventory tracking.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                Medication Name
                            </label>
                            <div className="relative">
                                <Pill className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. Paracetamol"
                                    className={`block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-red-50' : 'border-slate-100 dark:border-slate-700 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900'
                                        } dark:text-white`}
                                    {...register('name', { required: 'Name is required' })}
                                />
                            </div>
                            {errors.name && <p className="mt-1 text-xs font-bold text-red-500 ml-1">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    Dosage
                                </label>
                                <div className="relative">
                                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. 500mg"
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all dark:text-white"
                                        {...register('dosage')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    Frequency
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all dark:text-white appearance-none cursor-pointer"
                                        {...register('frequency')}
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Twice Daily">Twice Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="As Needed">As Needed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    Remind At
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="time"
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all dark:text-white"
                                        {...register('time', { required: 'Time is required' })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    Initial Inventory
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Total pills"
                                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all dark:text-white"
                                        {...register('inventory_count', { required: 'Inventory is required' })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/dashboard"
                            className="flex-1 px-8 py-4 text-center font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-3 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-teal-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Medication
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
