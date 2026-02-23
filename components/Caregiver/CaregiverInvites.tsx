'use client';

import { useEffect, useState } from 'react';
import { useMedicationStore } from '@/store/useMedicationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Check, X, Mail, Shield, User as UserIcon, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

export default function CaregiverInvites() {
    const {
        invites,
        fetchInvites,
        sendInvite,
        acceptInvite,
        rejectInvite,
        isLoading,
        error
    } = useMedicationStore();
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        await sendInvite(email);
        if (!error) {
            setSuccess(true);
            setEmail('');
        }
    };

    const receivedInvites = invites.filter(i => i.status === 'pending' && i.invitee_email !== i.inviter?.email);
    // Note: The store's fetchInvites fetches both sent and received. 
    // We filter appropriately for the UI.

    return (
        <div className="space-y-8">
            {/* Received Invites Section (Caregiver side) */}
            <AnimatePresence>
                {invites.some(i => i.status === 'pending' && i.inviter_id !== invites[0]?.inviter_id) && (
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-[2rem] border border-teal-100 dark:border-teal-800/50">
                        <h3 className="text-xl font-black text-teal-900 dark:text-teal-100 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Caregiver Invitations
                        </h3>
                        <div className="space-y-4">
                            {invites.filter(i => i.status === 'pending').map((invite) => (
                                <motion.div
                                    key={invite.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between gap-4 border border-slate-100 dark:border-slate-800 shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {invite.inviter?.full_name || 'Relative'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {invite.inviter?.email} wants you as their caregiver.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptInvite(invite.id)}
                                            disabled={isLoading}
                                            className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => rejectInvite(invite.id)}
                                            disabled={isLoading}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Caregiver Form (Dependent side) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-teal-600" />
                    Invite a Caregiver
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Enter caregiver's email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 transition-all outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !email}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-100 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Invite
                            </>
                        )}
                    </button>
                </form>

                {error && <p className="mt-2 text-sm text-red-600 font-bold">{error}</p>}
                {success && <p className="mt-2 text-sm text-teal-600 font-bold">Invite sent successfully!</p>}

                {/* Sent Invites List */}
                {invites.length > 0 && (
                    <div className="mt-8 space-y-3">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Recent Invitations</p>
                        {invites.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{invite.invitee_email}</span>
                                    {invite.inviter?.full_name && (
                                        <span className="text-[10px] text-slate-400">From: {invite.inviter.full_name}</span>
                                    )}
                                </div>
                                <span className={clsx(
                                    "text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-full",
                                    invite.status === 'accepted' ? 'bg-teal-100 text-teal-600' :
                                        invite.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                )}>
                                    {invite.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
