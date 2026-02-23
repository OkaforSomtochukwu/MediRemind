import { Medication } from '@/store/useMedicationStore';

export function checkMissedDoses(medications: Medication[]): Medication[] {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return medications.filter(med => {
        if (med.status !== 'pending' || !med.time) return false;

        const [hour, minute] = med.time.split(':').map(Number);

        // Calculate dose time today
        const doseTime = new Date();
        doseTime.setHours(hour, minute, 0, 0);

        // One hour after dose time
        const thresholdTime = new Date(doseTime.getTime() + 60 * 60 * 1000);

        // Return true if it's currently at least one hour past the scheduled time
        return now >= thresholdTime;
    });
}
