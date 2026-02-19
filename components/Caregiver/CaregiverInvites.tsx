'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Check, X, Mail, Shield, User as UserIcon, Loader2 } from 'lucide-react';

interface Invite {
    id: string;
    inviter_id: string;
    invitee_email: string;
    status: string;
    created_at: string;
}

export default function CaregiverInvites() {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            setUser(session.user);

            // Load invites sent by me (as a potential dependent)
            const { data: sent } = await supabase
                .from('caregiver_invites')
                .select('*')
                .eq('inviter_id', session.user.id);

            if (sent) setInvites(sent);

            // Load invites received by me (as a potential caregiver)
            const { data: received } = await supabase
                .from('caregiver_invites')
                .select('*, profiles(full_name, email)')
                .eq('invitee_email', session.user.email)
                .eq('status', 'pending');

            if (received) setReceivedInvites(received);

            setLoading(false);
        };

        loadData();
    }, []);

    const sendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !user) return;
        setSending(true);

        try {
            const { error } = await supabase
                .from('caregiver_invites')
                .insert([
                    {
                        inviter_id: user.id,
                        invitee_email: email,
                        status: 'pending'
                    }
                ]);

            if (error) throw error;

            alert('Invite sent! Your caregiver will see it in their profile.');
            setEmail('');
            // Refresh sent invites
            const { data } = await supabase
                .from('caregiver_invites')
                .select('*')
                .eq('inviter_id', user.id);
            if (data) setInvites(data);
        } catch (error: any) {
            alert(error.message || 'Failed to send invite.');
        } finally {
            setSending(false);
        }
    };

    const handleInviteStatus = async (inviteId: string, status: 'accepted' | 'rejected') => {
        try {
            const { error: inviteError } = await supabase
                .from('caregiver_invites')
                .update({ status })
                .eq('id', inviteId);

            if (inviteError) throw inviteError;

            if (status === 'accepted') {
                const invite = receivedInvites.find(i => i.id === inviteId);
                // Update the dependent's profile to point to this caregiver
                await supabase
                    .from('profiles')
                    .update({ caregiver_id: user.id })
                    .eq('id', invite.inviter_id);
            }

            setReceivedInvites(prev => prev.filter(i => i.id !== inviteId));
            alert(`Invite ${status}!`);
        } catch (error: any) {
            alert(error.message || 'Operation failed.');
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-600" /></div>;

    return (
        <div className="space-y-8">
            {/* Received Invites Section (Caregiver side) */}
            <AnimatePresence>
                {receivedInvites.length > 0 && (
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-[2rem] border border-teal-100 dark:border-teal-800/50">
                        <h3 className="text-xl font-black text-teal-900 dark:text-teal-100 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Caregiver Invitations
                        </h3>
                        <div className="space-y-4">
                            {receivedInvites.map((invite) => (
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
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{invite.profiles.full_name}</p>
                                            <p className="text-xs text-slate-500">{invite.profiles.email} wants you as their caregiver.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleInviteStatus(invite.id, 'accepted')}
                                            className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleInviteStatus(invite.id, 'rejected')}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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
                <form onSubmit={sendInvite} className="flex gap-3">
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
                        disabled={sending}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-100 dark:shadow-none disabled:opacity-50"
                    >
                        {sending ? <Loader2 className="animate-spin" /> : 'Send Invite'}
                    </button>
                </form>

                {/* Sent Invites List */}
                {invites.length > 0 && (
                    <div className="mt-8 space-y-3">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Pending Invites</p>
                        {invites.map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{invite.invitee_email}</span>
                                <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-full ${invite.status === 'accepted' ? 'bg-teal-100 text-teal-600' :
                                        invite.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
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
