'use client';

import React, { useMemo } from 'react';
import { useMedicationStore } from '@/store/useMedicationStore';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Printer, FileText, Download } from 'lucide-react';

export default function DoctorsReport() {
    const { medications, history } = useMedicationStore();

    const stats = useMemo(() => {
        const last30Days = eachDayOfInterval({
            start: subDays(new Date(), 29),
            end: new Date()
        });

        const adherenceData = last30Days.map(date => {
            const dateStr = date.toDateString();
            const record = history.find(h => h.date === dateStr);
            return record && record.total > 0 ? (record.taken / record.total) : 1;
        });

        const averageAdherence = adherenceData.reduce((a, b) => a + b, 0) / adherenceData.length;

        return {
            averageAdherence: Math.round(averageAdherence * 100),
            period: `${format(subDays(new Date(), 29), 'MMM dd, yyyy')} - ${format(new Date(), 'MMM dd, yyyy')}`
        };
    }, [history]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 no-print">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Doctor's Report
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">Generate a printable adherence summary for your next visit</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all hover:scale-105"
                >
                    <Printer className="w-4 h-4" />
                    Print Report
                </button>
            </div>

            {/* Printable Area */}
            <div id="printable-report" className="print:p-0">
                <div className="border-b-2 border-slate-100 pb-6 mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Medication Adherence Report</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Generated: {format(new Date(), 'PPP')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-teal-600 font-black text-xl">{stats.averageAdherence}% Adherence</p>
                        <p className="text-slate-400 text-xs font-bold">{stats.period}</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Current Medications</h4>
                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Medication</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Dosage</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Frequency</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Schedule</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {medications.map((med) => (
                                        <tr key={med.id}>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{med.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{med.dosage || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{med.frequency || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-black text-teal-600">{med.time || 'Not set'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Notes & Observations</h4>
                        <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl p-4">
                            <p className="text-slate-300 text-sm font-medium italic">Enter doctor's notes here...</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end opacity-50 text-[10px] font-bold uppercase tracking-widest">
                    <span>Generated by MediRemind AI</span>
                    <span>Patient Signature: _______________________</span>
                </div>
            </div>

        </div>
    );
}
