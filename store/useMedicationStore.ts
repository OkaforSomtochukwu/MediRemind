import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  lastActionDate: string; // YYYY-MM-DD
};

interface MedicationStore {
  medications: Medication[];
  streak: number;
  history: DailyStats[];
  addMedication: (medication: Omit<Medication, 'id' | 'status' | 'lastActionDate'>) => void;
  removeMedication: (id: string) => void;
  updateStatus: (id: string, status: MedicationStatus) => void;
  checkDailyReset: () => void;
}

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set) => ({
      medications: [],
      streak: 0,
      history: [],
      addMedication: (medication) =>
        set((state) => ({
          medications: [
            ...state.medications,
            {
              ...medication,
              id: crypto.randomUUID(),
              status: 'pending',
              lastActionDate: new Date().toISOString().split('T')[0]
            },
          ],
        })),
      removeMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((med) => med.id !== id),
        })),
      updateStatus: (id, status) =>
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id
              ? { ...med, status, lastActionDate: new Date().toISOString().split('T')[0] }
              : med
          ),
        })),
      checkDailyReset: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          // Check if any medication has a lastActionDate that is NOT today
          // If so, it means we entered a new day and need to process yesterday's data
          const needsReset = state.medications.some(med => med.lastActionDate !== today);

          if (!needsReset) return state;

          // Calculate stats for the previous day (assumed to be the last recorded action date or yesterday)
          // For simplicity in this logic, we look at the current state before resetting.
          // If all meds were 'taken', increment streak.
          // Note: This logic assumes "yesterday" was fully tracked. 
          // If the user skips a day entirely, this simple logic might need enhancement, 
          // but for now we reset based on the transition.

          const totalMeds = state.medications.length;
          const takenMeds = state.medications.filter(med => med.status === 'taken').length;
          const allTaken = totalMeds > 0 && totalMeds === takenMeds;

          // Add to history
          const yesterdayStats: DailyStats = {
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Approximation of yesterday
            total: totalMeds,
            taken: takenMeds
          };

          const newHistory = [yesterdayStats, ...state.history].slice(0, 7); // Keep last 7 days

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
