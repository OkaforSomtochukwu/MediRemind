'use client';

import { useEffect, useRef } from 'react';
import { useMedicationStore } from '@/store/useMedicationStore';

export default function NotificationManager() {
    const medications = useMedicationStore((state) => state.medications);
    // Keep track of notified times to avoid spamming multiple notifications for the same minute
    const notifiedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Request permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkReminders = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            // Format time as HH:MM
            const currentTime = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            });

            // Reset notified set at midnight (optional, but good for cleanup)
            if (currentTime === '00:00') {
                notifiedRef.current.clear();
            }

            medications.forEach((med) => {
                // Only notify if:
                // 1. Time matches
                // 2. Status is pending
                // 3. Haven't notified for this specific med + time today (using a composite key)
                const notificationKey = `${med.id}-${currentTime}`;

                if (
                    med.time === currentTime &&
                    med.status === 'pending' &&
                    !notifiedRef.current.has(notificationKey)
                ) {
                    // Send notification
                    new Notification(`Time to take ${med.name}`, {
                        body: `Don't forget your ${med.dosage} of ${med.name}.`,
                        icon: '/file.svg', // Fallback icon
                    });

                    // Mark as notified
                    notifiedRef.current.add(notificationKey);
                }
            });
        };

        // Check every 30 seconds to be safe, but logic prevents duplicates
        const interval = setInterval(checkReminders, 30 * 1000);

        // Initial check
        checkReminders();

        return () => clearInterval(interval);
    }, [medications]);

    return null; // Headless component
}
