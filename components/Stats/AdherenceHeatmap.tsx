'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useMedicationStore } from '@/store/useMedicationStore';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function AdherenceHeatmap() {
    const { history } = useMedicationStore();

    const data = useMemo(() => {
        const last30Days = eachDayOfInterval({
            start: subDays(new Date(), 29),
            end: new Date()
        });

        return last30Days.map(date => {
            const dateStr = date.toDateString();
            const record = history.find(h => h.date === dateStr);
            const percentage = record && record.total > 0
                ? (record.taken / record.total) * 100
                : 0;

            return {
                date: format(date, 'MMM dd'),
                fullDate: dateStr,
                percentage,
                taken: record?.taken || 0,
                total: record?.total || 0
            };
        });
    }, [history]);

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Adherence Heatmap</h3>
                    <p className="text-sm text-slate-500 font-medium">Tracking your persistence over the last 30 days</p>
                </div>
            </div>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            interval={5}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-800 shadow-xl text-xs">
                                            <p className="font-bold mb-1">{item.fullDate}</p>
                                            <p className="text-teal-400">{item.taken} of {item.total} doses taken</p>
                                            <p className="text-slate-400">{Math.round(item.percentage)}% Adherence</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="percentage" radius={[4, 4, 4, 4]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.total === 0 ? '#f1f5f9' : entry.percentage === 100 ? '#0d9488' : entry.percentage > 50 ? '#2dd4bf' : entry.percentage > 0 ? '#99f6e4' : '#fee2e2'}
                                    className="dark:fill-slate-800"
                                    style={entry.total > 0 ? { fill: entry.percentage === 100 ? '#0d9488' : entry.percentage > 50 ? '#2dd4bf' : entry.percentage > 0 ? '#99f6e4' : '#ef4444' } : {}}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-100 dark:bg-red-900/40 rounded-sm" />
                    <span>0%</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-teal-100 dark:bg-teal-900/40 rounded-sm" />
                    <span>50%</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-teal-600 rounded-sm" />
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
}
