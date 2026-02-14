import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type MedicationStatus = 'pending' | 'taken' | 'missed';

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
  addMedication: (medication: Omit<Medication, 'id' | 'status' | 'lastActionDate'>) => void;
  removeMedication: (id: string) => void;
  updateStatus: (id: string, status: MedicationStatus) => void;
  checkDailyReset: () => void;
}

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set) => ({
      medications: [],
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
          const needsReset = state.medications.some(med => med.lastActionDate !== today);

          if (!needsReset) return state;

          return {
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
