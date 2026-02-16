'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        age: '',
        gender: '',
        occupation: '',
        maritalStatus: '',
        address: '',
        nationality: '',
        religion: '',
        admissionMode: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Insert profile data
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            full_name: formData.fullName,
                            age: parseInt(formData.age),
                            gender: formData.gender,
                            occupation: formData.occupation,
                            marital_status: formData.maritalStatus,
                            address: formData.address,
                            nationality: formData.nationality,
                            religion: formData.religion,
                            admission_mode: formData.admissionMode,
                            updated_at: new Date(),
                        }
                    ]);

                if (profileError) {
                    // If profile creation fails, we might want to warn the user, but account is created.
                    // For now, treat as error.
                    console.error('Profile creation error:', profileError);
                    throw new Error('Failed to create user profile. Please try again.');
                }

                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-teal-600 transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Join MediRemind to track your health journey.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-slate-100 dark:border-slate-800">
                    <form className="space-y-6" onSubmit={handleSignup}>

                        {/* Account Info */}
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Account Information</h3>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <input name="fullName" type="text" required value={formData.fullName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div>
                                {/* Placeholder to align grid if needed, or just let it flow */}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <input name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                <input name="confirmPassword" type="password" required minLength={6} value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>
                        </div>

                        {/* Personal Details */}
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 mt-8">
                            <div className="sm:col-span-2">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Personal Details</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                                <input name="age" type="number" required value={formData.age} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                                <select name="gender" required value={formData.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                                <input name="address" type="text" required value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Occupation</label>
                                <input name="occupation" type="text" required value={formData.occupation} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Marital Status</label>
                                <select name="maritalStatus" required value={formData.maritalStatus} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3">
                                    <option value="">Select...</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nationality / Tribe</label>
                                <input name="nationality" type="text" required value={formData.nationality} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Religion</label>
                                <input name="religion" type="text" required value={formData.religion} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mode of Admission (if any)</label>
                                <input name="admissionMode" type="text" placeholder="e.g. Emergency, Referral, Self-reporting" value={formData.admissionMode} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm dark:bg-slate-800 dark:text-white py-2 px-3" />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mt-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                            Error
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>

                        <div className="text-center mt-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-teal-600 hover:text-teal-500">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
