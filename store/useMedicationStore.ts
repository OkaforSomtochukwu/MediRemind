import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  status: 'pending' | 'taken' | 'missed';
  time: string | null;
  inventory_count: number;
  created_at: string;
}

interface HistoryDay {
  date: string;
  taken: number;
  total: number;
}

interface MedicationState {
  medications: Medication[];
  dependents: any[];
  streak: number;
  history: HistoryDay[];
  isLoading: boolean;
  error: string | null;
  selectedDependentId: string | null;
  invites: any[];

  // Actions
  fetchMedications: (userId?: string) => Promise<void>;
  fetchDependents: () => Promise<void>;
  fetchInvites: () => Promise<void>;
  setSelectedDependentId: (id: string | null) => void;
  sendInvite: (email: string) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  rejectInvite: (inviteId: string) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id' | 'created_at' | 'user_id' | 'status'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  updateStatus: (id: string, status: 'pending' | 'taken' | 'missed') => Promise<void>;
  refillMedication: (id: string, amount: number) => Promise<void>;
  checkDailyReset: () => void;
  setMedications: (medications: Medication[]) => void;
  clearStore: () => void;
}

export const useMedicationStore = create<MedicationState>()(
  persist(
    (set, get) => ({
      medications: [],
      dependents: [],
      selectedDependentId: null,
      invites: [],
      streak: 0,
      history: [],
      isLoading: false,
      error: null,

      setMedications: (medications) => set({ medications }),

      fetchMedications: async (userId?: string) => {
        set({ isLoading: true });
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData?.user) {
            set({ medications: [], isLoading: false });
            return;
          }
          const user = authData.user;

          const targetUserId = userId || user.id;

          const { data, error } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ medications: data || [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false, medications: [] });
        }
      },

      fetchDependents: async () => {
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData?.user) return;
          const user = authData.user;

          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('caregiver_id', user.id);

          if (error) throw error;
          set({ dependents: data || [] });
        } catch (error: any) {
          console.error('Error fetching dependents:', error);
        }
      },

      fetchInvites: async () => {
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData?.user) return;
          const user = authData.user;

          const { data, error } = await supabase
            .from('caregiver_invites')
            .select(`
              *,
              inviter:profiles!inviter_id(full_name, email)
            `)
            .or(`inviter_id.eq.${user.id},invitee_email.eq.${user.email}`)
            .order('created_at', { ascending: false });

          if (error) throw error;
          set({ invites: data || [] });
        } catch (error: any) {
          console.error('Error fetching invites:', error);
        }
      },

      setSelectedDependentId: (id) => {
        set({ selectedDependentId: id });
        get().fetchMedications(id || undefined);
      },

      sendInvite: async (email) => {
        set({ isLoading: true });
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData?.user) throw new Error('User not authenticated');
          const user = authData.user;

          const { error } = await supabase
            .from('caregiver_invites')
            .insert([{ inviter_id: user.id, invitee_email: email, status: 'pending' }]);

          if (error) throw error;
          await get().fetchInvites();
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      acceptInvite: async (inviteId) => {
        set({ isLoading: true });
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData?.user) throw new Error('User not authenticated');
          const user = authData.user;

          // 1. Get invite details
          const { data: invite, error: inviteError } = await supabase
            .from('caregiver_invites')
            .select('*')
            .eq('id', inviteId)
            .single();

          if (inviteError) throw inviteError;

          // 2. Update invite status
          const { error: updateInviteError } = await supabase
            .from('caregiver_invites')
            .update({ status: 'accepted' })
            .eq('id', inviteId);

          if (updateInviteError) throw updateInviteError;

          // 3. Link caregiver to dependent profile
          const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({ caregiver_id: user.id })
            .eq('id', invite.inviter_id);

          if (updateProfileError) throw updateProfileError;

          await get().fetchInvites();
          await get().fetchDependents();
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      rejectInvite: async (inviteId) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('caregiver_invites')
            .update({ status: 'rejected' })
            .eq('id', inviteId);

          if (error) throw error;
          await get().fetchInvites();
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addMedication: async (medication) => {
        set({ isLoading: true });
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData?.user) throw new Error('User not authenticated');
          const user = authData.user;

          const newMedication = {
            ...medication,
            user_id: user.id,
            status: 'pending',
          };

          const { data, error } = await supabase
            .from('medications')
            .insert([newMedication])
            .select()
            .single();

          if (error) throw error;
          set((state) => ({
            medications: [data, ...state.medications],
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateMedication: async (id, updates) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('medications')
            .update(updates)
            .eq('id', id);

          if (error) throw error;
          set((state) => ({
            medications: state.medications.map((m) =>
              m.id === id ? { ...m, ...updates } : m
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateStatus: async (id, status) => {
        set({ isLoading: true });
        try {
          const med = get().medications.find(m => m.id === id);
          let invUpdate = {};

          // If marking as taken, decrement inventory
          if (status === 'taken' && med && med.status !== 'taken') {
            invUpdate = { inventory_count: Math.max(0, med.inventory_count - 1) };
          }
          // If reverting from taken, increment inventory
          else if (status !== 'taken' && med && med.status === 'taken') {
            invUpdate = { inventory_count: med.inventory_count + 1 };
          }

          const updates = { status, ...invUpdate };

          const { error } = await supabase
            .from('medications')
            .update(updates)
            .eq('id', id);

          if (error) throw error;
          set((state) => ({
            medications: state.medications.map((m) =>
              m.id === id ? { ...m, ...updates } : m
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      refillMedication: async (id, amount) => {
        set({ isLoading: true });
        try {
          const med = get().medications.find(m => m.id === id);
          if (!med) throw new Error('Medication not found');

          const newCount = med.inventory_count + amount;
          const { error } = await supabase
            .from('medications')
            .update({ inventory_count: newCount })
            .eq('id', id);

          if (error) throw error;
          set((state) => ({
            medications: state.medications.map((m) =>
              m.id === id ? { ...m, inventory_count: newCount } : m
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteMedication: async (id) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', id);

          if (error) throw error;
          set((state) => ({
            medications: state.medications.filter((m) => m.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      checkDailyReset: () => {
        const lastReset = localStorage.getItem('lastResetDate');
        const today = new Date().toDateString();

        if (lastReset !== today) {
          const state = get();
          const taken = state.medications.filter(m => m.status === 'taken').length;
          const total = state.medications.length;

          // Record history
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const newHistoryDay = {
            date: yesterday.toDateString(),
            taken,
            total
          };

          // Update streak
          let newStreak = state.streak;
          if (total > 0 && taken === total) {
            newStreak += 1;
          } else if (total > 0) {
            newStreak = 0;
          }

          // Reset status on Supabase for all meds? 
          // Usually daily resets are local or handled via a cron.
          // For this MVP, we will update local state and Supabase.
          const resetMeds = state.medications.map(m => ({ ...m, status: 'pending' as const }));

          set({
            medications: resetMeds,
            streak: newStreak,
            history: [newHistoryDay, ...state.history].slice(0, 30)
          });

          localStorage.setItem('lastResetDate', today);

          // Note: In a real SaaS, we'd batch update Supabase here.
        }
      },

      clearStore: () => set({ medications: [], streak: 0, history: [], error: null, isLoading: false }),
    }),
    {
      name: 'medication-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        medications: state.medications,
        streak: state.streak,
        history: state.history
      }),
    }
  )
);
