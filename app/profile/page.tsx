'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, User, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CaregiverInvites from '@/components/Caregiver/CaregiverInvites';

interface Profile {
    full_name: string;
    age: number;
    gender: string;
    occupation: string;
    marital_status: string;
    address: string;
    nationality: string;
    religion: string;
    admission_mode: string;
    email?: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (data) {
                setProfile({ ...data, email: session.user.email });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    <p className="text-slate-500 dark:text-slate-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile not found</h2>
                    <p className="text-slate-500">Please contact support.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
                >
                    <div className="bg-teal-600 px-6 py-8 sm:px-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">User Profile</h1>
                                <p className="text-teal-100 text-sm">{profile.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-8 sm:px-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">

                            <div className="col-span-1 sm:col-span-2">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                                    Personal Information
                                </h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.full_name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Age</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.age}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Gender</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.gender}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Marital Status</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.marital_status}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Nationality / Tribe</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.nationality}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Religion</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.religion}</p>
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Address</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.address}</p>
                            </div>

                            <div className="col-span-1 sm:col-span-2 mt-4">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                                    Professional & Medical
                                </h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Occupation</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">{profile.occupation}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Admission Mode</label>
                                <p className="mt-1 text-lg font-medium text-slate-900 dark:text-white">
                                    {profile.admission_mode || 'N/A'}
                                </p>
                            </div>

                        </div>
                    </div>
                </motion.div>

                {/* Caregiver Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8"
                >
                    <CaregiverInvites />
                </motion.div>
            </div>
        </div>
    );
}
