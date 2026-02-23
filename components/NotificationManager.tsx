'use client';

import { useEffect, useRef } from 'react';
import { useMedicationStore } from '@/store/useMedicationStore';
import { supabase } from '@/lib/supabase';

export default function NotificationManager() {
    const medications = useMedicationStore((state) => state.medications);
    // Keep track of notified times to avoid spamming multiple notifications for the same minute
    const notifiedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Request permission on mount if not determined
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const sendNotification = async (title: string, options: NotificationOptions) => {
            if (Notification.permission !== 'granted') return;

            // Try to use Service Worker registration for "Native" background feel
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification(title, options);
            } else {
                // Fallback to standard Notification API
                new Notification(title, options);
            }
        };

        const checkReminders = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            });

            if (currentTime === '00:00') {
                notifiedRef.current.clear();
            }

            medications.forEach((med) => {
                const notificationKey = `${med.id}-${currentTime}`;

                if (
                    med.time === currentTime &&
                    med.status === 'pending' &&
                    !notifiedRef.current.has(notificationKey)
                ) {
                    sendNotification(`Medication Reminder: ${med.name}`, {
                        body: `It's time for your ${med.dosage} dose. Tap to view details.`,
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/icon-192x192.png',
                        tag: 'medication-reminder',
                    });

                    notifiedRef.current.add(notificationKey);
                }
            });
        };

        const checkDependentMissedDoses = async () => {
            if (Notification.permission !== 'granted') return;

            const { data, error: authError } = await supabase.auth.getUser();
            const user = data?.user;
            if (authError || !user) return;

            // Get users who have this person as their caregiver
            const { data: dependents } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('caregiver_id', user.id);

            if (!dependents || dependents.length === 0) return;

            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            });

            for (const dep of dependents) {
                const { data: meds } = await supabase
                    .from('medications')
                    .select('*')
                    .eq('user_id', dep.id)
                    .eq('status', 'pending');

                if (!meds) continue;

                meds.forEach(med => {
                    if (!med.time) return;

                    // Parse med time (HH:mm)
                    const [hour, minute] = med.time.split(':').map(Number);
                    const medTime = new Date();
                    medTime.setHours(hour, minute, 0, 0);

                    // If medTime + 1 hour < now, it's missed
                    const oneHourLater = new Date(medTime.getTime() + 60 * 60 * 1000);

                    const notificationKey = `missed-${med.id}-${currentTime.split(':')[0]}`;

                    if (now > oneHourLater && !notifiedRef.current.has(notificationKey)) {
                        sendNotification(`Dependent Alert: ${dep.full_name}`, {
                            body: `${dep.full_name} has missed their ${med.name} dose scheduled for ${med.time}.`,
                            icon: '/icons/icon-192x192.png',
                            badge: '/icons/icon-192x192.png',
                            tag: 'missed-dose-alert',
                        });
                        notifiedRef.current.add(notificationKey);
                    }
                });
            }
        };

        // Check every 30 seconds for personal reminders
        const interval = setInterval(() => {
            checkReminders();
            // Check dependents every 5 minutes to avoid hitting Supabase too hard
            if (new Date().getMinutes() % 5 === 0) {
                checkDependentMissedDoses();
            }
        }, 30 * 1000);

        // Initial check
        checkReminders();
        checkDependentMissedDoses();

        return () => clearInterval(interval);
    }, [medications]);

    return null; // Headless component
}
