'use client';

import { useForm } from 'react-hook-form';
import { useMedicationStore } from '@/store/useMedicationStore';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Clock, Activity, Calendar } from 'lucide-react';
import Link from 'next/link';

type FormData = {
    name: string;
    dosage: string;
    frequency: string;
    time: string;
};

export default function AddMedicationForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const addMedication = useMedicationStore((state) => state.addMedication);
    const router = useRouter();

    const onSubmit = (data: FormData) => {
        addMedication(data);
        router.push('/');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Add New Medication
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enter the details of the medication you want to track.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Medication Name *
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="text"
                                    id="name"
                                    className={`block w-full rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                    placeholder="e.g. Ibuprofen"
                                    {...register('name', { required: 'Medication name is required' })}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="dosage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Dosage
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Activity className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    id="dosage"
                                    className="block w-full pl-10 rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                                    placeholder="e.g. 200mg"
                                    {...register('dosage')}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Frequency
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                </div>
                                <select
                                    id="frequency"
                                    className="block w-full pl-10 rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                                    {...register('frequency')}
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Twice Daily">Twice Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="As Needed">As Needed</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="time" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Remind At *
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="time"
                                    id="time"
                                    className="block w-full pl-10 rounded-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-2 px-3"
                                    {...register('time', { required: 'Reminder time is required' })}
                                />
                            </div>
                            {errors.time && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        >
                            <Save className="-ml-1 mr-2 h-4 w-4" />
                            Save Medication
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
