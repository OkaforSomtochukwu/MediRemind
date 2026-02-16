import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type MedicationStatus = 'pending' | 'taken' | 'missed';

export type DailyStats = {
  date: string;
  total: number;
  taken: number;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  status: MedicationStatus;
  lastActionDate?: string; // Made optional as per new addMedication signature
};

interface MedicationStore {
  medications: Medication[];
  streak: number;
  history: DailyStats[];
  addMedication: (medication: Omit<Medication, 'id' | 'status' | 'lastActionDate'>) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  updateStatus: (id: string, status: MedicationStatus) => Promise<void>;
  checkDailyReset: () => void;
  fetchMedications: () => Promise<void>;
}

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      medications: [],
      streak: 0,
      history: [],

      fetchMedications: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch medications
        const { data: meds, error } = await supabase
          .from('medications')
          .select('*')
          .eq('user_id', session.user.id);

        if (meds) {
          set({ medications: meds as Medication[] });
        }

        // Fetch stats if we had a table for it, for now we keep stats local/synced or just re-calc
        // For simplicity and MVP, we rely on local persist for history/streak or 
        // we would need a separate table. Given constraints, we'll sync medications only for now
        // and let local persist handle the rest, or ideally sync history too.
        // Let's assume we just sync medications for this step to meet the requirement.
      },

      addMedication: async (medication) => {
        const newMed = {
          ...medication,
          id: crypto.randomUUID(),
          status: 'pending' as const,
          lastActionDate: new Date().toISOString().split('T')[0] // Initialize lastActionDate
        };

        // Optimistic update
        set((state) => ({ medications: [...state.medications, newMed] }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('medications').insert({
            ...newMed,
            user_id: session.user.id
          });
        }
      },

      removeMedication: async (id) => {
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('medications').delete().eq('id', id);
        }
      },

      updateStatus: async (id, status) => {
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, status, lastActionDate: new Date().toISOString().split('T')[0] } : m
          ),
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('medications').update({
            status,
            lastActionDate: new Date().toISOString().split('T')[0]
          }).eq('id', id);
        }
      },

      checkDailyReset: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const needsReset = state.medications.some(med => med.lastActionDate !== today);

          if (!needsReset) return state;

          const totalMeds = state.medications.length;
          const takenMeds = state.medications.filter(med => med.status === 'taken').length;
          const allTaken = totalMeds > 0 && totalMeds === takenMeds;

          const yesterdayStats: DailyStats = {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            total: totalMeds,
            taken: takenMeds
          };

          const newHistory = [yesterdayStats, ...state.history].slice(0, 7);

          return {
            streak: allTaken ? state.streak + 1 : 0,
            history: newHistory,
            medications: state.medications.map((med) => {
              if (med.lastActionDate !== today) {
                return { ...med, status: 'pending', lastActionDate: today };
              }
              return med;
            }),
          };
        }),
    }),
    {
      name: 'medication-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
